import { PrismaClient } from "@prisma/client";
import pdfParse from "pdf-parse";

const prisma = new PrismaClient();

const SOURCE = {
  name: "İnform",
  productUrl: "https://www.inform.com.tr/forte.html",
  pdfUrl: "https://www.inform.com.tr/dosya/pdf/forte.pdf",
};

const slugify = (value) =>
  value.toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "GucMarket-CatalogImporter/1.0" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "GucMarket-CatalogImporter/1.0" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function extractMeta(html, property) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

function extractImage(html) {
  return (
    extractMeta(html, "og:image") ||
    extractMeta(html, "twitter:image") ||
    null
  );
}

function parseForteModels(text) {
  const normalized = text.replace(/\r/g, "").replace(/\u00a0/g, " ");
  const modelStart = normalized.indexOf("MODEL");
  const powerStart = normalized.indexOf("Çıkış Gücü", modelStart);
  if (modelStart < 0 || powerStart < 0) {
    throw new Error("FORTE PDF model tablosu bulunamadı.");
  }

  const modelSection = normalized.slice(modelStart, powerStart);
  const modelCodes = [...modelSection.matchAll(/FORTE\s+(\d{5})/g)]
    .map((m) => m[1])
    .filter((value, index, arr) => arr.indexOf(value) === index);

  const powerLine = normalized.slice(powerStart).match(
    /Çıkış Gücü\s*\(kVA\)\s*([0-9\s]+)/
  );
  if (!powerLine) throw new Error("FORTE güç satırı bulunamadı.");

  const powers = powerLine[1]
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(Number.isFinite);

  if (!modelCodes.length || modelCodes.length !== powers.length) {
    throw new Error(
      `FORTE model/güç eşleşmesi hatalı: ${modelCodes.length} model, ${powers.length} güç.`,
    );
  }

  return modelCodes.map((code, index) => ({
    model: `FORTE ${code}`,
    powerKva: powers[index],
    activePowerKw: powers[index],
  }));
}

function commonForteValues() {
  return {
    upsType: "Statik",
    topology: "Online",
    inputPhase: "3F",
    inputVoltageRange: "380V / 400V / 415V",
    outputPhase: "3F",
    outputVoltageRange: "380V / 400V / 415V",
    frequency: "50 Hz / 60 Hz",
    thdi: "<3%",
    thdv: "<2%",
    efficiency: "96.5",
    physicalStructure: "Tower Kasa",
    dryContact: "Var",
    batteryType: "VRLA",
    displayType: "Dokunmatik LCD",
    parallelOperation: "Var",
    structureType: "Standart",
  };
}

async function getCriterionMap(categoryId) {
  const criteria = await prisma.technicalCriterion.findMany({
    where: { categoryId, active: true },
    select: { id: true, key: true },
  });
  return new Map(criteria.map((item) => [item.key, item.id]));
}

async function main() {
  const run = await prisma.catalogImportRun.create({
    data: {
      sourceName: SOURCE.name,
      baseUrl: "https://www.inform.com.tr",
      status: "RUNNING",
    },
  });

  try {
    const [productHtml, pdfBuffer] = await Promise.all([
      fetchText(SOURCE.productUrl),
      fetchBuffer(SOURCE.pdfUrl),
    ]);

    const pdf = await pdfParse(pdfBuffer);
    const models = parseForteModels(pdf.text);
    const imageUrl = extractImage(productHtml);

    const category = await prisma.category.findUnique({
      where: { slug: "ups-kgk" },
    });
    if (!category) throw new Error("UPS / KGK kategorisi bulunamadı.");

    const brand = await prisma.brand.upsert({
      where: { slug: "inform" },
      update: { name: "İnform", active: true },
      create: { name: "İnform", slug: "inform", active: true },
    });

    const criterionMap = await getCriterionMap(category.id);
    const common = commonForteValues();
    let imported = 0;
    let updated = 0;

    for (const item of models) {
      const slug = slugify(`inform-${item.model}`);
      const existing = await prisma.catalogProduct.findUnique({ where: { slug } });

      const product = await prisma.catalogProduct.upsert({
        where: { slug },
        update: {
          categoryId: category.id,
          brandId: brand.id,
          name: "FORTE",
          model: item.model,
          description: "İnform FORTE serisi, üretici kaynağından otomatik içe aktarılan katalog kaydı.",
          imageUrl,
          sourceUrl: SOURCE.productUrl,
          sourceType: "MANUFACTURER_PDF",
          sourceFetchedAt: new Date(),
          status: "PENDING_REVIEW",
        },
        create: {
          categoryId: category.id,
          brandId: brand.id,
          name: "FORTE",
          model: item.model,
          slug,
          description: "İnform FORTE serisi, üretici kaynağından otomatik içe aktarılan katalog kaydı.",
          imageUrl,
          sourceUrl: SOURCE.productUrl,
          sourceType: "MANUFACTURER_PDF",
          sourceFetchedAt: new Date(),
          status: "PENDING_REVIEW",
        },
      });

      const values = {
        ...common,
        powerKva: String(item.powerKva),
        activePowerKw: String(item.activePowerKw),
      };

      for (const [key, value] of Object.entries(values)) {
        const criterionId = criterionMap.get(key);
        if (!criterionId || value == null || value === "") continue;

        await prisma.catalogProductTechnicalValue.upsert({
          where: {
            catalogProductId_criterionId: {
              catalogProductId: product.id,
              criterionId,
            },
          },
          update: { value },
          create: {
            catalogProductId: product.id,
            criterionId,
            value,
          },
        });
      }

      await prisma.catalogProductSource.create({
        data: {
          catalogProductId: product.id,
          url: SOURCE.pdfUrl,
          sourceType: "MANUFACTURER_PDF",
          title: "İnform FORTE ürün broşürü",
          contentHash: String(pdf.text.length),
        },
      });

      await prisma.catalogImportItem.create({
        data: {
          runId: run.id,
          sourceUrl: SOURCE.productUrl,
          model: item.model,
          status: existing ? "UPDATED" : "IMPORTED",
          rawPayload: {
            model: item.model,
            powerKva: item.powerKva,
            activePowerKw: item.activePowerKw,
            sourceUrl: SOURCE.productUrl,
            pdfUrl: SOURCE.pdfUrl,
            imageUrl,
          },
        },
      });

      if (existing) updated += 1;
      else imported += 1;
    }

    await prisma.catalogImportRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        discovered: models.length,
        imported,
        updated,
      },
    });

    console.log(
      `İnform FORTE import tamamlandı: ${models.length} model bulundu, ${imported} yeni, ${updated} güncellendi.`,
    );
  } catch (error) {
    await prisma.catalogImportRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

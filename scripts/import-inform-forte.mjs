import { PrismaClient } from "@prisma/client";
import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const SOURCE = {
  name: "İnform",
  productUrl: "https://www.inform.com.tr/forte.html",
  pdfUrl: "https://www.inform.com.tr/dosya/urun_dosya/forte600kva.pdf",
};

const IMAGE_PAGE_BY_POWER = {
  10: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-10-kva-online-ups-2/",
  15: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-15-kva-online-ups/",
  20: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-20-kva-online-ups/",
  30: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-30-kva-online-ups-2/",
  40: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-40-kva-online-ups/",
  60: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-60-kva-online-ups/",
  80: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-80-kva-online-ups/",
  100: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-100-kva-online-ups/",
  120: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-120-kva-online-ups/",
  160: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-160-kva-online-ups/",
  200: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-200-kva-online-ups/",
  250: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-250-kva-online-ups/",
  300: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-300-kva-online-ups/",
  400: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/inform-forte-400-kva-online-ups/",
  500: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-500-kva-online-ups/",
  600: "https://eltaelektronik.com/main-shop/ups/online/3-faz-giris-3-faz-cikis/forte-600-kva-online-ups/",
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

function extractImage(html) {
  const $ = cheerio.load(html);
  const metaCandidates = [
    $('meta[property="og:image"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[property="og:image:url"]').attr("content"),
  ].filter(Boolean);

  const imageCandidates = $("img")
    .map((_, el) => ({
      src: $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src"),
      alt: $(el).attr("alt") || "",
    }))
    .get()
    .filter((item) => item.src);

  const ranked = imageCandidates
    .map((item) => ({
      ...item,
      score:
        (/(forte|inform)/i.test(item.alt) ? 10 : 0) +
        (/(forte|inform)/i.test(item.src) ? 10 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  return metaCandidates[0] || ranked[0]?.src || null;
}

function parseForteModels(text) {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ");

  const modelCodes = [...normalized.matchAll(/FORTE\s+(\d{5})/gi)]
    .map((m) => m[1])
    .filter((value, index, arr) => arr.indexOf(value) === index);

  const powerMatch = normalized.match(
    /Çıkış\s+Gücü\s*\(kVA\)\s*([0-9\s]+)/i,
  );

  if (!modelCodes.length) {
    throw new Error("FORTE PDF model kodları bulunamadı.");
  }
  if (!powerMatch) {
    throw new Error("FORTE PDF çıkış gücü satırı bulunamadı.");
  }

  const powers = powerMatch[1]
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(Number.isFinite);

  if (modelCodes.length !== powers.length) {
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
    efficiency: "97",
    physicalStructure: "Tower Kasa",
    dryContact: "Opsiyonel",
    batteryType: "Bakımsız Kuru Tip",
    displayType: "Dokunmatik Ekran",
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

async function getImageUrl(powerKva, fallbackHtml) {
  const pageUrl = IMAGE_PAGE_BY_POWER[powerKva];
  if (pageUrl) {
    try {
      const html = await fetchText(pageUrl);
      const image = extractImage(html);
      if (image) return new URL(image, pageUrl).toString();
    } catch (error) {
      console.warn(
        `Görüntü kaynağı okunamadı (${powerKva} kVA): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return extractImage(fallbackHtml);
}

async function upsertSource(catalogProductId, data) {
  const existing = await prisma.catalogProductSource.findFirst({
    where: { catalogProductId, url: data.url },
  });

  if (existing) {
    await prisma.catalogProductSource.update({
      where: { id: existing.id },
      data: {
        sourceType: data.sourceType,
        title: data.title,
        fetchedAt: new Date(),
        contentHash: data.contentHash,
      },
    });
    return;
  }

  await prisma.catalogProductSource.create({
    data: {
      catalogProductId,
      ...data,
    },
  });
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
      const imageUrl = await getImageUrl(item.powerKva, productHtml);

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

      await upsertSource(product.id, {
        url: SOURCE.pdfUrl,
        sourceType: "MANUFACTURER_PDF",
        title: "İnform FORTE 10-600 kVA ürün broşürü",
        contentHash: String(pdf.text.length),
      });

      const imagePageUrl = IMAGE_PAGE_BY_POWER[item.powerKva];
      if (imagePageUrl) {
        await upsertSource(product.id, {
          url: imagePageUrl,
          sourceType: "MANUFACTURER_WEBSITE",
          title: `FORTE ${item.powerKva} kVA görsel kaynağı`,
          contentHash: imageUrl || null,
        });
      }

      await upsertSource(product.id, {
        url: SOURCE.productUrl,
        sourceType: "MANUFACTURER_WEBSITE",
        title: "İnform FORTE ürün sayfası",
        contentHash: imageUrl || null,
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
            imageSourceUrl: imagePageUrl || SOURCE.productUrl,
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

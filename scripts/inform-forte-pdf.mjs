import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfText(buffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
  });
  const document = await loadingTask.promise;

  try {
    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items
        .map((item) => `${item.str ?? ""}${item.hasEOL ? "\n" : " "}`)
        .join(""));
    }
    return pages.join("\n");
  } finally {
    await loadingTask.destroy();
  }
}

function rowNumbers(text, label, nextLabel) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedNextLabel = nextLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const row = text.match(new RegExp(`${escapedLabel}\\s+([\\d\\s]+?)(?=\\s+${escapedNextLabel})`, "i"));
  return row?.[1].match(/\d+/g)?.map(Number) ?? [];
}

export function parseForteModels(sourceText) {
  const text = sourceText
    .replace(/\u00a0/g, " ")
    .replace(/[\t ]+/g, " ")
    .replace(/\r/g, "");
  const specs = rowNumbers(text, "Çıkış Gücü (kVA)", "Nominal Aktif Güç");
  const activePowers = rowNumbers(text, "Nominal Aktif Güç (kW)", "GİRİŞ");
  const physicalSection = text.match(/FİZİKSEL\s+ÖZELLİKLER([\s\S]*?)(?=Boyutlar\s*\(GxDxY\)|$)/i)?.[1] ?? "";
  const modelCodes = [...physicalSection.matchAll(/(?:^|\D)(\d{5})(?=\D|$)/g)]
    .map((match) => match[1])
    .filter((code, index, codes) => codes.indexOf(code) === index);

  if (!modelCodes.length) throw new Error("FORTE PDF model kodları bulunamadı.");
  if (!specs.length) throw new Error("FORTE PDF çıkış gücü satırı bulunamadı.");
  if (modelCodes.length !== specs.length) {
    throw new Error(`FORTE model/güç eşleşmesi hatalı: ${modelCodes.length} model, ${specs.length} güç.`);
  }
  if (activePowers.length && activePowers.length !== modelCodes.length) {
    throw new Error(`FORTE model/aktif güç eşleşmesi hatalı: ${modelCodes.length} model, ${activePowers.length} güç.`);
  }

  return modelCodes.map((code, index) => ({
    model: `FORTE ${code}`,
    powerKva: specs[index],
    activePowerKw: activePowers[index] ?? specs[index],
  }));
}

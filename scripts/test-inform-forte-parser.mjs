import assert from "node:assert/strict";
import { parseForteModels } from "./inform-forte-pdf.mjs";

const powers = [10, 15, 20, 30, 40, 60, 80, 100, 120, 160, 200, 250, 300, 400, 500, 600];
const codes = ["33010", "33015", "33020", "33030", "33040", "33060", "33080", "33100", "33120", "33160", "33200", "33250", "33300", "33400", "33500", "33600"];
const fixture = `Çıkış Gücü (kVA) ${powers.join("   ")}\nNominal Aktif Güç (kW) ${powers.join("   ")}\nGİRİŞ Faz Sayısı 3Ph+N+PE\nFİZİKSEL ÖZELLİKLER FORTE ${codes.join(" FORTE ")}\nBoyutlar (GxDxY) (cm) - STANDART 40 x 75 x 110`;
const actual = parseForteModels(fixture);

assert.equal(actual.length, 16);
assert.deepEqual(actual.map(({ model }) => model), codes.map((code) => `FORTE ${code}`));
assert.deepEqual(actual.map(({ powerKva }) => powerKva), powers);
assert.deepEqual(actual.map(({ activePowerKw }) => activePowerKw), powers);

assert.throws(
  () => parseForteModels(fixture.replace("500   600\nNominal", "500\nNominal")),
  /model\/güç eşleşmesi hatalı/,
);

if (process.argv.includes("--live")) {
  const response = await fetch("https://www.inform.com.tr/dosya/urun_dosya/forte600kva.pdf");
  assert.equal(response.ok, true, `PDF HTTP ${response.status}`);
  const { extractPdfText } = await import("./inform-forte-pdf.mjs");
  const liveModels = parseForteModels(await extractPdfText(await response.arrayBuffer()));
  assert.equal(liveModels.length, 16);
  assert.deepEqual(liveModels.map(({ powerKva }) => powerKva), powers);
  assert.deepEqual(liveModels.map(({ model }) => model), codes.map((code) => `FORTE ${code}`));
  console.log("Üretici PDF doğrulandı: gerçek PDF'den 16 model ve güç çıkarıldı.");
}

console.log("FORTE PDF ayrıştırma testi başarılı: 16 model ve kVA/kW eşleşmesi doğrulandı.");

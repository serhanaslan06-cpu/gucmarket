import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (value) =>
  value.toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categories = [
  ["UPS / KGK", "Online, Line-Interactive, Modüler", null],
  ["Aküler", "VRLA, AGM, GEL, OPzS, Lityum", null],
  ["OEM & Yedek Parçalar", "IGBT, Kondansatör, Kartlar, Fan", null],
  ["Solar / Güneş Enerjisi", "Güneş Paneli, İnverter, BESS", null],
  ["İnverter / Redresör", "DC Güç Sistemleri, Regülatör", null],
  ["Akü Kabinleri", "Raf ve kabin çözümleri", null],
];

const legacySubcategorySlugs = [
  "ups-kgk-online-ups", "ups-kgk-line-interactive-ups", "ups-kgk-offline-ups", "ups-kgk-moduler-ups", "ups-kgk-dinamik-ups",
  "akuler-vrla", "akuler-opzs", "akuler-opzv", "akuler-li-ion",
  "oem-yedek-parcalar-igbt", "oem-yedek-parcalar-kondansator", "oem-yedek-parcalar-elektronik-kart", "oem-yedek-parcalar-fan", "oem-yedek-parcalar-kontaktor",
  "solar-gunes-enerjisi-gunes-panelleri", "solar-gunes-enerjisi-solar-inverter", "solar-gunes-enerjisi-bess", "solar-gunes-enerjisi-sarj-kontrol-cihazlari",
  "inverter-redresor-inverter", "inverter-redresor-redresor", "inverter-redresor-dc-dc", "inverter-redresor-ac-dc",
  "aku-kabinleri-aku-kabinleri", "aku-kabinleri-aku-raflari", "aku-kabinleri-outdoor-kabinler",
];

const forms = {
  "UPS / KGK": [
    ["upsType","UPS Tipi","SELECT",null,["Statik","Dinamik"]],
    ["topology","UPS Topolojisi","SELECT",null,["Online","Line-interactive","Offline"]],
    ["powerKva","Güç","NUMBER","kVA"],
    ["activePowerKw","Aktif Güç","NUMBER","kW"],
    ["inputPhase","Giriş Fazı","SELECT",null,["1F","3F"]],
    ["inputVoltageRange","Giriş Gerilimi","SELECT",null],
    ["outputPhase","Çıkış Fazı","SELECT",null,["1F","3F"]],
    ["outputVoltageRange","Çıkış Gerilimi","SELECT",null],
    ["frequency","Frekans","SELECT",null,["50 Hz","60 Hz","400 Hz"]],
    ["thdi","THDi","NUMBER","%"],["thdv","THDv","NUMBER","%"],["efficiency","Verim","NUMBER","%"],
    ["outputVoltageAdjustment","Çıkış Voltajı Ayarı","SELECT",null,["Kullanıcı","Teknik Servis"]],
    ["outputFrequencyAdjustment","Çıkış Frekans Ayarı","SELECT",null,["Kullanıcı","Teknik Servis"]],
    ["physicalStructure","Fiziksel Yapı","SELECT",null,["Tower Kasa","Rack Tipi"]],
    ["wheels","Tekerlek","BOOLEAN",null,["Var","Yok"]],
    ["wallFlushMountable","Duvara Sıfır Montajlanabilir","BOOLEAN",null,["Evet","Hayır"]],
    ["batteryVoltage","Akü Gerilimi","NUMBER","VDC"],["batteryRuntime","Akü Süresi","NUMBER","dk"],
    ["externalBatteryCabinet","Harici Akü Kabini Bağlantısı","BOOLEAN",null,["Var","Yok"]],
    ["maxBatteryAh","Maksimum Bağlanabilecek Akü Kapasitesi","NUMBER","Ah"],
    ["internalSnmp","Dahili SNMP","BOOLEAN",null,["Var","Yok"]],
    ["externalSnmp","Harici SNMP","BOOLEAN",null,["Var","Yok"]],
    ["batteryTemperatureMonitoring","Akü Sıcaklık İzleme","BOOLEAN",null,["Var","Yok"]],
    ["dryContact","Kuru Kontak Bağlantısı","BOOLEAN",null,["Var","Yok"]],
    ["batteryType","Akü Tipi","MULTISELECT",null,["VRLA","Li-ion"]],
    ["displayType","Ekran Tipi","MULTISELECT",null,["LCD","LED","Dokunmatik LCD","Grafik LCD","Ekran Yok","Diğer"]],
    ["parallelOperation","Paralel Çalışma","BOOLEAN",null,["Var","Yok"]],
    ["structureType","Yapı","SELECT",null,["Standart","Modüler"]],
  ],
  "Aküler": [
    ["batteryChemistry","Akü Teknolojisi","SELECT",null,["VRLA AGM","VRLA GEL","OPzS","Li-ion","Diğer"]],
    ["voltage","Nominal Gerilim","NUMBER","V"],["capacityAh","Kapasite","NUMBER","Ah"],
    ["terminalType","Terminal Tipi","SELECT",null,["T1","T2","M6","M8","Diğer"]],
    ["designLife","Tasarım Ömrü","NUMBER","yıl"],["maintenanceFree","Bakım Gerektirmez","BOOLEAN",null,["Evet","Hayır"]],
    ["rechargeable","Şarj Edilebilir","BOOLEAN",null,["Evet","Hayır"]],
    ["batteryApplication","Kullanım Alanı","MULTISELECT",null,["UPS","Telekom","Güneş","Enerji Depolama","Diğer"]],
  ],
  "OEM & Yedek Parçalar": [
    ["partType","Parça Tipi","SELECT",null,["IGBT","Kondansatör","Kart","Fan","Kontaktör","Diğer"]],
    ["voltageRating","Gerilim","NUMBER","V"],["currentRating","Akım","NUMBER","A"],
    ["compatibleBrand","Uyumlu Marka","MULTISELECT",null,["Delta","Kehua","Kstar","Schneider","Vertiv","Diğer"]],
    ["original","Orijinal Ürün","BOOLEAN",null,["Evet","Hayır"]],
  ],
  "Solar / Güneş Enerjisi": [
    ["productType","Ürün Tipi","SELECT",null,["Panel","Solar İnverter","BESS","Şarj Kontrol Cihazı","Diğer"]],
    ["ratedPower","Anma Gücü","NUMBER","W"],["maxEfficiency","Maksimum Verim","NUMBER","%"],
    ["dcVoltage","DC Gerilim","NUMBER","V"],["acVoltage","AC Gerilim","NUMBER","V"],
    ["phase","Faz","SELECT",null,["1F","3F"]],
    ["ipClass","IP Koruma Sınıfı","SELECT",null,["IP20","IP54","IP65","IP66","IP68","Diğer"]],
  ],
  "İnverter / Redresör": [
    ["converterType","Ürün Tipi","SELECT",null,["İnverter","Redresör","DC-DC","AC-DC"]],
    ["power","Güç","NUMBER","kW"],["inputVoltage","Giriş Gerilimi","NUMBER","V"],
    ["outputVoltage","Çıkış Gerilimi","NUMBER","V"],["phase","Faz","SELECT",null,["1F","3F"]],
    ["efficiency","Verim","NUMBER","%"],
    ["communication","Haberleşme","MULTISELECT",null,["Modbus TCP/IP","SNMP","RS485","CAN","Kuru Kontak","Diğer"]],
  ],
  "Akü Kabinleri": [
    ["cabinetType","Kabin Tipi","SELECT",null,["Akü Kabini","Akü Rafı","Outdoor Kabin"]],
    ["batteryCount","Akü Adedi","NUMBER","adet"],
    ["batterySize","Akü Boyutu","SELECT",null,["12V 7-9Ah","12V 18-40Ah","12V 65-100Ah","Özel"]],
    ["maxCurrent","Maksimum Akım","NUMBER","A"],
    ["material","Gövde Malzemesi","SELECT",null,["DKP Sac","Paslanmaz","Galvaniz","Diğer"]],
    ["ipClass","IP Koruma Sınıfı","SELECT",null,["IP20","IP54","IP55","IP65","Diğer"]],
  ],
};

const brands = ["Delta","Leoch","Infineon","Trina Solar","Kehua","Kstar","Schneider","Vertiv","TestPower"];

async function main() {
  const categoryMap = new Map();

  for (let i = 0; i < categories.length; i++) {
    const [name, description] = categories[i];
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, description, active: true, sortOrder: i },
      create: { name, slug: slugify(name), description, sortOrder: i },
    });
    categoryMap.set(name, category);
  }

  await prisma.category.updateMany({
    where: { slug: { in: legacySubcategorySlugs } },
    data: { active: false },
  });

  for (const [categoryName, criteria] of Object.entries(forms)) {
    const category = categoryMap.get(categoryName);
    if (!category) continue;
    for (let i = 0; i < criteria.length; i++) {
      const [key,label,dataType,unit,options] = criteria[i];
      const criterion = await prisma.technicalCriterion.upsert({
        where: { categoryId_key: { categoryId: category.id, key } },
        update: { label, dataType, unit: unit ?? null, sortOrder: i, active: true, filterable: true, comparable: true, aiMatching: true },
        create: { categoryId: category.id, key, label, dataType, unit: unit ?? null, sortOrder: i },
      });
      if (options?.length) {
        for (let j = 0; j < options.length; j++) {
          const value = options[j];
          await prisma.criterionOption.upsert({
            where: { criterionId_value: { criterionId: criterion.id, value } },
            update: { label: value, sortOrder: j, active: true },
            create: { criterionId: criterion.id, label: value, value, sortOrder: j },
          });
        }
      }
    }
  }

  for (const name of brands) {
    await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: { name, active: true },
      create: { name, slug: slugify(name) },
    });
  }

  console.log("GüçMarket seed tamamlandı: kategori ağacı, teknik formlar ve markalar oluşturuldu.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

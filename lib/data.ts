export type Criterion={
 key:string;label:string;type:'select'|'number'|'boolean'|'multiselect';
 unit?:string;values?:string[];filterable?:boolean;
 dependsOn?:string;dependentValues?:Record<string,string[]>;
 filterMode?:'exact'|'range'; optionSource?:'admin'|'product';
};

export const categories=[
 {name:'UPS / KGK',desc:'Online, Line-Interactive, Modüler',icon:'⚡'},
 {name:'Aküler',desc:'VRLA, AGM, GEL, OPzS, Lityum',icon:'🔋'},
 {name:'OEM & Yedek Parçalar',desc:'IGBT, Kondansatör, Kartlar, Fan',icon:'🔧'},
 {name:'Solar / Güneş Enerjisi',desc:'Güneş Paneli, İnverter, BESS',icon:'☀️'},
 {name:'İnverter / Redresör',desc:'DC Güç Sistemleri, Regülatör',icon:'▣'},
 {name:'Akü Kabinleri',desc:'Raf ve kabin çözümleri',icon:'▤'}
];

export const categoryCriteria:Record<string,Criterion[]>={
 'UPS / KGK':[
 {key:'upsType',label:'UPS Tipi',type:'select',values:['Statik','Dinamik']},
 {key:'topology',label:'UPS Topolojisi',type:'select',values:['Online','Line-interactive','Offline']},
 {key:'powerKva',label:'Güç',type:'number',unit:'kVA'},
 {key:'activePowerKw',label:'Aktif Güç',type:'number',unit:'kW'},
 {key:'inputPhase',label:'Giriş Fazı',type:'select',values:['1F','3F']},
 {key:'inputVoltageRange',label:'Giriş Gerilimi',type:'select',dependsOn:'inputPhase',filterMode:'exact',optionSource:'product'},
 {key:'outputPhase',label:'Çıkış Fazı',type:'select',values:['1F','3F']},
 {key:'outputVoltageRange',label:'Çıkış Gerilimi',type:'select',dependsOn:'outputPhase',filterMode:'exact',optionSource:'product'},
 {key:'frequency',label:'Frekans',type:'select',values:['50 Hz','60 Hz','400 Hz']},
 {key:'thdi',label:'THDi',type:'number',unit:'%'},
 {key:'thdv',label:'THDv',type:'number',unit:'%'},
 {key:'efficiency',label:'Verim',type:'number',unit:'%'},
 {key:'outputVoltageAdjustment',label:'Çıkış Voltajı Ayarı',type:'select',values:['Kullanıcı','Teknik Servis']},
 {key:'outputFrequencyAdjustment',label:'Çıkış Frekans Ayarı',type:'select',values:['Kullanıcı','Teknik Servis']},
 {key:'physicalStructure',label:'Fiziksel Yapı',type:'select',values:['Tower Kasa','Rack Tipi']},
 {key:'wheels',label:'Tekerlek',type:'boolean',values:['Var','Yok']},
 {key:'wallFlushMountable',label:'Duvara Sıfır Montajlanabilir',type:'boolean',values:['Evet','Hayır']},
 {key:'batteryVoltage',label:'Akü Gerilimi',type:'number',unit:'VDC'},
 {key:'batteryRuntime',label:'Akü Süresi',type:'number',unit:'dk'},
 {key:'externalBatteryCabinet',label:'Harici Akü Kabini Bağlantısı',type:'boolean',values:['Var','Yok']},
 {key:'maxBatteryAh',label:'Maksimum Bağlanabilecek Akü Kapasitesi',type:'number',unit:'Ah'},
 {key:'internalSnmp',label:'Dahili SNMP',type:'boolean',values:['Var','Yok']},
 {key:'externalSnmp',label:'Harici SNMP',type:'boolean',values:['Var','Yok']},
 {key:'batteryTemperatureMonitoring',label:'Akü Sıcaklık İzleme',type:'boolean',values:['Var','Yok']},
 {key:'dryContact',label:'Kuru Kontak Bağlantısı',type:'boolean',values:['Var','Yok']},
 {key:'batteryType',label:'Akü Tipi',type:'multiselect',values:['VRLA','Li-ion']},
 {key:'displayType',label:'Ekran Tipi',type:'multiselect',values:['LCD','LED','Dokunmatik LCD','Grafik LCD','Ekran Yok','Diğer']},
 {key:'parallelOperation',label:'Paralel Çalışma',type:'boolean',values:['Var','Yok']},
 {key:'modular',label:'Modüler',type:'boolean',values:['Var','Yok']}
 ],
 'Aküler':[
 {key:'batteryChemistry',label:'Akü Teknolojisi',type:'select',values:['VRLA AGM','VRLA GEL','OPzS','Li-ion','Diğer']},{key:'voltage',label:'Nominal Gerilim',type:'number',unit:'V'},{key:'capacityAh',label:'Kapasite',type:'number',unit:'Ah'},{key:'terminalType',label:'Terminal Tipi',type:'select',values:['T1','T2','M6','M8','Diğer']},{key:'designLife',label:'Tasarım Ömrü',type:'number',unit:'yıl'},{key:'maintenanceFree',label:'Bakım Gerektirmez',type:'boolean',values:['Evet','Hayır']},{key:'rechargeable',label:'Şarj Edilebilir',type:'boolean',values:['Evet','Hayır']},{key:'batteryApplication',label:'Kullanım Alanı',type:'multiselect',values:['UPS','Telekom','Güneş','Enerji Depolama','Diğer']}
 ],
 'OEM & Yedek Parçalar':[
 {key:'partType',label:'Parça Tipi',type:'select',values:['IGBT','Kondansatör','Kart','Fan','Kontaktör','Diğer']},{key:'voltageRating',label:'Gerilim',type:'number',unit:'V'},{key:'currentRating',label:'Akım',type:'number',unit:'A'},{key:'compatibleBrand',label:'Uyumlu Marka',type:'multiselect',values:['Delta','Kehua','Kstar','Schneider','Vertiv','Diğer']},{key:'original',label:'Orijinal Ürün',type:'boolean',values:['Evet','Hayır']}
 ],
 'Solar / Güneş Enerjisi':[
 {key:'productType',label:'Ürün Tipi',type:'select',values:['Panel','Solar İnverter','BESS','Şarj Kontrol Cihazı','Diğer']},{key:'ratedPower',label:'Anma Gücü',type:'number',unit:'W'},{key:'maxEfficiency',label:'Maksimum Verim',type:'number',unit:'%'},{key:'dcVoltage',label:'DC Gerilim',type:'number',unit:'V'},{key:'acVoltage',label:'AC Gerilim',type:'number',unit:'V'},{key:'phase',label:'Faz',type:'select',values:['1F','3F']},{key:'ipClass',label:'IP Koruma Sınıfı',type:'select',values:['IP20','IP54','IP65','IP66','IP68','Diğer']}
 ],
 'İnverter / Redresör':[
 {key:'converterType',label:'Ürün Tipi',type:'select',values:['İnverter','Redresör','DC-DC','AC-DC']},{key:'power',label:'Güç',type:'number',unit:'kW'},{key:'inputVoltage',label:'Giriş Gerilimi',type:'number',unit:'V'},{key:'outputVoltage',label:'Çıkış Gerilimi',type:'number',unit:'V'},{key:'phase',label:'Faz',type:'select',values:['1F','3F']},{key:'efficiency',label:'Verim',type:'number',unit:'%'},{key:'communication',label:'Haberleşme',type:'multiselect',values:['Modbus TCP/IP','SNMP','RS485','CAN','Kuru Kontak','Diğer']}
 ],
 'Akü Kabinleri':[
 {key:'cabinetType',label:'Kabin Tipi',type:'select',values:['Akü Kabini','Akü Rafı','Outdoor Kabin']},{key:'batteryCount',label:'Akü Adedi',type:'number',unit:'adet'},{key:'batterySize',label:'Akü Boyutu',type:'select',values:['12V 7-9Ah','12V 18-40Ah','12V 65-100Ah','Özel']},{key:'maxCurrent',label:'Maksimum Akım',type:'number',unit:'A'},{key:'material',label:'Gövde Malzemesi',type:'select',values:['DKP Sac','Paslanmaz','Galvaniz','Diğer']},{key:'ipClass',label:'IP Koruma Sınıfı',type:'select',values:['IP20','IP54','IP55','IP65','Diğer']}
 ]
};

export const upsCriteria=categoryCriteria['UPS / KGK'];

export const products=[
 {id:'delta-100',name:'Delta Ultron HPH 100 kVA',brand:'Delta',cat:'UPS / KGK',spec:'100 kVA / 100 kW • 3:3 • Online',price:'485.000 TL',city:'Bursa',seller:'XYZ Enerji',
 technical:{upsType:'Statik',topology:'Online',powerKva:100,activePowerKw:100,inputPhase:'3F',inputVoltageRange:'380-400',outputPhase:'3F',outputVoltageRange:'380-400',frequency:'50 Hz',thdi:3,thdv:2,efficiency:96,outputVoltageAdjustment:'Teknik Servis',outputFrequencyAdjustment:'Teknik Servis',physicalStructure:'Tower Kasa',wheels:'Var',wallFlushMountable:'Hayır',batteryVoltage:384,batteryRuntime:10,externalBatteryCabinet:'Var',maxBatteryAh:200,internalSnmp:'Var',externalSnmp:'Var',batteryTemperatureMonitoring:'Var',dryContact:'Var',batteryType:['VRLA'],displayType:['LCD'],parallelOperation:'Var',modular:'Hayır'}},
 {id:'leoch-100',name:'LEOCH 12V 100Ah',brand:'Leoch',cat:'Aküler',spec:'VRLA AGM • 12V 100Ah',price:'5.250 TL',city:'İstanbul',seller:'ABC Güç',technical:{batteryChemistry:'VRLA AGM',voltage:12,capacityAh:100,terminalType:'T2',designLife:10,maintenanceFree:'Evet',rechargeable:'Evet',batteryApplication:['UPS','Telekom']}},
 {id:'igbt-300',name:'Infineon FF300R12ME4',brand:'Infineon',cat:'OEM & Yedek Parçalar',spec:'IGBT • 1200V / 300A',price:'12.800 TL',city:'Ankara',seller:'Mega Elektronik',technical:{partType:'IGBT',voltageRating:1200,currentRating:300,compatibleBrand:['Delta','Kehua'],original:'Evet'}},
 {id:'trina-550',name:'Trina Solar 550W',brand:'Trina Solar',cat:'Solar / Güneş Enerjisi',spec:'Monokristal Güneş Paneli',price:'3.150 TL',city:'İzmir',seller:'SolarTech',technical:{productType:'Panel',ratedPower:550,maxEfficiency:21.5,dcVoltage:41,acVoltage:0,phase:'3F',ipClass:'IP68'}},
 {id:'test-ups-60-1f',name:'GüçMarket Test UPS 60 kVA 1F',brand:'TestPower',cat:'UPS / KGK',spec:'60 kVA / 54 kW • 1:1 • Online',price:'Test Verisi',city:'Ankara',seller:'Test Tedarikçi 1',technical:{upsType:'Statik',topology:'Online',powerKva:60,activePowerKw:54,inputPhase:'1F',inputVoltageRange:'230',outputPhase:'1F',outputVoltageRange:'230',frequency:'50 Hz',thdi:4,thdv:2,efficiency:95,outputVoltageAdjustment:'Kullanıcı',outputFrequencyAdjustment:'Kullanıcı',physicalStructure:'Tower Kasa',wheels:'Var',wallFlushMountable:'Hayır',batteryVoltage:240,batteryRuntime:10,externalBatteryCabinet:'Var',maxBatteryAh:200,internalSnmp:'Var',externalSnmp:'Yok',batteryTemperatureMonitoring:'Var',dryContact:'Var',batteryType:['VRLA'],displayType:['LCD'],parallelOperation:'Yok',modular:'Hayır'}}
 ,
 {id:'test-ups-120-3f',name:'GüçMarket Test UPS 120 kVA 3F',brand:'TestPower',cat:'UPS / KGK',spec:'120 kVA / 120 kW • 3:3 • Online',price:'Test Verisi',city:'İstanbul',seller:'Test Tedarikçi 2',technical:{upsType:'Statik',topology:'Online',powerKva:120,activePowerKw:120,inputPhase:'3F',inputVoltageRange:'380-400',outputPhase:'3F',outputVoltageRange:'380-400',frequency:'50 Hz',thdi:3,thdv:1.5,efficiency:97,outputVoltageAdjustment:'Teknik Servis',outputFrequencyAdjustment:'Teknik Servis',physicalStructure:'Tower Kasa',wheels:'Var',wallFlushMountable:'Hayır',batteryVoltage:432,batteryRuntime:15,externalBatteryCabinet:'Var',maxBatteryAh:400,internalSnmp:'Var',externalSnmp:'Var',batteryTemperatureMonitoring:'Var',dryContact:'Var',batteryType:['VRLA','Li-ion'],displayType:['Dokunmatik LCD'],parallelOperation:'Var',modular:'Hayır'}}
 ,
 {id:'test-ups-200-3f-60hz',name:'GüçMarket Test UPS 200 kVA 60 Hz',brand:'TestPower',cat:'UPS / KGK',spec:'200 kVA / 180 kW • 3:3 • Online',price:'Test Verisi',city:'İzmir',seller:'Test Tedarikçi 3',technical:{upsType:'Statik',topology:'Online',powerKva:200,activePowerKw:180,inputPhase:'3F',inputVoltageRange:'380-400',outputPhase:'3F',outputVoltageRange:'380-400',frequency:'60 Hz',thdi:4,thdv:2,efficiency:96,outputVoltageAdjustment:'Kullanıcı',outputFrequencyAdjustment:'Teknik Servis',physicalStructure:'Rack Tipi',wheels:'Yok',wallFlushMountable:'Evet',batteryVoltage:480,batteryRuntime:20,externalBatteryCabinet:'Var',maxBatteryAh:600,internalSnmp:'Var',externalSnmp:'Var',batteryTemperatureMonitoring:'Var',dryContact:'Var',batteryType:['Li-ion'],displayType:['Grafik LCD'],parallelOperation:'Var',modular:'Evet'}}
 ,
 {id:'test-ups-30-1f-240v',name:'GüçMarket Test UPS 30 kVA 240 V',brand:'TestPower',cat:'UPS / KGK',spec:'30 kVA / 27 kW • 1:1 • Online',price:'Test Verisi',city:'Bursa',seller:'Test Tedarikçi 4',technical:{upsType:'Statik',topology:'Line-interactive',powerKva:30,activePowerKw:27,inputPhase:'1F',inputVoltageRange:'240',outputPhase:'1F',outputVoltageRange:'240',frequency:'50 Hz',thdi:5,thdv:3,efficiency:94,outputVoltageAdjustment:'Kullanıcı',outputFrequencyAdjustment:'Kullanıcı',physicalStructure:'Rack Tipi',wheels:'Yok',wallFlushMountable:'Evet',batteryVoltage:192,batteryRuntime:8,externalBatteryCabinet:'Yok',maxBatteryAh:120,internalSnmp:'Yok',externalSnmp:'Var',batteryTemperatureMonitoring:'Yok',dryContact:'Var',batteryType:['VRLA'],displayType:['LED'],parallelOperation:'Yok',modular:'Hayır'}}
 ,
 {id:'test-ups-400-3f-400hz',name:'GüçMarket Test UPS 400 kVA 400 Hz',brand:'TestPower',cat:'UPS / KGK',spec:'400 kVA / 400 kW • 3:3 • Online',price:'Test Verisi',city:'Ankara',seller:'Test Tedarikçi 5',technical:{upsType:'Statik',topology:'Online',powerKva:400,activePowerKw:400,inputPhase:'3F',inputVoltageRange:'380-400',outputPhase:'3F',outputVoltageRange:'380-400',frequency:'400 Hz',thdi:2.5,thdv:1,efficiency:98,outputVoltageAdjustment:'Teknik Servis',outputFrequencyAdjustment:'Teknik Servis',physicalStructure:'Tower Kasa',wheels:'Var',wallFlushMountable:'Hayır',batteryVoltage:480,batteryRuntime:30,externalBatteryCabinet:'Var',maxBatteryAh:1000,internalSnmp:'Var',externalSnmp:'Var',batteryTemperatureMonitoring:'Var',dryContact:'Var',batteryType:['VRLA'],displayType:['Dokunmatik LCD'],parallelOperation:'Var',modular:'Evet'}}
];

export const categories=[
 {name:'UPS / KGK',desc:'Online, Line-Interactive, Modüler',icon:'⚡'},
 {name:'Aküler',desc:'VRLA, AGM, GEL, OPzS, Lityum',icon:'🔋'},
 {name:'OEM & Yedek Parçalar',desc:'IGBT, Kondansatör, Kartlar, Fan',icon:'🔧'},
 {name:'Solar / Güneş Enerjisi',desc:'Güneş Paneli, İnverter, BESS',icon:'☀️'},
 {name:'İnverter / Redresör',desc:'DC Güç Sistemleri, Regülatör',icon:'▣'},
 {name:'Akü Kabinleri',desc:'Raf ve kabin çözümleri',icon:'▤'}
];

export const upsCriteria=[
 {key:'upsType',label:'UPS Tipi',type:'select',values:['Statik','Dinamik']},
 {key:'topology',label:'UPS Topolojisi',type:'select',values:['Online','Line-interactive','Offline']},
 {key:'powerKva',label:'Güç',type:'number',unit:'kVA'},
 {key:'activePowerKw',label:'Aktif Güç',type:'number',unit:'kW'},
 {key:'inputVoltage',label:'Giriş Gerilimi',type:'number',unit:'V'},
 {key:'outputVoltage',label:'Çıkış Gerilimi',type:'number',unit:'V'},
 {key:'inputPhase',label:'Giriş Fazı',type:'select',values:['1F','3F']},
 {key:'outputPhase',label:'Çıkış Fazı',type:'select',values:['1F','3F']},
 {key:'frequency',label:'Frekans',type:'number',unit:'Hz'},
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
];

export const products=[
 {id:'delta-100',name:'Delta Ultron HPH 100 kVA',brand:'Delta',cat:'UPS / KGK',spec:'100 kVA / 100 kW • 3:3 • Online',price:'485.000 TL',city:'Bursa',seller:'XYZ Enerji',technical:{upsType:'Statik',topology:'Online',powerKva:100,activePowerKw:100,inputVoltage:400,outputVoltage:400,inputPhase:'3F',outputPhase:'3F',frequency:50,thdi:3,thdv:2,efficiency:96,outputVoltageAdjustment:'Teknik Servis',outputFrequencyAdjustment:'Teknik Servis',physicalStructure:'Tower Kasa',wheels:'Var',wallFlushMountable:'Hayır',batteryVoltage:384,batteryRuntime:10,externalBatteryCabinet:'Var',maxBatteryAh:200,internalSnmp:'Var',externalSnmp:'Var',batteryTemperatureMonitoring:'Var',dryContact:'Var',batteryType:['VRLA'],displayType:['LCD'],parallelOperation:'Var',modular:'Hayır'}},
 {id:'leoch-100',name:'LEOCH 12V 100Ah',brand:'Leoch',cat:'Aküler',spec:'VRLA AGM • 12V 100Ah',price:'5.250 TL',city:'İstanbul',seller:'ABC Güç'},
 {id:'igbt-300',name:'Infineon FF300R12ME4',brand:'Infineon',cat:'OEM & Yedek Parçalar',spec:'IGBT • 1200V / 300A',price:'12.800 TL',city:'Ankara',seller:'Mega Elektronik'},
 {id:'trina-550',name:'Trina Solar 550W',brand:'Trina Solar',cat:'Solar / Güneş Enerjisi',spec:'Monokristal Güneş Paneli',price:'3.150 TL',city:'İzmir',seller:'SolarTech'}
];

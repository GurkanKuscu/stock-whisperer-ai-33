// BIST hisse kodu -> şirket tam adı (ticari ad)
// Eksik olanlar için ticker fallback olarak kullanılır.
export const COMPANY_NAMES: Record<string, string> = {
  // Bankacılık
  AKBNK: "Akbank",
  GARAN: "Garanti BBVA",
  ISCTR: "İş Bankası (C)",
  YKBNK: "Yapı Kredi",
  HALKB: "Halkbank",
  VAKBN: "Vakıfbank",
  ALBRK: "Albaraka Türk",
  QNBFB: "QNB Finansbank",
  ICBCT: "ICBC Turkey",
  SKBNK: "Şekerbank",
  TSKB: "TSKB",

  // Holding
  KCHOL: "Koç Holding",
  SAHOL: "Sabancı Holding",
  AGHOL: "AG Anadolu Grubu Hold.",
  ALARK: "Alarko Holding",
  ENKAI: "Enka İnşaat",
  GLYHO: "Global Yatırım Hold.",
  TKFEN: "Tekfen Holding",
  TAVHL: "TAV Havalimanları",
  DOHOL: "Doğan Holding",
  ECILC: "EİS Eczacıbaşı İlaç",
  ECZYT: "Eczacıbaşı Yatırım",
  IHLAS: "İhlas Holding",
  NTHOL: "Net Holding",
  PRDGS: "Pergamon Status",

  // Sanayi / Otomotiv
  TOASO: "Tofaş Oto",
  FROTO: "Ford Otosan",
  OTKAR: "Otokar",
  KARSN: "Karsan",
  TTRAK: "Türk Traktör",
  DOAS: "Doğuş Otomotiv",
  ASUZU: "Anadolu Isuzu",

  // Demir-Çelik / Metal
  EREGL: "Ereğli Demir Çelik",
  KRDMD: "Kardemir (D)",
  ISDMR: "İskenderun Demir Çelik",
  CEMTS: "Çemtaş",
  BRSAN: "Borusan Mannesmann",
  BURCE: "Burçelik",

  // Kimya / Petrokimya
  PETKM: "Petkim",
  TUPRS: "Tüpraş",
  AKSA: "Aksa Akrilik",
  HEKTS: "Hektaş",
  DEVA: "Deva Holding",
  POLTK: "Politeknik Metal",

  // Gıda / İçecek
  ULKER: "Ülker Bisküvi",
  CCOLA: "Coca-Cola İçecek",
  AEFES: "Anadolu Efes",
  TUKAS: "Tukaş",
  BANVT: "Banvit",
  PNSUT: "Pınar Süt",
  PINSU: "Pınar Su",
  PETUN: "Pınar Et ve Un",
  KERVT: "Kerevitaş",
  KNFRT: "Konfrut Gıda",
  TATGD: "Tat Gıda",
  PENGD: "Penguen Gıda",

  // Perakende
  BIMAS: "BİM Mağazalar",
  MGROS: "Migros",
  SOKM: "Şok Marketler",
  CRFSA: "CarrefourSA",
  MAVI: "Mavi Giyim",

  // Telekom / Teknoloji
  TCELL: "Turkcell",
  TTKOM: "Türk Telekom",
  ASELS: "Aselsan",
  LOGO: "Logo Yazılım",
  KAREL: "Karel Elektronik",
  NETAS: "Netaş Telekom",
  ARDYZ: "Ard Grup Bilişim",
  INDES: "İndeks Bilgisayar",
  ESCOM: "Escort Teknoloji",
  ARENA: "Arena Bilgisayar",
  KFEIN: "Kafein Yazılım",
  PAPIL: "Papilon Savunma",
  SMART: "Smart Güneş Tek.",

  // Havayolu / Ulaştırma
  THYAO: "Türk Hava Yolları",
  PGSUS: "Pegasus",
  CLEBI: "Çelebi Hava Servisi",
  RYSAS: "Reysaş Lojistik",
  RYGYO: "Reysaş GYO",

  // Enerji
  AKSEN: "Aksa Enerji",
  AKENR: "Akenerji",
  ZOREN: "Zorlu Enerji",
  ODAS: "Odaş Elektrik",
  AYEN: "Ayen Enerji",
  GWIND: "Galata Wind",
  CWENE: "CW Enerji",

  // İnşaat / GYO
  EKGYO: "Emlak Konut GYO",
  ISGYO: "İş GYO",
  AKMGY: "Akmerkez GYO",
  TRGYO: "Torunlar GYO",
  OZKGY: "Özak GYO",
  YGYO: "Yeşil GYO",
  AVGYO: "Avrasya GYO",

  // Çimento / Yapı
  AKCNS: "Akçansa",
  CIMSA: "Çimsa",
  GOLTS: "Göltaş Çimento",
  KONYA: "Konya Çimento",
  NUHCM: "Nuh Çimento",
  CEMAS: "Çemaş Döküm",
  BTCIM: "Batı Çimento",
  BUCIM: "Bursa Çimento",
  AFYON: "Afyon Çimento",

  // Sigorta
  ANSGR: "Anadolu Sigorta",
  AKGRT: "Aksigorta",
  TURSG: "Türkiye Sigorta",
  AGESA: "Agesa Hayat Emeklilik",

  // Tekstil
  YATAS: "Yataş",
  KORDS: "Kordsa",
  BOSSA: "Bossa",
  ARCLK: "Arçelik",
  VESTL: "Vestel",
  VESBE: "Vestel Beyaz Eşya",

  // Madencilik
  KOZAA: "Koza Madencilik",
  KOZAL: "Koza Altın",
  IPEKE: "İpek Doğal Enerji",
  PRKME: "Park Elektrik",

  // Plastik / Ambalaj
  PCILT: "Polinas Plastik",
  PNLSN: "Panelsan",
  PLTUR: "Plastik Türk",
  SASA: "Sasa Polyester",
  ALKIM: "Alkim Kimya",

  // Sağlık
  MPARK: "MLP Sağlık (Medical Park)",
  LKMNH: "Lokman Hekim",
  RTALB: "RTA Laboratuvarları",
  SELEC: "Selçuk Ecza Deposu",

  // Diğer popüler
  KRONT: "Kron Telekomünikasyon",
  KATMR: "Katmerciler",
  GESAN: "Girişim Elektrik",
  ENJSA: "Enerjisa Enerji",
  EUPWR: "Europower Enerji",
  IZINV: "İzmir Demir Çelik",
  KCAER: "Kocaer Çelik",
  CWENE2: "CW Enerji",
  BOBET: "Bobet Beton",
  EUROD: "Euro Yatırım Menkul",
  ATAKP: "Atakey Patates",
  GRSEL: "Gürsel Turizm",
  GENIL: "Gen İlaç",
  ALCTL: "Alcatel Lucent",
  ALMAD: "Altınyağ Madencilik",
};

export function companyName(ticker: string): string {
  return COMPANY_NAMES[ticker.toUpperCase()] ?? ticker;
}

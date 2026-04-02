export const SIGNAL_TR: Record<string, string> = {
  "INSTITUTIONAL RALLY SETUP": "KURUMSAL RALLİ HAZIRLIĞI",
  "EARLY RALLY SETUP":         "ERKEN RALLİ HAZIRLIĞI",
  "MOMENTUM SETUP":            "MOMENTUM HAZIRLIĞI",
  "ACCUMULATION":              "BİRİKİM",
  "BREAKOUT WATCH":            "KIRILIM İZLEME",
  "GOLD BREAKOUT":             "ALTIN KIRILIM",
  "BREAKOUT":                  "KIRILIM",
  "REVERSAL":                  "GERİ DÖNÜŞ",
  "SQUEEZE SETUP":             "SIKIŞTIRMA HAZIRLIĞI",
  "WATCHLIST":                 "İZLEME",
  "TREND FOLLOWING":           "TREND TAKİBİ",
};

export const SMART_MONEY_TR: Record<string, string> = {
  "Passive Accum":  "Pasif Birikim",
  "Active Accum":   "Aktif Birikim",
  "Neutral":        "Nötr",
  "Distribution":   "Dağıtım",
  "Accumulation":   "Birikim",
  "Markup":         "Yükseliş Fazı",
  "Markdown":       "Düşüş Fazı",
};

export const TREND_TR: Record<string, string> = {
  "Strong Bull": "Güçlü Boğa",
  "Bull":        "Boğa",
  "Neutral":     "Nötr",
  "Bear":        "Ayı",
  "Strong Bear": "Güçlü Ayı",
  "Weak Bull":   "Zayıf Boğa",
  "Weak Bear":   "Zayıf Ayı",
};

export function tr(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}

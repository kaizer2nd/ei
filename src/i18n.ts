import type { AppSettings, FarmCondition, NavView } from './types'

type NavLabels = Record<NavView, string>

type Dictionary = {
  productName: string
  subtitle: string
  nav: NavLabels
  farmCondition: string
  optimal: string
  moderate: string
  critical: string
  liveMonitoring: string
  farmIntelligenceScore: string
  smartRecommendations: string
  predictions: string
  timeline: string
  historicalGraphs: string
  zoneView: string
  systemStatus: string
  analyticsCenter: string
  intelligenceHub: string
  settingsTitle: string
  exportCsv: string
  language: string
  alerts: string
  criticalSound: string
  backend: string
  dataTransport: string
  serialBridge: string
  connected: string
  disconnected: string
  lastSync: string
  latency: string
  confidence: string
  priority: string
}

const dictionary: Record<AppSettings['language'], Dictionary> = {
  en: {
    productName: 'DroneFarm AI',
    subtitle: 'Smart agriculture command center',
    nav: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      intelligence: 'Intelligence',
      settings: 'Settings',
    },
    farmCondition: 'Farm Condition',
    optimal: 'Optimal',
    moderate: 'Moderate',
    critical: 'Critical',
    liveMonitoring: 'Live Monitoring',
    farmIntelligenceScore: 'Farm Intelligence Score',
    smartRecommendations: 'Smart Recommendations',
    predictions: 'Prediction System',
    timeline: 'Event Timeline',
    historicalGraphs: 'Historical Graphs',
    zoneView: 'Zone-Based Farm View',
    systemStatus: 'System Status',
    analyticsCenter: 'Analytics Center',
    intelligenceHub: 'Intelligence Hub',
    settingsTitle: 'System Settings',
    exportCsv: 'Download CSV',
    language: 'Language',
    alerts: 'Notification Popups',
    criticalSound: 'Critical Sound Alert',
    backend: 'Backend Integration',
    dataTransport: 'Data Transport',
    serialBridge: 'Serial Bridge',
    connected: 'Live',
    disconnected: 'Offline',
    lastSync: 'Last Sync',
    latency: 'Latency',
    confidence: 'Confidence',
    priority: 'Priority',
  },
  hi: {
    productName: 'DroneFarm AI',
    subtitle: 'Smart kheti command center',
    nav: {
      dashboard: 'डैशबोर्ड',
      analytics: 'एनालिटिक्स',
      intelligence: 'इंटेलिजेंस',
      settings: 'सेटिंग्स',
    },
    farmCondition: 'फार्म स्थिति',
    optimal: 'श्रेष्ठ',
    moderate: 'मध्यम',
    critical: 'गंभीर',
    liveMonitoring: 'लाइव मॉनिटरिंग',
    farmIntelligenceScore: 'फार्म इंटेलिजेंस स्कोर',
    smartRecommendations: 'स्मार्ट सिफारिशें',
    predictions: 'प्रेडिक्शन सिस्टम',
    timeline: 'इवेंट टाइमलाइन',
    historicalGraphs: 'हिस्टोरिकल ग्राफ्स',
    zoneView: 'ज़ोन-आधारित फार्म व्यू',
    systemStatus: 'सिस्टम स्टेटस',
    analyticsCenter: 'एनालिटिक्स सेंटर',
    intelligenceHub: 'इंटेलिजेंस हब',
    settingsTitle: 'सिस्टम सेटिंग्स',
    exportCsv: 'CSV डाउनलोड करें',
    language: 'भाषा',
    alerts: 'नोटिफिकेशन पॉपअप',
    criticalSound: 'क्रिटिकल साउंड अलर्ट',
    backend: 'बैकएंड इंटीग्रेशन',
    dataTransport: 'डेटा ट्रांसपोर्ट',
    serialBridge: 'सीरियल ब्रिज',
    connected: 'लाइव',
    disconnected: 'ऑफलाइन',
    lastSync: 'लास्ट सिंक',
    latency: 'लेटेंसी',
    confidence: 'कॉन्फिडेंस',
    priority: 'प्रायोरिटी',
  },
}

export function t(language: AppSettings['language']): Dictionary {
  return dictionary[language]
}

export function conditionLabel(language: AppSettings['language'], condition: FarmCondition): string {
  const labels = dictionary[language]
  if (condition === 'Optimal') return labels.optimal
  if (condition === 'Moderate') return labels.moderate
  return labels.critical
}

export type AudienceMode = 'executive' | 'general_public' | 'technical';

export interface KPIItem {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  category?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  color?: string;
}

export interface ChartConfig {
  title: string;
  type: 'bar' | 'pie' | 'line' | 'area';
  xAxisKey?: string;
  dataKeys: { key: string; label: string; color: string }[];
  data: ChartDataPoint[];
}

export interface ExtractedTableColumn {
  key: string;
  header: string;
}

export interface ExtractedTableRow {
  [key: string]: string | number;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  title: string;
  documentType: 'factura' | 'investigacion' | 'empresa' | 'otro';
  summary: string;
  executiveSummary: string;
  publicSummary: string;
  technicalSummary: string;
  keyTakeaways: string[];
  kpis: KPIItem[];
  charts: ChartConfig[];
  table?: {
    columns: ExtractedTableColumn[];
    rows: ExtractedTableRow[];
  };
  risksAndOpportunities?: {
    risks: string[];
    opportunities: string[];
  };
  recommendations: string[];
  generatedDiagramUrl?: string;
  rawInputPreview?: {
    fileName?: string;
    fileType?: string;
    previewUrl?: string;
    textExcerpt?: string;
  };
}

export interface SampleScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  fileType: 'image' | 'text';
  content: string; // text or base64/url description
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

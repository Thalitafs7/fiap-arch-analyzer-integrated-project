export enum AnalysisStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  ANALYZED = 'ANALYZED',
  ERROR = 'ERROR'
}

export interface Component {
  name: string;
  type: string;
  description?: string;
}

export interface Risk {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Recommendation {
  id: string;
  description: string;
  targetComponent?: string;
}

export interface AnalysisReport {
  analysisId: string;
  components: Component[];
  risks: Risk[];
  recommendations: Recommendation[];
  summary: string;
  score?: number;
}

export interface AnalysisJobMessage {
  analysisId: string;
  fileUrl: string;
  fileName: string;
}

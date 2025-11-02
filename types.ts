export interface AnalysisResult {
  summary: string;
  pros: string[];
  cons: string[];
  potentialLoopholes: string[];
  potentialChallenges: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
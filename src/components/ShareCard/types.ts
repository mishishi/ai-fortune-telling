export type TemplateType = 'starfield' | 'landscape' | 'neon';

export interface ShareCardData {
  name: string;
  gender: string;
  birthYear?: number;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  overall?: string;
  zodiac?: string;
  element?: string;
  createdAt: string;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
}

export enum Section {
  HOME = 'HOME',
  WORK = 'WORK',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT'
}

export interface Project {
  id: string;
  name: string;
  year: string;
  description: string;
  tags: string[];
  imageUrl: string;
  videoUrl?: string;
  client: string;
  youtubeUrl?: string;
}

export interface TimelineEvent {
  year: number;
  label: string;
  category: 'CINEMA' | 'THEATER' | 'CODE';
}
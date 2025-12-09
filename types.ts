export enum Section {
  HOME = 'HOME',
  TECH = 'TECH',
  MUSIC = 'MUSIC',
  GAME = 'GAME',
  CONTACT = 'CONTACT'
}

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  year: string;
  role: string;
  collaborators?: string[];
  description: string;
  tags: string[];
  imageUrl: string;
  videoUrl?: string;
  client: string;
  youtubeUrl?: string;
  paperSubmission?: string;
  technicalDetails?: {
    title: string;
    overview: string;
    components?: string[];
  };
  links?: {
    github?: string;
    live?: string;
    conference?: string;
  };
}

export interface TimelineEvent {
  year: number;
  label: string;
  category: 'CINEMA' | 'THEATER' | 'CODE';
}

export interface MusicWork {
  // 项目名称（保留用于兼容，或作为fallback）
  title: string;
  // 英文名称（大标题）
  nameEn: string;
  // 中文名称（副标题）
  nameCn: string;
  // 角色/职位
  role: string;
  // 描述信息（具体曲目、合作等）
  description?: string;
  // 奖项信息（可选）
  award?: string;
  // 链接列表（具体曲目链接）
  links: { label: string; url: string }[];
}

export interface MusicCategoryData {
  id: string;
  label: string;
  yearRange?: string;
  works: MusicWork[];
}

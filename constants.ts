import { Project, TimelineEvent } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'pangu',
    name: 'PANGU',
    client: 'A PERFORM',
    year: '2024',
    description: 'A Perform Video shows PANGU-Spatial-Audio-Performance-Control-System',
    tags: ['SPATIAL AUDIO', 'PERFORMANCE', 'CONTROL SYSTEM'],
    imageUrl: 'https://picsum.photos/seed/pangu/1200/800',
    videoUrl: '/a.webm',
    youtubeUrl: 'https://www.youtube.com/embed/SbW4J_I4MYo'
  },
  {
    id: 'renault',
    name: 'RENAULT',
    client: 'PUBLICIS',
    year: '2022',
    description: 'Interactive experience showcasing the new electric vehicle lineup using WebGL and detailed 3D models.',
    tags: ['THREE.JS', 'REACT', 'WEBGL'],
    imageUrl: 'https://picsum.photos/seed/renault/1200/800',
    videoUrl: '/b.webm'
  },
  {
    id: 'biotherm',
    name: 'BIOTHERM',
    client: 'L\'OREAL',
    year: '2022',
    description: 'A clean, ocean-inspired e-commerce experience focusing on sustainability and product efficacy.',
    tags: ['VUE', 'SHOPIFY'],
    imageUrl: 'https://picsum.photos/seed/biotherm/1200/800',
    videoUrl: '/c.webm'
  },
  {
    id: 'diptyque',
    name: 'DIPTYQUE',
    client: 'DIPTYQUE PARIS',
    year: '2021',
    description: 'Immersive candle customization tool allowing users to build their own gift sets.',
    tags: ['REACT', 'CANVAS'],
    imageUrl: 'https://picsum.photos/seed/diptyque/1200/800',
    videoUrl: '/d.webm'
  },
  {
    id: 'chanel',
    name: 'CHANEL',
    client: 'CHANEL',
    year: '2021',
    description: 'High-fidelity digital runway experience for the Fall/Winter collection.',
    tags: ['VIDEO', 'INTERACTIVE'],
    imageUrl: 'https://picsum.photos/seed/chanel/1200/800',
    videoUrl: '/a.webm'
  },
  {
    id: 'louisvuitton',
    name: 'LOUIS VUITTON',
    client: 'LVMH',
    year: '2020',
    description: 'Virtual voyage experience celebrating the history of the trunk maker.',
    tags: ['WEBGL', 'REACT'],
    imageUrl: 'https://picsum.photos/seed/lv/1200/800',
    videoUrl: '/b.webm'
  },
  {
    id: 'cartier',
    name: 'CARTIER',
    client: 'RICHEMONT',
    year: '2020',
    description: 'Interactive jewelry finder with real-time diamond rendering.',
    tags: ['THREE.JS', 'VUE'],
    imageUrl: 'https://picsum.photos/seed/cartier/1200/800',
    videoUrl: '/c.webm'
  },
  {
    id: 'hermes',
    name: 'HERMES',
    client: 'HERMES',
    year: '2019',
    description: 'Playful and illustrative microsite for the holiday season campaign.',
    tags: ['GSAP', 'SVG'],
    imageUrl: 'https://picsum.photos/seed/hermes/1200/800',
    videoUrl: '/d.webm'
  }
];

export const TIMELINE: TimelineEvent[] = [
  { year: 2008, label: 'Start Cinema Studies', category: 'CINEMA' },
  { year: 2013, label: 'Theater Production Lead', category: 'THEATER' },
  { year: 2020, label: 'Discovered Coding', category: 'CODE' },
];

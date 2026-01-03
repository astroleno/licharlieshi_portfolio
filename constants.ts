import { Project, TimelineEvent, MusicCategoryData } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'pangu',
    name: 'PANGU',
    subtitle: 'A Hybrid Camera & Depth-Based Spatial Performance Operating System',
    client: 'A PERFORM',
    year: '2025 Dec',
    role: 'Concept & Lead Design, System Design & Technical Direction, Computer Vision & Depth Sensing Engine',
    collaborators: [
      'Camera & Video Editing: Han',
      'Special Thanks: Pr. Akito Van Troyer'
    ],
    description: 'PanGu is a hybrid performance operating system that uses both standard camera vision and depth cameras to turn physical movement into a three-dimensional performance space. Instead of thinking only in left/right stereo, performers compose and control sound in full 3D, mapping gestures and positions in the room to multichannel speakers and spectral processes. Designed for both live performance and experimental composition, PanGu functions as a spatial instrument and control layer, enabling artists to "play" space itself as a core musical parameter.',
    tags: ['SPATIAL AUDIO', 'COMPUTER VISION', 'PERFORMANCE SYSTEM'],
    imageUrl: 'https://picsum.photos/seed/pangu/1200/800',
    videoUrl: '/pangu.webm',
    // YouTube 演示视频链接（在 Tech 页面中使用 LazyYouTube 按需加载）
    // 已根据用户最新要求更新为新的短链接地址
    youtubeUrl: 'https://youtu.be/dCMUUlnRz4A',
    links: {
      github: 'https://github.com/CharlieSL1/PanGu-Spatial-Audio-Performance-Control-System',
      // Tech 详情页中的「See it Live」按钮也指向相同的演示视频
      live: 'https://youtu.be/dCMUUlnRz4A'
    }
  },
  {
    id: 'welcomeback',
    name: 'WELCOME BACK',
    subtitle: 'AI-powered voice system that brings back the voice of a beloved grandfather through technology',
    client: 'PERSONAL PROJECT',
    year: '2025 Dec',
    role: 'Core System, Concept & Design, Voice Conversion Integration, Embedded System Design, Prototyping',
    collaborators: [
      'Special Thanks: Pr. Akito Van Troyer'
    ],
    description: 'WelcomeBack is an AI-powered voice system that brings back the voice of a beloved grandfather through technology. Using GPT-4 to generate warm, contextual Chinese messages based on time-of-day, the system automatically triggers at random intervals (2-6 hours) and transforms text into the grandfather\'s voice using Seed-VC voice conversion technology. Designed for embedded deployment on Raspberry Pi, WelcomeBack creates spontaneous moments of connection throughout the day, preserving memories and bringing comfort through the familiar voice of a loved one.',
    tags: ['GPT-4', 'SEED-VC', 'EMBEDDED SYSTEM', 'RASPBERRY PI'],
    imageUrl: 'https://picsum.photos/seed/welcomeback/1200/800',
    videoUrl: '/welcomeback.webm',
    // WelcomeBack 在 Tech 详情页中展示的 YouTube 演示视频链接
    // 与 PANGU / DreamPillow 保持一致的配置：一个用于详情页视频容器，一个用于「See it Live」跳转
    // 详情页右侧的 LazyYouTube 会优先使用 youtubeUrl 来创建 iframe
    youtubeUrl: 'https://www.youtube.com/watch?v=OlU-T61ObPk',
    links: {
      github: 'https://github.com/CharlieSL1/Welcome_Back',
      // Tech 页面的「See it Live」按钮，直接跳转到同一个 WelcomeBack 演示视频页面
      live: 'https://www.youtube.com/watch?v=OlU-T61ObPk'
    }
  },
  {
    id: 'cstore',
    name: 'CSTORE',
    subtitle: 'Reframing Text-to-Music from "One-Shot Waveforms" to an Interpretable, Durable, and Editable Csound Specification',
    client: 'IEEE CONFERENCE',
    year: '2025 Dec',
    role: 'Concept & Lead Design, ML Model Development, Csound & Python External Library Implementation, Expert-Supervised Learning',
    collaborators: [
      'Special Thanks: Dr. Richard Boulanger',
      'Dr. Boulanger provided the Csound dataset, technical guidance on Csound implementation and feasibility, opcode instruction, and directional support for the project'
    ],
    paperSubmission: 'Submitted to IEEE Conference on Artificial Intelligence (IEEE CAI)',
    description: 'End-to-end and diffusion models have improved audio fidelity for text-to-music (T2M) generation, yet practical deployment in music production remains limited by the lack of fine-grained control and editability. Most methods map natural-language prompts directly to audio, keeping control at high-level semantics, and the outputs are hard to revise or version. We reframe the task from generating one-shot waveforms to generating an interpretable, durable, and editable sound specification. CStore presents a Csound-based framework that represents generated music as human-readable orchestra and score files, covering fully controllable synthesizer parameters and note-level events.',
    // CStore 技术详情：ML 数据处理流程
    technicalDetails: {
      title: 'Data Processing Pipeline',
      overview: 'The CStore pipeline processes audio through multiple stages: .csd files are converted to .wav, then transformed into mel spectrograms. A CNN model learns the mapping between audio features and Csound parameters through supervised learning, enabling text-to-music generation with fine-grained control.',
      // 架构图：ML 数据处理流程图（.csd → .wav → mel → CNN → .csd）
      architectureImage: '/cstore_flow.webp'
    },
    tags: ['MACHINE LEARNING', 'CSOUND', 'AUDIO SYNTHESIS', 'PYTHON'],
    imageUrl: 'https://picsum.photos/seed/cstore/1200/800',
    videoUrl: '/cstore1.webm',
    links: {
      conference: 'https://www.ieeesmc.org/cai-2026/'
    }
  },
  {
    id: 'dreampillow',
    name: 'DREAM PILLOW',
    subtitle: 'Ultra Sonic OpenAir Multichannel Directional Speaker',
    client: 'RESEARCH PROJECT',
    year: '2025 Dec',
    role: 'Concept & Lead Design, Hardware Design & Circuit Implementation, Ultrasonic Modulation System, Multichannel Control Software, Product 3D Modeling',
    collaborators: [
      'Hardware - MRC Circuits and Systems: LUCA MARCHETTI',
      'Hardware - Phased Array Ultrasound Testing Platform PCB: LUCA MARCHETTI',
      'Video - Camera: Han',
      'Video - Video Editing: Han',
      'Special Thanks: Pr. Akito Van Troyer'
    ],
    description: 'DreamPillow is an innovative ultrasonic OpenAir speaker system designed to address the limitations of traditional multichannel audio systems, which require heavy equipment and complex deployment. By leveraging the highly directional properties of ultrasonic waves, DreamPillow aims to democratize multichannel and spatial audio for mainstream audiences. The system employs 122 ultrasonic transducers arranged in a 4-channel array configuration, capable of projecting audio from four directional positions: Left, Right, Surround Left, and Surround Right, creating an immersive spatial audio experience.',
    technicalDetails: {
      title: 'Testing Platform',
      overview: 'This ultrasonic testing system is designed to characterize the radiation pattern of 40 kHz transducers. The system uses a single MA40S4S transmitter (Tx) mounted on a linear stage to generate ultrasonic signals, and a single MA40S4S receiver (Rx) on a rotational stage to measure the acoustic field at different angles. Position control is managed through the app_v2 MATLAB software interface, which coordinates both stages to automate radiation pattern extraction in a noise-free environment.',
      components: [
        'Rx Single Transducer: MA40S4S receiver in 3D-printed holder, mounted on rotational stage for angular measurements',
        'Tx Single Transducer: MA40S4S transmitter in 3D-printed holder, mounted on linear stage for position adjustment',
        'Tx Transducer Array: 32-element MA40S4S array in 3D-printed holder (display only, no control circuit)',
        'Rotational Stage: Controls Rx transducer angle with internal Arduino, USB, and signal connectors',
        'Linear Stage: Controls Tx transducer position via external box with pre-mounted slider',
        'External Box: Houses Arduino Uno, motor driver, and connectors (Power, Button, Motor, USB)',
        '3D-Printed Joining Part: Pre-connected to the rotational stage, links to the linear stage',
        '12V Power Supply: Powers the linear stage through the external box'
      ],
      // 架构图：DreamPillow 系统三层架构（Audio Layer → Encoding → Decoding）
      architectureImage: '/dreampillow_flow.webp'
    },
    tags: ['HARDWARE DESIGN', 'ULTRASONIC MODULATION', 'C++', '3D PRINTING'],
    imageUrl: 'https://picsum.photos/seed/dreampillow/1200/800',
    videoUrl: '/dreampillow.webm',
    // DreamPillow 在 Tech 详情页中展示的 YouTube 演示视频链接
    // 根据用户最新需求，将原有的长链接（含 /embed/ 和 /watch?v=）统一替换为短链接形式
    // 这样在 LazyYouTube 中提取 videoId 时也能保持一致的解析逻辑
    youtubeUrl: 'https://www.youtube.com/watch?v=dCMUUlnRz4A',
    links: {
      github: 'https://github.com/CharlieSL1/DreamPillow',
      // Tech 页面的「See it Live」按钮也会跳转到同一个 DreamPillow 演示视频
      live: 'https://www.youtube.com/watch?v=dCMUUlnRz4A'
    }
  },
  {
    id: 'qiesax',
    name: 'Qi (ESax)',
    subtitle: 'First Electronic Saxophone with Independent Left-Right Hand Control and Multi-Dimensional Expression',
    client: 'INSTRUMENT DESIGN',
    year: '2025 May',
    role: 'Concept & Lead Design, Sensor Integration, Control System Implementation, Spatial Effects Programming, PCB Design',
    description: 'Qi(ESax) is a groundbreaking electronic saxophone that introduces the first independent left-right hand control concept in electronic wind instruments. By integrating Trill sensors for timbre switching and pitch bending, combined with accelerometer-based spatial effects, Qi(ESax) opens new dimensions for electronic saxophone performance. This innovative control scheme allows performers to manipulate multiple sound parameters simultaneously, creating expressive possibilities that were previously unavailable in traditional electronic wind instruments.',
    tags: ['SENSOR INTEGRATION', 'PCB DESIGN', 'INTERACTION DESIGN', 'TRILL SENSORS'],
    imageUrl: 'https://picsum.photos/seed/qiesax/1200/800',
    videoUrl: '/qi1.webm'
  },
  {
    id: 'boxofworld',
    name: 'BOX OF WORLD',
    subtitle: 'A Visual Modular-Synthesis Sandbox for Creative Exploration and Learning',
    client: 'EDUCATIONAL TOOL',
    year: '2025 Dec',
    role: 'Concept & Lead Design, Visual Interface Design, Synthesis Engine Implementation, Randomization Algorithm, Educational Framework, Prototype 3D Modeling',
    description: 'Box of World is a visual modular-synthesis sandbox that injects controlled randomness to break habitual timbre choices, while serving as an intuitive teaching tool that helps children and beginners quickly grasp synth structure and patching. By combining playful visual design with fundamental synthesis concepts, Box of World boosts creativity, understanding, and fun, making modular synthesis accessible to newcomers while encouraging experienced users to explore beyond their comfort zones.',
    tags: ['CREATIVE CODING', 'VISUAL SYNTHESIS', 'EDUCATION'],
    imageUrl: 'https://picsum.photos/seed/boxofworld/1200/800',
    videoUrl: '/boxofworld1.webm'
  },
  {
    id: 'jazzwithli',
    name: 'JAZZ WITH LI',
    subtitle: 'An Advanced Jazz Music Theory MIDI Dataset',
    client: 'DATASET PROJECT',
    year: '2025 Dec',
    role: 'Concept & Lead Design, Dataset Curation & Annotation, Music Theory Implementation, MIDI Processing Pipeline',
    collaborators: [
      'Special Thanks: Pr. Charles Holbrow'
    ],
    description: 'Jazz with Li is a comprehensive MIDI dataset designed to capture the complexity and nuance of advanced jazz music theory. The dataset includes annotated chord progressions, voicings, and modal interchanges. This resource aims to support machine learning research in jazz composition, automatic harmonization, and style transfer, providing a rich foundation for computational approaches to jazz music generation and analysis.',
    tags: ['DATASET CURATION', 'MUSIC THEORY', 'MIDI PROCESSING', 'MACHINE LEARNING'],
    imageUrl: 'https://picsum.photos/seed/jazzwithli/1200/800',
    videoUrl: '/jazzwithli1.webm'
  }
];

export const TIMELINE: TimelineEvent[] = [
  { year: 2008, label: 'Start Cinema Studies', category: 'CINEMA' },
  { year: 2013, label: 'Theater Production Lead', category: 'THEATER' },
  { year: 2020, label: 'Discovered Coding', category: 'CODE' },
];

export const MUSIC_CATALOG: MusicCategoryData[] = [
  {
    id: 'games',
    label: 'GAMES',
    yearRange: 'NETEASE / INDIE',
    works: [
      {
        title: "AFK Journey",
        nameEn: "AFK JOURNEY",
        nameCn: "剑与远征：启程",
        role: "Composer",
        description: "主题曲 & \"雪中幻影\"",
        links: [{ label: "Theme Song", url: "https://www.youtube.com/watch?v=U8T8zrG4qUc" }]
      },
      {
        title: "Identity V",
        nameEn: "IDENTITY V",
        nameCn: "第五人格",
        role: "Project Coordination / Composer",
        description: "角色主题曲 & 象牙塔系列配乐",
        links: [
          { label: "Joker's Etude", url: "https://www.youtube.com/watch?v=HKRYWgv_aqU" },
          { label: "Margaretha's Stage", url: "https://www.youtube.com/watch?v=R_LX7OJFDJU" },
          { label: "Valletta's Final", url: "https://www.youtube.com/watch?v=4uOmtUEd520" },
          { label: "Mike's Firework", url: "https://www.youtube.com/watch?v=IFO5SW0R-ZY" },
          { label: "Kurt's Rhapsody", url: "https://www.youtube.com/watch?v=ceGiXBcb-u4" },
          { label: "More Songs 1", url: "https://www.youtube.com/watch?v=bqKxoN3PRxc" },
          { label: "More Songs 2", url: "https://www.youtube.com/watch?v=K-M_7aWbIhY" },
          { label: "More Songs 3", url: "https://www.youtube.com/watch?v=TNFb-VlGe2s" },
          { label: "More Songs 4", url: "https://www.youtube.com/watch?v=LPNG80dPpes" },
          { label: "More Songs 5", url: "https://www.youtube.com/watch?v=S9AhzUNbdwc" },
          { label: "More Songs 6", url: "https://www.youtube.com/watch?v=kSeZiVriEUA" },
          { label: "More Songs 7", url: "https://www.youtube.com/watch?v=utvNKgwj9GQ" }
        ]
      },
      {
        title: "Eggy Party",
        nameEn: "EGGY PARTY",
        nameCn: "蛋仔派对",
        role: "Producer / Composer / Lyricist / Recording Engineer",
        description: "主题曲制作 & Zootopia联动录音",
        links: [
          { label: "Magical Ebby", url: "https://www.youtube.com/watch?v=kqvATNNItr8" },
          { label: "Park Carnival", url: "https://www.youtube.com/watch?v=2IDA220xQh0" },
          { label: "Try Everything", url: "https://www.youtube.com/watch?v=jIkyVYUGJwU" }
        ]
      },
      {
        title: "Firefly Assault",
        nameEn: "FIREFLY ASSAULT",
        nameCn: "萤火突击",
        role: "Composer",
        description: "皮肤主题 & 游戏音乐",
        links: [{ label: "Game Theme", url: "https://www.youtube.com/watch?v=TDaXBvz7OZY" }]
      }
    ]
  },
  {
    id: 'tv',
    label: 'TV SERIES',
    yearRange: 'DRAMA / WEB',
    works: [
      {
        title: "The Flame",
        nameEn: "THE FLAME",
        nameCn: "烈焰",
        role: "Composer",
        description: "片头曲 \"燃魂\"",
        links: [{ label: "OP Theme", url: "https://www.youtube.com/watch?v=HM3LjE_esn4" }]
      },
      {
        title: "White Cat Legend",
        nameEn: "WHITE CAT LEGEND",
        nameCn: "大理寺少卿游",
        role: "Composer / Producer",
        description: "离别曲 \"少年行\"",
        links: [{ label: "Farewell Song", url: "https://www.youtube.com/watch?v=lntUZNdgNnk" }]
      },
      {
        title: "Ode to Joy 6",
        nameEn: "ODE TO JOY 6",
        nameCn: "欢乐颂6",
        role: "Producer",
        description: "片尾曲 \"眼里的泪\"",
        links: [{ label: "ED Theme", url: "https://www.youtube.com/watch?v=MBZ6K1yuDy8" }]
      },
      {
        title: "My Divine Emissary",
        nameEn: "MY DIVINE EMISSARY",
        nameCn: "我的神使大人",
        role: "Lyricist / Composer / Producer / Saxophone",
        description: "主题曲 & 插曲",
        links: [
          { label: "时空恋人", url: "https://www.youtube.com/watch?v=XmKsuO6Difw" },
          { label: "Fight for Love", url: "https://www.youtube.com/watch?v=v5-iEX9TMQ0" }
        ]
      },
      {
        title: "Never Too Late",
        nameEn: "NEVER TOO LATE",
        nameCn: "我的助理不简单",
        role: "Composer",
        description: "插曲 \"人间剧场\"",
        links: [{ label: "Insert Song", url: "https://www.youtube.com/watch?v=OJFf03RhF3w" }]
      },
      {
        title: "The Divine Healer",
        nameEn: "THE DIVINE HEALER",
        nameCn: "藏药令",
        role: "Composer / Producer",
        description: "\"生为野草\"",
        links: [
          { label: "MV Version", url: "https://www.youtube.com/watch?v=CXUqBw6bnv0" },
          { label: "Full Version", url: "https://www.youtube.com/watch?v=2DYtT7jeDOo" }
        ]
      }
    ]
  },
  {
    id: 'anime',
    label: 'ANIME',
    yearRange: 'ANIMATION',
    works: [
      {
        title: "Dragon Prince Yuan",
        nameEn: "DRAGON PRINCE YUAN",
        nameCn: "元尊",
        role: "Composer",
        description: "OP \"一笔天元\" & ED \"蟒雀\"",
        award: "QQ Music 2024年度巅峰榜 动漫类最佳单曲",
        links: [
          { label: "OP", url: "https://www.youtube.com/watch?v=zS1KfSTsUCE" },
          { label: "ED", url: "https://www.youtube.com/watch?v=JIbZpzYEqvw" }
        ]
      },
      {
        title: "Oh! My Goddess",
        nameEn: "OH! MY GODDESS",
        nameCn: "异灵少女",
        role: "Lyricist",
        description: "ED \"Goodnight\"",
        links: [{ label: "ED", url: "https://www.youtube.com/watch?v=LGe5VjKTTZQ" }]
      }
    ]
  },
  {
    id: 'live',
    label: 'LIVE',
    yearRange: 'EVENTS',
    works: [
      {
        title: "19th Asian Games",
        nameEn: "19TH ASIAN GAMES",
        nameCn: "杭州第19届亚运会",
        role: "Lyricist & Composer",
        description: "主题区域歌曲 \"未来华章\"",
        links: [{ label: "Feature Article", url: "https://mp.weixin.qq.com/s/BHpdIL8WGdYOQjNj8SJhdg" }]
      },
      {
        title: "QQ Music × Master Kong",
        nameEn: "QQ MUSIC × MASTER KONG",
        nameCn: "QQ音乐 × 康师傅校园歌手大赛",
        role: "Producer / Composer",
        description: "\"有面更有YOUNG\"",
        links: [
          { label: "Performance 1", url: "https://www.youtube.com/watch?v=zcSvzUSX038" },
          { label: "Performance 2", url: "https://www.youtube.com/watch?v=kiLzMiGojk0" }
        ]
      },
      {
        title: "TF Family Idol Tour",
        nameEn: "TF FAMILY IDOL TOUR",
        nameCn: "TF家族巡回演唱会",
        role: "Producer / Arranger",
        description: "全国巡演",
        links: [{ label: "Live Performance", url: "https://www.youtube.com/watch?v=Uq92DHAeFtk" }]
      },
      {
        title: "TikTok Asia Music Festival",
        nameEn: "TIKTOK ASIA MUSIC FESTIVAL",
        nameCn: "TikTok亚洲音乐节",
        role: "Production & Performance Support",
        description: "制作 & 演出支持",
        links: [{ label: "Event Link", url: "https://c6.y.qq.com/base/fcgi-bin/u?__=6NjSW4uh6vXN" }]
      }
    ]
  }
];

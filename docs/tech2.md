Tech 项目：

# **PANGU**

### A Hybrid Camera & Depth-Based Spatial Performance Operating System

---

## Abstract

PanGu is a hybrid performance operating system that uses both standard camera vision and depth cameras to turn physical movement into a three-dimensional performance space. Instead of thinking only in left/right stereo, performers compose and control sound in full 3D, mapping gestures and positions in the room to multichannel speakers and spectral processes. Designed for both live performance and experimental composition, PanGu functions as a spatial instrument and control layer, enabling artists to "play" space itself as a core musical parameter.

## My Role

**Concept & Lead Design, System Design & Technical Direction, Computer Vision & Depth Sensing Engine:** Li (Charlie) Shi 

## Collaborators

**Camera & Video Editing： Han**

**Special Thanks: Pr. Akito Van Troyer**

Github URL:  https://github.com/CharlieSL1/PanGu-Spatial-Audio-Performance-Control-System

! [**PanGu_System_Tutorial**](https://www.youtube.com/watch?v=akYpio9azhE&list=PL-PtPs9ctLuho6d9iaJbYS2LlI-RV7Fjw)

![**PanGu_System_Performance**](https://www.youtube.com/watch?v=SbW4J_I4MYo&list=PL-PtPs9ctLuho6d9iaJbYS2LlI-RV7Fjw&index=2)

Date: 2025 Dec

**Welcome Back**

### AI-powered voice system that brings back the voice of a beloved grandfather through technology

---

![MEANDGRANDPA.jpg](attachment:cd44ace8-53f6-44e2-a15a-ccbcdb2d4dac:MEANDGRANDPA.jpg)

Overview

WelcomeBack is an AI-powered voice system that brings back the voice of a beloved grandfather through technology. Using GPT-4 to generate warm, contextual Chinese messages based on time-of-day, the system automatically triggers at random intervals (2-6 hours) and transforms text into the grandfather's voice using Seed-VC voice conversion technology. Designed for embedded deployment on Raspberry Pi, WelcomeBack creates spontaneous moments of connection throughout the day, preserving memories and bringing comfort through the familiar voice of a loved one.

## My Role

**Core System, Concept & Design, Voice Conversion Integration, Embedded System Design, prototyping:** Li (Charlie) Shi

## Collaborators

**Special Thanks: Pr. Akito Van Troyer**

Github URL: https://github.com/CharlieSL1/Welcome_Back

Date: 2025 Dec

# **CSTORE**

### Reframing Text-to-Music from "One-Shot Waveforms" to an Interpretable, Durable, and Editable Csound Specification

---

## Abstract

End-to-end and diffusion models have improved audio fidelity for text-to-music (T2M) generation, yet practical deployment in music production remains limited by the lack of fine-grained control and editability. Most methods map natural-language prompts directly to audio, keeping control at high-level semantics, and the outputs are hard to revise or version. We reframe the task from generating one-shot waveforms to generating an interpretable, durable, and editable sound specification. We present CStore, a Csound-based framework that represents generated music as human-readable orchestra and score files, covering fully controllable synthesizer parameters and note-level events. CStore exposes two interfaces: (1) Language-to-Parameters (L2P) maps text prompts into a hierarchical control space; (2) Audio-to-Parameters (A2P) performs preset reverse engineering from reference audio. The bidirectional design lets users draft with text and then perform non-destructive edits either by direct parameter tweaks or via target-audio matching.

## My Role

**Concept & Lead Design, ML Model Development, Csound & Python External Library Implementation, Expert-Supervised Learning:** Li (Charlie) Shi

## Collaborators

**Special Thanks: Dr. Richard Boulanger**

Dr. Boulanger provided the Csound dataset, technical guidance on Csound implementation and feasibility, opcode instruction, and directional support for the project.

**Paper Submission:** Submitted to IEEE Conference on Artificial Intelligence (IEEE CAI)

Conference Link: [https://attend.ieee.org/cai/](https://www.ieeesmc.org/cai-2026/)

Github URL: To be filled in

Date: 2025 Dec

# **DreamPillow**

### Ultra Sonic OpenAir Multichannel Directional Speaker

---

![image.png](attachment:622fd685-82ef-48e6-8638-565908f9c205:image.png)

## Abstract

DreamPillow is an innovative ultrasonic OpenAir speaker system designed to address the limitations of traditional multichannel audio systems, which require heavy equipment and complex deployment. By leveraging the highly directional properties of ultrasonic waves, DreamPillow aims to democratize multichannel and spatial audio for mainstream audiences. The system employs 122 ultrasonic transducers arranged in a 4-channel array configuration, capable of projecting audio from four directional positions: Left, Right, Surround Left, and Surround Right, creating an immersive spatial audio experience.

To enhance compatibility and user experience, DreamPillow includes a custom-developed encoder that adapts various channel formats for headphone playback. More importantly, the system was conceived to overcome a fundamental limitation of traditional HRTF (Head-Related Transfer Function) technology—when the brain detects that audio positioning is simulated through algorithmic frequency modulation rather than originating from actual sound sources, spatial localization can be immediately lost. To solve this challenge, DreamPillow integrates real-time head tracking and three-dimensional head scanning capabilities, ensuring that audio spatial positioning remains synchronized with the user's head movements, delivering a more authentic and natural spatial audio experience.

![Structure.png](attachment:4e285916-28e2-4840-9d81-8d9d83009db0:Structure.png)

# Testing platform:

Picture waiting to be embedded

## Testing System Overview

This ultrasonic testing system is designed to characterize the radiation pattern of 40 kHz transducers. The system uses a single MA40S4S transmitter (Tx) mounted on a linear stage to generate ultrasonic signals, and a single MA40S4S receiver (Rx) on a rotational stage to measure the acoustic field at different angles. Position control is managed through the app_v2 MATLAB software interface, which coordinates both stages to automate radiation pattern extraction in a noise-free environment.

## Key Components

- **Rx Single Transducer:** MA40S4S receiver in 3D-printed holder, mounted on rotational stage for angular measurements
- **Tx Single Transducer:** MA40S4S transmitter in 3D-printed holder, mounted on linear stage for position adjustment
- **Tx Transducer Array:** 32-element MA40S4S array in 3D-printed holder (display only, no control circuit)
- **Rotational Stage:** Controls Rx transducer angle with internal Arduino, USB, and signal connectors
- **Linear Stage:** Controls Tx transducer position via external box with pre-mounted slider
- **External Box:** Houses Arduino Uno, motor driver, and connectors (Power, Button, Motor, USB)
- **3D-Printed Joining Part:** Pre-connected to the rotational stage, links to the linear stage
- **12V Power Supply:** Powers the linear stage through the external box

## My Role

**Concept & Lead Design, Hardware Design & Circuit Implementation, Ultrasonic Modulation System, Multichannel Control Software, Product 3D modeling:** Li (Charlie) Shi

## Collaborators

**Hardware**

MRC Circuits and Systems: LUCA MARCHETTI

Phased Array Ultrasound Testing Platform PCB: LUCA MARCHETTI

**Video**

Camera: Han

Video Editing: Han

**Special Thanks**

Pr. Akito Van Troyer

Github URL: https://github.com/CharlieSL1/DreamPillow

Date: 2025 Dec

# **Jazz with Li**

### An Advanced Jazz Music Theory MIDI Dataset

---

Main image placeholder

Additional images placeholder

## Abstract

Jazz with Li is a comprehensive MIDI dataset designed to capture the complexity and nuance of advanced jazz music theory. The dataset includes annotated chord progressions, voicings, and modal interchanges. This resource aims to support machine learning research in jazz composition, automatic harmonization, and style transfer, providing a rich foundation for computational approaches to jazz music generation and analysis.

## My Role

**Concept & Lead Design, Dataset Curation & Annotation, Music Theory Implementation, MIDI Processing Pipeline:** Li (Charlie) Shi

## Collaborators

**Special Thanks: Pr. Charles Holbrow**

Video placeholder: [To be embedded]

Github URL: [To be filled in]

Date: 2025 Dec

# **Box of World**

### A Visual Modular-Synthesis Sandbox for Creative Exploration and Learning

---

Main image placeholder

Additional images placeholder

## Abstract

Box of World is a visual modular-synthesis sandbox that injects controlled randomness to break habitual timbre choices, while serving as an intuitive teaching tool that helps children and beginners quickly grasp synth structure and patching. By combining playful visual design with fundamental synthesis concepts, Box of World boosts creativity, understanding, and fun, making modular synthesis accessible to newcomers while encouraging experienced users to explore beyond their comfort zones.

## My Role

**Concept & Lead Design, Visual Interface Design, Synthesis Engine Implementation, Randomization Algorithm, Educational Framework, Prototype 3D modeling:** Li (Charlie) Shi

## Collaborators

[To be filled in]

Video placeholder: [To be embedded]

Github URL: [To be filled in]

Date: 2025 Dec

# **Qi(ESax)**

### First Electronic Saxophone with Independent Left-Right Hand Control and Multi-Dimensional Expression

---

Main image placeholder

Additional images placeholder

## Abstract

Qi(ESax) is a groundbreaking electronic saxophone that introduces the first independent left-right hand control concept in electronic wind instruments. By integrating Trill sensors for timbre switching and pitch bending, combined with accelerometer-based spatial effects, Qi(ESax) opens new dimensions for electronic saxophone performance. This innovative control scheme allows performers to manipulate multiple sound parameters simultaneously, creating expressive possibilities that were previously unavailable in traditional electronic wind instruments.

## My Role

**Concept & Lead Design, Sensor Integration, Control System Implementation, Spatial Effects Programming, PCB design:** Li (Charlie) Shi

## Collaborators

[To be filled in]

Video placeholder: [To be embedded]

Github URL: [To be filled in]

Date: 2025 May

---

Music 

# **音乐作品**

## 游戏 Games

### 网易游戏合作 • NetEase Catalog

- **AFK Journey (剑与远征：启程)** — 主题曲 & "雪中幻影" | Composer [YouTube](https://www.youtube.com/watch?v=U8T8zrG4qUc)
- **Identity V (第五人格)** — 角色主题曲 & 象牙塔系列配乐 | Project Coordination / Composer
    - "裘克的练习曲" (Joker's Etude) [YouTube](https://www.youtube.com/watch?v=HKRYWgv_aqU)
    - "玛格丽莎的舞台" (Margaretha's Stage) [YouTube](https://www.youtube.com/watch?v=R_LX7OJFDJU)
    - "瓦爾萊塔的終場演出" (Valletta's Final Performance) [YouTube](https://www.youtube.com/watch?v=4uOmtUEd520)
    - "麦克的乐园" (Mike's Firework Show) [YouTube](https://www.youtube.com/watch?v=IFO5SW0R-ZY)
    - "库特的狂想曲" (Kurt's Rhapsody) [YouTube](https://www.youtube.com/watch?v=ceGiXBcb-u4)
    - 更多角色曲 [Link 1](https://www.youtube.com/watch?v=bqKxoN3PRxc)[Link 2](https://www.youtube.com/watch?v=K-M_7aWbIhY)[Link 3](https://www.youtube.com/watch?v=TNFb-VlGe2s)[Link 4](https://www.youtube.com/watch?v=LPNG80dPpes)[Link 5](https://www.youtube.com/watch?v=S9AhzUNbdwc)[Link 6](https://www.youtube.com/watch?v=kSeZiVriEUA)[Link 7](https://www.youtube.com/watch?v=utvNKgwj9GQ)
- **Eggy Party (蛋仔派对)** — 主题曲制作 & Zootopia联动录音 | Producer / Composer / Lyricist / Recording Engineer
    - "神奇蛋比" (Magical Ebby) [YouTube](https://www.youtube.com/watch?v=kqvATNNItr8)
    - "圆宇宙巡游" (Park Carnival) [YouTube](https://www.youtube.com/watch?v=2IDA220xQh0)
    - Zootopia联动 "Try Everything" [YouTube](https://www.youtube.com/watch?v=jIkyVYUGJwU)
- **Firefly Assault (萤火突击)** — 皮肤主题 & 游戏音乐 | Composer [YouTube](https://www.youtube.com/watch?v=TDaXBvz7OZY)

## 电视剧 & 网剧 TV / Web Series

- **烈焰 (Lie Yan / The Flame)** — 片头曲 "燃魂" | Composer [YouTube](https://www.youtube.com/watch?v=HM3LjE_esn4)
- **大理寺少卿游 (White Cat Legend)** — 离别曲 "少年行" | Composer / Producer [YouTube](https://www.youtube.com/watch?v=lntUZNdgNnk)
- **欢乐颂6 (Ode to Joy 6)** — 片尾曲 "眼里的泪" | Producer [YouTube](https://www.youtube.com/watch?v=MBZ6K1yuDy8)
- **我的神使大人 (My Divine Emissary)** — 主题曲 & 插曲 | Lyricist / Composer / Producer / Saxophone
    - "时空恋人" [YouTube](https://www.youtube.com/watch?v=XmKsuO6Difw)
    - "Fight for Love" [YouTube](https://www.youtube.com/watch?v=v5-iEX9TMQ0)
- **我的助理不简单 (Never Too Late)** — 插曲 "人间剧场" | Composer [YouTube](https://www.youtube.com/watch?v=OJFf03RhF3w)
- **藏药令 (The Divine Healer)** — "生为野草" | Composer / Producer [YouTube](https://www.youtube.com/watch?v=CXUqBw6bnv0)[Full Version](https://www.youtube.com/watch?v=2DYtT7jeDOo)

## 动画 Anime

- **元尊 (Dragon Prince Yuan)** — OP "一笔天元" & ED "蟒雀" | Composer
    - OP "一笔天元" [YouTube](https://www.youtube.com/watch?v=zS1KfSTsUCE)
    - ED "蟒雀" [YouTube](https://www.youtube.com/watch?v=JIbZpzYEqvw)
    - *QQ Music 2024年度巅峰榜 动漫类最佳单曲*
- **异灵少女 (Yi Ling Shao Nu / Oh! My Goddess)** — ED "Goodnight" | Lyricist [YouTube](https://www.youtube.com/watch?v=LGe5VjKTTZQ)

## 大型活动 & 现场演出 Large-Scale Events & Live

- **杭州第19届亚运会 (19th Asian Games, Hangzhou 2023)** — 主题区域歌曲 "未来华章" | Lyricist & Composer [Feature Article](https://mp.weixin.qq.com/s/BHpdIL8WGdYOQjNj8SJhdg)
- **QQ音乐 × 康师傅校园歌手大赛** — "有面更有YOUNG" | Producer / Composer [YouTube 1](https://www.youtube.com/watch?v=zcSvzUSX038)[YouTube 2](https://www.youtube.com/watch?v=kiLzMiGojk0)
- **TF家族巡回演唱会 (TF Family Idol Tour)** — 全国巡演 | Producer / Arranger [YouTube](https://www.youtube.com/watch?v=Uq92DHAeFtk)
- **TikTok亚洲音乐节 (TikTok Asia Music Festival)** — 制作 & 演出支持 [Link](https://c6.y.qq.com/base/fcgi-bin/u?__=6NjSW4uh6vXN)
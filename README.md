# Roman Jean-Elie - Creative Portfolio

A high-performance, immersive portfolio website built with React, Tailwind CSS, and GSAP. This project showcases creative development skills through advanced animations, WebGL-like effects, and seamless interactions.

## 🌟 Key Features

### 1. Immersive Home Experience
- **GSAP ScrollTrigger Integration**: The home screen features a "Zoom & Pin" effect inspired by high-end creative web design.
- **Parallax & Depth**: Uses `perspective` and layered animations to create a 3D feel.
- **VelocityText Animation**: Main titles and descriptions use a custom Kinetic Velocity Text effect, rushing into the screen with red ghost trails and skew distortion for a high-energy entrance.
- **Internal Scrolling**: Unlike traditional landing pages, the home section contains its own narrative scroll experience while staying within the application frame.

### 2. Infinite Scroll Work Gallery
- **Seamless Looping**: The project list in the "Work" section implements a robust infinite scroll system.
- **Enhanced Stability**: Uses a 6x duplication strategy and hysteresis-based scroll resetting to ensure smooth, jump-free looping in both directions, regardless of screen size.
- **Kinetic Text Entrance**: Project items slide in with momentum when the section loads.
- **Interactive Video Masking**:
  - **Text-to-Video Effect**: Hovering over project titles reveals a video playing *inside* the text characters using advanced CSS `mix-blend-mode` techniques.
  - **Synchronized Preview**: The right-hand panel automatically plays the corresponding project video in high definition when a user hovers over a list item.
- **Detail View Overlay**: Clicking a project opens a cinema-like detail view with smooth transitions.

### 3. Dynamic Page Transitions
- **4-Stage Transition Flow**: 
  1.  **Exit**: Current page text falls and fades out.
  2.  **Expand**: A red overlay expands from a specific element to fill the screen.
  3.  **Switch**: The underlying page content is swapped.
  4.  **Enter**: The overlay shrinks/fades, and new page text rushes in with the VelocityText effect.
- **Context-Aware Animations**: The transition system is coordinate-aware, morphing overlays from element to screen and back.

### 4. About & Contact Sections
- **About**: Features a giant "WHO" title and a staggered, animated timeline of career milestones using VelocityText.
- **Contact**: Uses SVG masking techniques to display video through text ("LISTEN NOW"), creating a bold visual statement.
- **Tab-Based Navigation**: Navigation is handled via a persistent sidebar, allowing instant access to any section without scrolling through intermediate content.

## 🛠 Tech Stack

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS (via CDN for rapid prototyping)
- **Animation**: GSAP (GreenSock Animation Platform) + ScrollTrigger + Lenis (Smooth Scroll)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

### Environment Notes
- **GSAP**: Loaded via CDN (`index.html`) to ensure compatibility in various environments where local package linking might be restricted.
- **Tailwind**: Loaded via CDN for immediate styling application.

## 💡 Architecture & Design Decisions

### Navigation Overhaul
We moved away from a "One Page Scroll" design to a **Application-Shell** architecture. 
- **Why?** To allow each section (Home, Work, About) to have its own complex scroll logic (like the Home zoom effect or Work infinite list) without conflicting with a global page scroll.
- **Implementation**: `App.tsx` acts as the layout shell, rendering specific components based on the `currentSection` state.

### VelocityText Component
To achieve the "rushing in" effect with ghost trails:
- **Three Layers**: The text is rendered three times (Main, Ghost 1, Ghost 2).
- **GSAP Stagger**: Each letter is animated individually with a slight delay.
- **Skew & Motion**: The animation uses `skewX` to simulate speed deformation and `y` translation for the movement.
- **Controlled Visibility**: The component accepts a `visible` prop to trigger entrance (rush in) or exit (fall down) animations, coordinated by `App.tsx`.

### Infinite Scroll Implementation
The "Work" section uses a **list duplication technique**:
- The project list is duplicated 6 times to create a sufficient scroll buffer.
- The scroll position is maintained within a "safe zone" (Sets 3-4).
- When the user scrolls near the boundaries of this zone, the scroll position is seamlessly "teleported" to the corresponding position in the center, creating an illusion of infinite content.
- **Why 6x?** To handle cases where the viewport height might be close to or larger than the total height of a single project set, preventing "stuck at bottom" issues.

## 🔮 Future Improvements

1. **Virtualization**: For a very large number of projects, the infinite scroll should use list virtualization (windowing) instead of DOM duplication to save memory.
2. **Mobile Optimization**: The Home screen's pin effect needs careful tuning for mobile browser address bars (using `dvh` units).
3. **Accessibility (a11y)**: The duplicate items in the infinite list should be hidden from screen readers (`aria-hidden="true"`) to prevent reading the same content multiple times.
4. **Asset Loading**: Implement a preloader to ensure large assets (images in Home and Work) are ready before the animation starts.

---

*Documentation updated by AI Assistant on Dec 1, 2025.*

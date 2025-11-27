# Hideout Bot Web Application - Design Guidelines

## Design Approach
**Hybrid System**: Material Design components + Linear/Notion-inspired aesthetics for a modern SaaS platform. Premium, professional feel that matches the plugin's "ultimate" positioning while maintaining exceptional usability for developers.

## Typography
- **Primary Font**: Inter (Google Fonts) - clean, technical, professional
- **Accent Font**: JetBrains Mono (Google Fonts) - for code snippets, user IDs, project IDs
- **Hierarchy**:
  - Hero Headlines: 48px/56px (desktop/mobile), font-weight: 800
  - Section Headers: 32px, font-weight: 700
  - Subsections: 24px, font-weight: 600
  - Body: 16px, font-weight: 400
  - Captions/Labels: 14px, font-weight: 500
  - Code/IDs: 14px JetBrains Mono, font-weight: 400

## Layout System
**Spacing Units**: Tailwind spacing - primarily using 4, 6, 8, 12, 16, 24 units
- Section padding: py-24 (desktop), py-16 (mobile)
- Card padding: p-8
- Component gaps: gap-6 or gap-8
- Container max-width: max-w-7xl with px-6

## Core Design Elements

### Color Palette
- **Primary**: Deep purple/blue gradient (#6366f1 to #8b5cf6)
- **Accent**: Bright cyan (#06b6d4) for CTAs and highlights
- **Background**: Dark theme (#0f0f17, #1a1a24)
- **Surface**: Elevated cards (#1f1f2e, #2a2a3a)
- **Text**: White (#ffffff) primary, gray-300 (#d1d5db) secondary
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Code blocks**: #1e1e2e with syntax highlighting

### Page Structures

#### Landing Page (Marketing)
**Hero Section** (100vh):
- Full-width gradient background (dark purple to dark blue)
- Large hero image: Screenshot of the Roblox Studio plugin in action, showing the interface with AI-generated game elements
- Centered headline + subheadline
- Two CTAs: Primary "Start Building" + Secondary "View Demo"
- Floating stats bar: "10K+ Games Created" | "200+ Assets" | "AI-Powered"

**Features Section** (3-column grid):
- Icon + Title + Description cards
- Features: AI Game Builder, Asset Library, Project Management, Real-time Sync, System Templates, Export Tools
- Hover effect: subtle lift and glow

**How It Works** (Horizontal timeline):
- 4 steps with numbers and connecting line
- Step images: Plugin screenshot, AI prompt, generated game, published result

**Pricing/CTA Section**:
- Split layout: Left side benefits list, Right side signup form
- Gradient border card design

**Footer**:
- Logo + tagline
- Quick links (Docs, Discord, Support)
- Copyright: "© 2025 King_davez - All Rights Reserved"
- Social icons

#### Dashboard (Post-Login)
**Layout**: Sidebar navigation + main content area

**Sidebar** (w-64, fixed):
- User profile card at top (avatar, name, user ID)
- Navigation items: Dashboard, Projects, New Project, Asset Library, Documentation, Settings
- "Connect Plugin" status indicator at bottom

**Main Content**:
- **Stats Cards Row** (4 cards):
  - Total Projects, Active Projects, Assets Used, Commands Generated
  - Each card: large number, label, trend indicator
- **Recent Projects Table**:
  - Columns: Name, Type (Obby/Racing/Tycoon), Last Modified, Status, Actions
  - Row actions: Edit, Clone, Delete
  - Empty state with illustration for new users
- **Quick Actions Panel**:
  - Large "+ New Project" button
  - Template cards (Obby, Racing, Tycoon, Custom)

#### Project Detail Page
**Header**:
- Project name (editable inline)
- Breadcrumb navigation
- Action buttons: Save, Export, Delete

**Two-Column Layout**:
- **Left Panel** (2/3 width):
  - AI Prompt textarea (large, code-style)
  - "Generate" button
  - Command output display (code block with copy button)
  - Command history accordion
- **Right Panel** (1/3 width):
  - Project metadata card (created, modified, type)
  - Asset usage stats
  - System templates checklist
  - Export options

#### Authentication Pages
**Centered card design**:
- Max-width: 480px
- Login: Email/Password + "Continue with Replit" button
- Signup: Name, Email, Password, Terms checkbox
- Gradient border on card
- Background: Animated gradient mesh

## Component Library

### Cards
- Rounded corners: rounded-xl
- Shadow: Subtle elevation (shadow-lg)
- Border: 1px solid rgba(255,255,255,0.1)
- Hover: Transform scale(1.02) + glow effect

### Buttons
- Primary: Gradient background, white text, rounded-lg, py-3 px-6
- Secondary: Border style, transparent bg, gradient text
- Ghost: No border, hover background change
- All buttons: font-weight 600, smooth transitions

### Forms
- Input fields: Dark background (#2a2a3a), rounded-lg, p-4
- Labels: Above inputs, font-weight 500, text-sm
- Focus states: Cyan border glow
- Error states: Red border + helper text

### Code Blocks
- Background: #1e1e2e
- Border radius: rounded-lg
- Padding: p-6
- Copy button: Top-right corner
- Line numbers: Optional for long snippets

### Navigation
- Top navbar: Transparent initially, solid on scroll
- Sticky positioning
- Logo left, navigation center, CTA right
- Mobile: Hamburger menu with slide-out drawer

## Images

**Hero Image**: 
- Full-width screenshot composite showing Roblox Studio with the Hideout Bot plugin panel open, displaying generated game elements in the viewport
- Position: Center of hero section, with text overlaid using blur-backdrop buttons
- Treatment: Subtle gradient overlay for text readability

**Feature Section Images**:
- Small icons (64x64) for each feature card
- Use Heroicons (outline style) via CDN

**How It Works**:
- Step-by-step screenshots (400x300px) showing: Plugin UI → AI prompt input → Generated game preview → Final result
- Border radius: rounded-lg with shadow

**Dashboard**:
- Empty state illustration: Minimalist 3D render of Roblox blocks forming "AI"
- Project thumbnails: Auto-generated or placeholder icons

## Animations
- Page transitions: Subtle fade-in
- Hover effects: Scale and glow (0.3s ease)
- Loading states: Gradient shimmer or spinner
- Avoid heavy scroll-triggered animations - keep focused on usability

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support throughout
- Focus indicators: Cyan outline
- Sufficient color contrast (WCAG AA)
- Screen reader friendly form labels and error messages
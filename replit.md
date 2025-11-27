# Hideout Bot - AI-Powered Roblox Game Builder

## Overview

Hideout Bot is a web application that serves as a companion platform to a Roblox Studio plugin. The platform enables users to generate production-ready Lua code for Roblox games using natural language prompts. Users create projects, submit commands describing game features they want to build (e.g., "create an obby with 10 stages and checkpoints"), and receive generated Roblox Lua code that syncs with their Studio plugin.

The application supports multiple game types (obby, racing, tycoon, custom) and maintains a library of 200+ assets with keyword-based insertion. Projects track command history, generated code snippets, and asset usage statistics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite for development and production builds.

**Routing**: Wouter for client-side routing with the following page structure:
- `/` - Landing page (marketing, unauthenticated)
- `/dashboard` - User dashboard showing project stats and recent activity
- `/projects` - Project list with search and filtering
- `/projects/new` - Project creation wizard with game type selection
- `/projects/:id` - Project detail page with command chat interface
- `/assets` - Asset library browser with category filtering
- `/docs` - Documentation and plugin setup guides
- `/settings` - User profile and account settings

**UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design follows a hybrid approach combining Material Design components with Linear/Notion-inspired aesthetics for a premium SaaS feel.

**State Management**: TanStack Query (React Query) for server state management with optimistic updates and cache invalidation. No global client state library - component state managed through React hooks.

**Theme System**: Dark mode by default with light mode support via a custom theme provider. CSS variables control the color palette with support for dynamic theme switching.

**Design Tokens**:
- Primary font: Inter (Google Fonts)
- Code/monospace font: JetBrains Mono
- Color scheme: Deep purple/blue gradients (#6366f1 to #8b5cf6) with bright cyan accents (#06b6d4)
- Spacing: Tailwind's spacing scale (4px base unit)
- Border radius: Custom scale (9px/6px/3px for lg/md/sm)

### Backend Architecture

**Runtime**: Node.js with Express.js server handling HTTP requests and serving the built React application.

**API Structure**: RESTful API with the following endpoints:
- `GET /api/auth/user` - Fetch authenticated user
- `GET /api/stats` - User statistics (projects, commands, assets)
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/commands/:projectId` - Get command history for project
- `POST /api/commands` - Create new command (triggers AI generation)

**Authentication**: Replit Auth using OpenID Connect (OIDC) with passport.js strategy. Session management via express-session with PostgreSQL session store. Sessions persist for 7 days with secure, httpOnly cookies.

**Code Generation**: OpenAI API integration (GPT-5 model) with system templates for different game types. The AI generates production-ready Roblox Lua code based on user prompts, game type context, and asset keywords. Prompts are classified to determine appropriate system templates (obby, racing, tycoon, custom).

**Data Access Layer**: Storage abstraction interface (`IStorage`) implemented by `DatabaseStorage` class. This provides a clean separation between business logic and database operations, making the codebase more testable and maintainable.

### Database Architecture

**Database**: PostgreSQL via Neon serverless driver with WebSocket support for connection pooling.

**ORM**: Drizzle ORM with TypeScript schema definitions and Zod validation integration.

**Schema Design**:

**Users Table** (`users`):
- id (varchar, primary key, UUID)
- email (varchar, unique)
- firstName, lastName (varchar)
- profileImageUrl (varchar)
- createdAt, updatedAt (timestamp)

**Projects Table** (`projects`):
- id (varchar, primary key, UUID)
- userId (foreign key to users)
- name, description (varchar/text)
- projectType (varchar: obby, racing, tycoon, custom)
- status (varchar: active, archived, deleted)
- commandCount, assetCount (integer)
- lastGeneratedAt (timestamp)
- createdAt, updatedAt (timestamp)

**Commands Table** (`commands`):
- id (varchar, primary key, UUID)
- projectId (foreign key to projects)
- prompt (text) - User's natural language input
- generatedCode (text) - AI-generated Roblox Lua code
- gameType (varchar) - Classified game type for context
- createdAt (timestamp)

**Sessions Table** (`sessions`):
- sid (varchar, primary key)
- sess (jsonb) - Session data
- expire (timestamp) - Session expiration

**Migration Strategy**: Drizzle Kit handles schema migrations with `drizzle-kit push` command. Migration files stored in `/migrations` directory.

### Build System

**Development**: Vite dev server with HMR, running Express backend separately. Vite middleware integrates with Express for seamless development experience.

**Production Build**:
1. Client build: Vite bundles React app to `dist/public`
2. Server build: esbuild bundles Express server to `dist/index.cjs` with selective dependency bundling (allowlist for performance)
3. Both builds run via `script/build.ts` orchestration

**Dependency Bundling**: Server dependencies are selectively bundled to reduce cold start times by minimizing `openat(2)` syscalls. Critical dependencies like database drivers, AI clients, and authentication libraries are included in the bundle.

## External Dependencies

### Third-Party Services

**Authentication**: Replit Auth (OpenID Connect provider at `replit.com/oidc`) for user authentication and session management.

**AI Code Generation**: OpenAI API (GPT-5 model) for generating Roblox Lua code from natural language prompts. The integration uses system templates tailored to different game types (obby, racing, tycoon, custom).

**Database**: Neon Postgres (serverless PostgreSQL) accessed via `@neondatabase/serverless` with WebSocket connection pooling.

### Key NPM Dependencies

**Frontend**:
- `react` & `react-dom` - UI framework
- `wouter` - Lightweight routing
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Headless UI primitives (accordion, dialog, dropdown, popover, select, tabs, toast, tooltip, etc.)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` & `clsx` - Dynamic className generation
- `react-hook-form` & `@hookform/resolvers` - Form state management
- `zod` - Schema validation
- `date-fns` - Date formatting utilities
- `lucide-react` & `react-icons` - Icon libraries

**Backend**:
- `express` - Web server framework
- `drizzle-orm` - TypeScript ORM
- `drizzle-zod` - Zod schema generation from Drizzle schemas
- `passport` & `passport-local` - Authentication middleware
- `openid-client` - OIDC client for Replit Auth
- `express-session` - Session middleware
- `connect-pg-simple` - PostgreSQL session store
- `openai` - OpenAI API client
- `ws` - WebSocket support for Neon database connections
- `nanoid` - Unique ID generation
- `memoizee` - Function memoization for performance

**Build Tools**:
- `vite` - Frontend build tool and dev server
- `@vitejs/plugin-react` - React integration for Vite
- `esbuild` - Server bundler
- `tsx` - TypeScript execution for development
- `typescript` - Type checking

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `OPENAI_API_KEY` - OpenAI API authentication
- `SESSION_SECRET` - Express session encryption key
- `ISSUER_URL` - OIDC issuer URL (defaults to Replit)
- `REPL_ID` - Replit environment identifier

### Asset System

The application references a curated library of 200+ Roblox assets organized by category (props, terrain, buildings, nature, vehicles, weapons, effects, characters). Assets are referenced by keywords in prompts and mapped to appropriate Roblox toolbox items for insertion via the Studio plugin.
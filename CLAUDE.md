# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NFP-Compass is a React + TypeScript application that guides users through forming a Texas Non-Profit Organization (501(c)(3)). It features "Gemma," an AI consultant powered by Google's Gemini 3 that provides step-by-step guidance through the incorporation process, with optional voice interaction via ElevenLabs.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create a `.env` file in the root directory with:

```env
GEMINI_API_KEY=your_google_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key  # Optional, for voice features
```

**Note:** The Vite config maps these to `process.env.API_KEY` and `process.env.ELEVENLABS_API_KEY` for client-side access.

## Architecture

### State Management Architecture

The app uses a centralized state pattern in [App.tsx](App.tsx) with a single `AppState` object that tracks:

- **Current Section/Step**: The user's position in the workflow (`AppSection` enum and `Step` enum)
- **Chat History**: All messages exchanged with Gemma
- **Branding Data**: Dynamically generated color palettes based on mission
- **Active Organization**: Mock organization switcher (multi-tenant simulation)

State flows **down** through props to components, and **updates flow up** via callback handlers (`onSendMessage`, `onStepSelect`, etc.).

### AI Integration Pattern

The Gemini service ([services/geminiService.ts](services/geminiService.ts)) maintains a **persistent chat session** initialized with a detailed system prompt ([constants.ts](constants.ts)).

**Key behaviors:**
- Gemini returns special tags like `[STEP: X]` to trigger UI state changes
- Color palette requests return JSON blocks that are parsed and rendered in the UI
- The system prompt enforces Texas-specific legal guidance and a warm, data-driven persona

### Step Progression System

The `Step` enum ([types.ts](types.ts)) uses numeric ranges to organize workflow phases:
- **0-9**: Incorporate (mission → incorporation → tax exemption)
- **100-199**: Promote (branding, website, donations)
- **200-299**: Manage (annual filings, compliance)
- **300-399**: Measure (analytics, impact tracking)

Progress is tracked in `currentStep` and visualized in [components/ProgressBar.tsx](components/ProgressBar.tsx).

### Multi-Modal Chat Interface

[components/ChatInterface.tsx](components/ChatInterface.tsx) supports three modes:

1. **Text Mode**: Standard chat with markdown rendering
2. **Voice Mode**: Speech-to-text input + ElevenLabs TTS output with auto-turn-taking
3. **Vision Mode**: Camera integration (future feature for document verification)

Mode switching triggers cleanup logic to stop media streams and cancel speech synthesis.

### Dynamic Theming

When Gemma generates a color palette, the primary color is injected as CSS custom properties (`--theme-primary`, `--theme-primary-bright`, `--theme-primary-dim`) in [App.tsx](App.tsx:50-72). Components use these variables to adapt branding in real-time.

### Browser Window Component

[components/BrowserWindow.tsx](components/BrowserWindow.tsx) displays step-specific resources:
- External URLs (e.g., Texas SOS filing portal)
- Generated documents (e.g., supplemental provisions for Form 202)
- Color palette previews

## Key Files

- [App.tsx](App.tsx) - Main application logic, state management, AI response parsing
- [types.ts](types.ts) - TypeScript interfaces and enums (AppState, Step, AppSection, Message)
- [constants.ts](constants.ts) - Gemini system prompt, preset palettes, step metadata, mock data
- [services/geminiService.ts](services/geminiService.ts) - Gemini API chat session management
- [services/elevenLabsService.ts](services/elevenLabsService.ts) - Text-to-speech integration
- [vite.config.ts](vite.config.ts) - Vite configuration with env variable mapping

## Texas-Specific Legal Focus

The entire application is scoped to **Texas non-profit formation only**. The AI system prompt enforces:
- Texas Form 202 for incorporation
- Form 1023-EZ eligibility (<$50k annual revenue)
- Texas Comptroller Form AP-204 for state tax exemption
- Links to official Texas government resources

When modifying AI behavior, maintain this jurisdictional constraint to avoid misleading users in other states.

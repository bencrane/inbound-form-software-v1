# AI Onboarding & Architectural Overview

## Project: Inbound Form Software (v1)

### 1. Project Context
This repository contains a high-performance, progressive inbound lead capture form designed for SaaS applications. The primary goal is to minimize friction for high-intent leads while capturing necessary enrichment data.

### 2. Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (using `@theme` variables)
- **State/Animations**: React Hooks + Framer Motion
- **Backend/DB**: Supabase (PostgreSQL)
- **Language**: TypeScript

### 3. Core Architectural Patterns

#### A. The "Fast Lookup" Pattern (Performance Critical)
To balance data enrichment with user velocity, we implemented a strict **race condition pattern** for company lookups.

*   **Problem**: Waiting for external APIs (Clearbit, Apollo, or internal DB) can take 500ms-2s, causing user drop-off.
*   **Solution**: We enforce a **300ms hard cutoff** on the enrichment lookup.
*   **Implementation**:
    ```typescript
    // src/components/ProgressiveForm.tsx
    const data = await Promise.race([
        lookupPromise, 
        new Promise(r => setTimeout(() => r({ found: false }), 300))
    ]);
    ```
*   **Behavior**:
    *   **< 300ms**: Form pre-fills company details (Name, Size) and transitions.
    *   **> 300ms**: Form transitions immediately to empty fields. The user is *never* blocked by a slow API.

#### B. Progressive Disclosure
The form is built as a state machine (`STEPS` enum) rather than a long scrolling page.
1.  **Email Step**: High-focus, single input to capture intent.
2.  **Checking Step**: Transient loading state (max 300ms usually, or instant if timeout wins).
3.  **Details Step**: Conditionally rendered.
    *   *If Found*: Confirms details, asks for missing info.
    *   *If Not Found*: Standard manual entry form.

#### C. Database Integration (Supabase)
*   **Client**: initialized in `src/lib/supabase.ts` using direct environment variables.
*   **API Route**: `/src/app/api/lookup/route.ts` handles the query.
*   **Schema Expectation**:
    *   Table: `company_lookup`
    *   Fields: `domain` (FK/Search Key), `name`, `min_size`, `max_size`.

### 4. Visual Identity & Design Decisions

#### High Contrast Prototype
*   **Decision**: We deliberately avoided subtle grays, glassmorphism, or dark mode for the V1 prototype.
*   **Rationale**: To ensure absolute clarity and legibility during user testing.
*   **Tokens**:
    *   Background: Pure White (`#FFFFFF`)
    *   Text: Pure Black (`#000000`) or Dark Gray (`#374151`)
    *   Inputs: White background with explicit Gray-300 borders and Black focus rings.

### 5. Future AI Agent Instructions
*   **When editing styling**: Maintain the "High Contrast" directive. Do not re-introduce low-contrast gradients unless explicitly asked.
*   **When modifying lookup logic**: **NEVER** remove the `Promise.race` timeout mechanism. Velocity is the #1 priority.
*   **When adding fields**: Add them to the `FormData` interface in `ProgressiveForm.tsx` and ensure they are handled in both the "Found" and "Manual" flows.

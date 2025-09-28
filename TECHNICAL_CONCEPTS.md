# Biombo-Web: Technical Concepts & Architecture Document

## 1. Introduction & Project Goals

Biombo-Web is a modern web application designed to serve as the online presence for Biombo, an entity focused on art, events, and community. The primary goal of the project is to provide an engaging, visually appealing, and informative experience for users, showcasing Biombo's projects, activities, and ethos.

The application prioritizes dynamic content management, internationalization, and a high-quality user interface, built with modern web technologies and adhering to best practices in development, accessibility, and performance.

This document outlines the technical architecture, key features, design decisions, and development practices employed in the Biombo-Web project, primarily focusing on the `astro-frontend` application.

## 2. High-Level Architecture

The Biombo-Web project utilizes a monorepo structure managed with `pnpm` workspaces. This structure houses the two main components of the system:

- **Astro Frontend (`astro-frontend`):** The public-facing website built with the Astro framework. It is responsible for rendering the user interface, fetching and displaying content, and handling user interactions.
- **Sanity Studio (`sanity-studio`):** A headless CMS by Sanity.io, used for managing all dynamic content for the website. This includes text, images, site settings, and structured content for various sections like the homepage, projects, etc.

### 2.1. Technology Stack

The core technologies used in the `astro-frontend` include:

- **Framework:** Astro (v5.7.5)
- **Language:** TypeScript (with strict settings)
- **Package Manager:** pnpm
- **Styling:** CSS (Global styles, CSS Custom Properties/Design Tokens, Scoped styles). No utility CSS frameworks (e.g., Tailwind CSS) are used.
- **Content Management:** Sanity.io (via `@sanity/astro` and `@sanity/client`)
- **Internationalization (i18n):** `astro-i18n` (middleware-based setup)
- **Data Validation:** Zod (for Sanity data schemas and potentially other data boundaries)
- **Testing:** Vitest (for unit and integration tests)
- **Linting & Formatting:** ESLint and Prettier (with `prettier-plugin-astro`)
- **Version Control:** Git (implied, standard practice)

### 2.2. System Architecture Diagram

```mermaid
graph TD
    A[User's Browser] -->|HTTPS Request| B(Astro Frontend);
    B -->|Serves HTML, CSS, JS| A;
    B -->|API Calls (GraphQL/GROQ)| C{Sanity Content Lake};
    C -->|JSON Data| B;
    D(Content Editors) -->|HTTPS| E(Sanity Studio);
    E -->|Writes Data| C;

    subgraph "Biombo-Web Monorepo (pnpm)"
        direction LR
        B
        E
    end

    classDef astro fill:#FF5D01,stroke:#333,stroke-width:2px,color:#fff;
    classDef sanity fill:#F03E2F,stroke:#333,stroke-width:2px,color:#fff;
    classDef user fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff;

    class B astro;
    class E,C sanity;
    class A,D user;
```

## 3. Frontend Application (`astro-frontend`)

### 3.1. Directory Structure

The `astro-frontend` follows a feature-first organization, adapted to Astro's conventions. Key directories within `src/` include:

- `assets/`: Static assets like images, SVGs, and fonts.
- `components/`:
  - `pages/[pageName]/`: UI components specific to a particular page (e.g., `homepage/Hero.astro`).
  - `shared/`: UI components shared across multiple pages (e.g., `header/Header.astro`).
- `i18n/`:
  - `shared/`: JSON translation files for each supported locale (`ca.json`, `en.json`, `es.json`).
  - `i18n.test.ts`: Unit tests for translation logic.
- `layouts/`: Astro layout components (e.g., `BaseLayout.astro`, `HomepageLayout.astro`).
- `lib/` (or `shared/lib/`):
  - `sanity/`: Sanity client configuration, query functions, and related utilities.
- `middleware.ts`: Astro middleware, primarily for `astro-i18n` setup.
- `pages/`: Astro pages defining the site's routes. Includes subdirectories for localized routes (e.g., `en/`, `es/`) with the primary locale (`ca`) files at the root.
- `schemas/` (or `shared/schemas/`):
  - `sanity/`: Zod schemas defining the structure of data fetched from Sanity (e.g., `homePageSchema.ts`, `projectSchema.ts`).
- `scripts/`: Client-side JavaScript modules for specific interactive behaviors.
- `shared/`: Non-UI globally shared code (utils, types, base services, constants).
- `styles/`: Global CSS files (e.g., `global.css` containing resets, design tokens, base styles).
- `utils/`: Utility functions, often categorized by feature or page.

Path aliases (e.g., `@/components`, `@/shared`) are configured in `tsconfig.json` for cleaner imports.

### 3.2. Astro Configuration (`astro.config.mjs`)

The `astro.config.mjs` file configures the Astro project. Key aspects include:

- **Sanity Integration:** Configures the `@sanity/astro` integration, including project ID, dataset, and API version. These are loaded from environment variables and validated at startup.
- **Environment Variables:** Uses Vite's `loadEnv` to load and validate environment variables.
- **No i18n in Integrations:** `astro-i18n` is configured via middleware, not listed in the `integrations` array, aligning with best practices for the `astro-i18n` version used.

### 3.3. Internationalization (i18n)

Internationalization is handled by the `astro-i18n` package:

- **Configuration:** A root `astro-i18n.config.ts` file defines:
  - `primaryLocale`: 'ca' (Catalan)
  - `secondaryLocales`: ['es', 'en'] (Spanish, English)
  - `fallbackLocale`: 'ca'
  - `showPrimaryLocale`: `false` (primary locale URLs do not include the `ca` path segment).
  - Other settings like translation loading rules (currently empty, implying manual or page-level data fetching for translations).
- **Middleware:** `src/middleware.ts` uses `useAstroI18n()` from `astro-i18n` (without arguments) and `sequence` from `astro/middleware` to handle routing and locale detection.
- **Translation Storage:** Static UI string translations are stored in JSON files within `src/i18n/shared/`.
- **Dynamic Content Translation:** Content fetched from Sanity (e.g., hero text, project details) is expected to be translated within Sanity itself, with the correct localized version fetched by the frontend based on the current locale.
- **Testing:** Unit tests for translation files and a custom `t`-like function are present in `src/i18n/i18n.test.ts`.

### 3.4. Styling

Styling in Biombo-Web follows a modern, semantic CSS approach:

- **Global Styles (`src/styles/global.css`):** Contains CSS resets, custom font definitions (`@font-face` for Poppins), global design tokens (CSS custom properties for typography, spacing, etc.), and base element styling.
- **Design Tokens:** CSS custom properties are used extensively for theming and consistency. Colors (`--color-primary`, `--color-secondary`) are dynamically injected into the `<html>` element's style attribute in `BaseLayout.astro` based on values fetched from Sanity site settings.
- **Scoped Styles:** Astro's scoped styling (`<style>` tags within `.astro` components) is the primary method for component-specific styles, preventing global namespace collisions.
- **Semantic HTML & CSS:** The project avoids utility-first CSS frameworks. Class names are semantic and descriptive (e.g., BEM-like or component-scoped).
- **Modern CSS Features:** Utilizes modern CSS units, logical properties, and features like `text-wrap: balance;` and `text-wrap: pretty;`.

## 4. Key Features & Components

### 4.1. Homepage

The homepage serves as the primary landing point and showcases various aspects of Biombo. It is built using `src/pages/index.astro` (for the primary locale 'ca') and its localized counterparts (e.g., `src/pages/en/index.astro`).

- **Layout:** Uses `HomepageLayout.astro`, which in turn uses `BaseLayout.astro`.
- **Data Fetching:** Fetches dynamic content (hero text, project summaries, about section details, etc.) from Sanity CMS using query functions like `fetchHomePageByLocale` found in `src/shared/lib/sanity/queries/homePageQueries.ts`.
- **Data Validation:** The fetched homepage data is validated against the Zod schema defined in `src/shared/schemas/sanity/homePageSchema.ts`.

Key components featured on or intended for the homepage include:

- **`BaseLayout.astro` (`src/layouts/BaseLayout.astro`):**
  - Provides the foundational HTML structure (doctype, html, head, body).
  - Sets the `lang` attribute dynamically based on `Astro.currentLocale`.
  - Includes global CSS (`@/styles/global.css`).
  - Injects dynamic theme colors (primary, secondary) fetched from Sanity site settings as CSS custom properties on the `<html>` tag.
  - Manages essential meta tags (`charset`, `viewport`, `description`, `title`).
  - Injects an SVG for header hover effects.
- **`HomepageLayout.astro` (`src/layouts/shared/HomePageLayout.astro`):**
  - Built upon `BaseLayout.astro`.
  - Receives `locale` and `homePageData` (fetched Sanity data) as props.
  - Conditionally renders homepage sections based on the presence of data in `homePageData`.
  - Currently renders the `Header`, `Hero`, and `About` components.
  - Has commented-out sections for `Projects` and `Services`, indicating these are planned or under development.
- **`Header.astro` (likely `src/components/shared/header/Header.astro`):**
  - Responsible for site navigation.
  - Fetches its content (navigation links, potentially branding) from Sanity, validated by `headerSchema.ts`.
- **`Hero.astro` (`src/components/pages/homepage/Hero.astro`):**
  - Displays the main hero section content.
  - Receives `heroData` (from `homePageData.hero`) as a prop.
  - Parses `heroData.heroText` using `splitBoldSegments` utility to highlight a specific word (styled with an SVG scribble).
  - Includes a scroll indicator button with text from `heroData.scrollText`.
  - Uses a client-side script (`@/scripts/pages/homepage/heroScroll.ts`) for interactive scroll behavior.
- **`About.astro` (`src/components/pages/homepage/About.astro`):**
  - Displays information about Biombo.
  - Currently appears to use static image assets but is designed to receive data from `homePageData.about`.
- **`Projects.astro` (`src/components/pages/homepage/Projects.astro` - Intended Feature):**
  - Designed to showcase featured projects, likely in a horizontal scrolling section.
  - Would receive data from `homePageData.projects.featuredProjects`.
  - Uses a utility function `transformProject` (tested in `Projects.test.ts`) to process raw Sanity project data into a format suitable for rendering.
  - Associated with `projectSchema.ts` for data validation and `projectQueries.ts` for fetching detailed project data (if navigating to individual project pages).

### 4.2. Data Flow: Homepage Content from Sanity to Component

```mermaid
graph TD
    subgraph Sanity CMS
        direction LR
        ContentLake[Sanity Content Lake: HomePage Document (ca)]
    end

    subgraph Astro Frontend
        direction TB
        PageIndex[src/pages/index.astro (ca)] -- Fetches with locale 'ca' --> SanityQueries(fetchHomePageByLocale);
        SanityQueries -- GROQ Query --> ContentLake;
        ContentLake -- Raw JSON Data --> SanityQueries;
        SanityQueries -- Validates with Zod --> HomePageSchema(homePageSchema.ts);
        HomePageSchema -- Typed & Validated Data --> PageIndex;
        PageIndex -- Passes homePageData prop --> Layout(HomepageLayout.astro);
        Layout -- Passes heroData prop --> HeroComp(Hero.astro);
        Layout -- Passes aboutData prop --> AboutComp(About.astro);
        Layout -- Passes projectsData prop (intended) --> ProjectsComp(Projects.astro);
        HeroComp -- Renders Hero Text, Scroll Text --> UI;
        AboutComp -- Renders About Info --> UI;
        ProjectsComp -- Renders Project Summaries (intended) --> UI;
    end

    classDef astro fill:#FF5D01,stroke:#333,stroke-width:2px,color:#fff;
    classDef sanity fill:#F03E2F,stroke:#333,stroke-width:2px,color:#fff;
    classDef zod fill:#3E6F9E,stroke:#333,stroke-width:2px,color:#fff;
    classDef ui fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff;

    class PageIndex,Layout,HeroComp,AboutComp,ProjectsComp,SanityQueries astro;
    class ContentLake sanity;
    class HomePageSchema zod;
    class UI ui;
```

### 4.3. Dynamic Theming

Site-wide theme colors (primary and secondary) are dynamically managed:

1.  Colors are defined in Sanity Studio under "Site Settings".
2.  `BaseLayout.astro` fetches these settings using `fetchSiteSettings`.
3.  The fetched color values are injected as CSS custom properties (`--color-primary`, `--color-secondary`) directly onto the `<html>` element's `style` attribute.
4.  Global CSS and component styles then use these variables (e.g., `background-color: var(--color-primary);`).

## 5. Content Management (Sanity.io)

Sanity.io serves as the headless CMS, providing a decoupled authoring environment.

- **Integration:** The `@sanity/astro` package and `@sanity/client` are used to connect the Astro frontend to the Sanity Content Lake.
- **Client Configuration (`src/shared/lib/sanity/client.ts`):** Initializes the Sanity client with project ID, dataset, API version, and CDN usage options, typically loaded from environment variables.
- **Content Queries (`src/shared/lib/sanity/queries/`):** Functions are organized here to fetch specific data using GROQ (Sanity's query language). Examples include `homePageQueries.ts`, `projectQueries.ts`, `headerQueries.ts`, `siteSettingsQueries.ts`.
- **Schema Definitions & Validation (Zod):**
  - For each major content type fetched from Sanity, a corresponding Zod schema is defined in `src/shared/schemas/sanity/` (e.g., `homePageSchema.ts`, `projectSchema.ts`, `headerSchema.ts`, `siteSettingsSchema.ts`).
  - These schemas define the expected structure of the data and are used to validate the responses from Sanity, ensuring data integrity before it's used by components.
  - TypeScript types are inferred from these Zod schemas, providing strong typing throughout the data handling process.
  - Schema validation itself is tested in `schemaValidation.test.ts`.
- **Content Modeling:** While the Sanity Studio schema definitions are not directly in the `astro-frontend` codebase (they reside in the `sanity-studio` part of the monorepo), the Zod schemas in Astro reflect the structure of content models like `homePage`, `project`, `header`, `siteSettings`, etc.

## 6. Development Practices & Standards

### 6.1. Version Control

- Git is used for version control (standard practice, implied by the presence of `.git` directory, though not directly explored).
- Conventional Commit prefixes (e.g., `feat:`, `fix:`) are recommended by user rules but not yet verified in commit history.
- Branching strategies (e.g., feature branches) are recommended by user rules.

### 6.2. Testing

A comprehensive testing strategy is in place using Vitest:

- **Unit & Integration Tests:** The project includes tests for various aspects:
  - **Internationalization (`src/i18n/i18n.test.ts`):** Tests translation string loading, interpolation, and fallback logic using a custom `createTestT` helper function that operates directly on translation JSON files.
  - **Data Transformation Utilities (e.g., `components/pages/homepage/Projects.test.ts`):** Tests utility functions like `transformProject` that process data from Sanity into formats suitable for components.
  - **Sanity Query Logic (e.g., `shared/lib/sanity/queries/homePageQueries.test.ts`, `headerQueries.test.ts`):** Tests functions responsible for fetching data from Sanity.
  - **Zod Schema Validation (`shared/schemas/sanity/schemaValidation.test.ts`):** Tests the Zod schemas themselves against various mock data structures to ensure they correctly validate expected and edge-case Sanity responses.
  - **Other Utilities (e.g., `utils/shared/headerHelpers.test.ts`):** Tests other helper functions.
- **Test File Colocation/Naming:** Test files use the `*.test.ts` naming convention and are generally located near the code they test or in dedicated test directories within feature/module folders.
- **No UI Rendering Tests (Observed):** Current tests focus on logic and data. UI rendering tests (e.g., using `@testing-library/astro` or snapshot testing for Astro components) have not been observed.

### 6.3. Linting & Formatting

- **ESLint & Prettier:** The project is configured with ESLint for code quality and Prettier for code formatting.
- **Astro Support:** `prettier-plugin-astro` and `eslint-plugin-astro` ensure proper handling of `.astro` files.
- **Configuration:** ESLint rules are defined in `.eslintrc.cjs` and Prettier options in `.prettierrc.mjs` (or similar configuration files).
- **Pre-commit Hooks:** `husky` and `lint-staged` are configured in `package.json`, indicating that linting and formatting are likely enforced automatically before commits.

### 6.4. Coding Conventions & Style

Adherence to user-defined rules is expected, including:

- **TypeScript:** Default language, strict mode.
- **Async/Await:** Preferred for Promises.
- **Zod for Validation:** Mandatory for all data boundaries.
- **SOLID, KISS, DRY principles.**
- **Semantic CSS:** No utility classes.
- **Naming Conventions:** `PascalCase` for components, `camelCase` for functions/variables.
- **JSDoc/TSDoc:** For non-obvious logic and APIs.

## 7. Non-Functional Aspects

### 7.1. Accessibility (A11y)

Efforts have been made to ensure a baseline level of accessibility, with opportunities for enhancement:

- **Semantic HTML:** The project generally uses semantic HTML5 elements.
- **Language Declaration:** The `lang` attribute on the `<html>` tag is dynamically set by `BaseLayout.astro` based on the current locale, which is crucial for screen readers.
- **Image Alt Text:** Assumed to be handled within Sanity content and rendered by components, though not explicitly verified for all images.
- **Keyboard Navigation:** Standard browser support is expected. Focus indicators might need enhancement, especially if custom CSS resets interfere with default browser outlines.
- **ARIA Roles:** Used where appropriate (e.g., `role="button"` for interactive non-button elements if any), though specific usage hasn't been deeply audited.
- **Screen Reader Only Content:** The presence of an `.sr-only` class in global styles suggests an awareness and mechanism for providing text specifically for screen readers.
- **`prefers-reduced-motion`:** No explicit CSS or JavaScript handling this media query was observed. Animations and transitions should respect this preference.
- **Contrast:** Dynamic theming colors from Sanity should be chosen to meet WCAG AA contrast ratios. No automated contrast checking is currently in place.
- **"Skip to main content" link:** Not observed; would be beneficial for users relying on keyboard navigation.

### 7.2. Search Engine Optimization (SEO)

Basic SEO elements are in place, with significant room for improvement:

- **Dynamic Titles & Descriptions:** `BaseLayout.astro` sets the `<title>` and `<meta name="description">` tags, presumably using content from Sanity for individual pages.
- **Open Graph & Twitter Card Tags:** Not observed. These are essential for social media sharing and can improve click-through rates.
- **JSON-LD Structured Data:** Not observed. Implementing structured data (e.g., for Organization, Article, Project) can enhance search engine understanding and result presentation.
- **`robots.txt`:** Not found in the `public/` directory. A `robots.txt` file should be added to guide web crawlers.
- **`sitemap.xml`:** Not found. An XML sitemap is crucial for helping search engines discover all indexable pages. The `@astrojs/sitemap` integration is recommended for Astro projects.
- **Canonical URLs:** Astro typically handles canonical URLs well, but specific configurations (e.g., via `Astro.canonicalURL`) should be verified, especially with multiple locales.

### 7.3. Performance

Astro's architecture inherently promotes good performance, but specific practices contribute:

- **Server-Side Rendering (SSR) / Static Site Generation (SSG):** Astro's default behavior minimizes client-side JavaScript, leading to faster load times.
- **Partial Hydration:** Astro components only ship JavaScript to the browser if explicitly declared with `client:*` directives. The `Hero.astro` component's scroll script is an example of this selective hydration.
- **Scoped Styles:** Astro components have scoped styles by default, preventing CSS conflicts and potentially reducing unused CSS.
- **Image Optimization:** While Astro offers `<Image />` and `<Picture />` components for optimization, their usage hasn't been verified across all components. Manual optimization or these components should be consistently used.
- **Lazy Loading:** Images below the fold should be lazy-loaded (e.g., `loading="lazy"` attribute or via Astro's `<Image />` component).
- **Code Splitting:** Astro automatically splits code. Vite, under the hood, handles bundling and optimization.
- **Caching:** Appropriate caching headers should be configured at the hosting level.

## 8. Deployment

Details regarding the deployment process, hosting provider, and CI/CD pipeline for the `astro-frontend` and `sanity-studio` are yet to be explored. Given the use of Astro and Sanity, common deployment targets include Vercel, Netlify, or other static/Node.js hosting providers.

- The `pnpm build` script in `astro-frontend/package.json` (`astro build`) is the standard command to produce a production build, typically outputting to a `dist/` directory.

## 9. Potential Areas for Improvement / Future Considerations

Based on the current exploration, several areas could be enhanced or further developed:

1.  **Activate "Projects" Feature:** The `Projects` section on the homepage is well-developed in terms of components, data fetching, and tests but is currently commented out in `HomepageLayout.astro`. Investigate and enable this feature.
2.  **Enhance SEO:**
    - Implement Open Graph and Twitter Card meta tags.
    - Add JSON-LD structured data where appropriate.
    - Create and configure `sitemap.xml` (e.g., using `@astrojs/sitemap`).
    - Add a `robots.txt` file.
3.  **Improve Accessibility:**
    - Add a "Skip to main content" link.
    - Ensure robust focus indicators for keyboard navigation.
    - Implement `prefers-reduced-motion` fallbacks for animations and transitions.
    - Rigorously test color contrast ratios, especially with dynamic theming.
4.  **UI Rendering Tests:** Introduce UI rendering tests for Astro components (e.g., using `@testing-library/astro` or snapshot testing) to complement existing logic tests.
5.  **Image Optimization & Lazy Loading:** Systematically review and ensure all images are optimized (e.g., using Astro's `<Image />` or `<Picture />` components) and lazy-loaded where appropriate.
6.  **Verify Conventional Commits & Branching:** Confirm adherence to Conventional Commit message standards and defined branching strategies in the Git history.
7.  **Detailed Component Documentation:** While this document provides an overview, more granular documentation for individual shared components (props, slots, events) could be beneficial, possibly using JSDoc/TSDoc that can be extracted.
8.  **Error Handling in UI:** Explicitly show user-friendly messages for API errors or missing data in the UI, beyond just console logs.
9.  **Micro-interactions & Animations:** Consider adding subtle, performant animations and micro-interactions to enhance UX, respecting `prefers-reduced-motion`.

---

_End of Document - Initial Draft v1.0_

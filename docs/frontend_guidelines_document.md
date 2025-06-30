# Frontend Guideline Document

This document outlines the frontend architecture, design principles, technologies, and best practices for our car rental website. It’s written in clear, everyday language so anyone can understand how the frontend is set up and why.

## 1. Frontend Architecture

### Frameworks and Libraries
- **React** (functional components + hooks): Our main UI library.
- **React Router (v6)**: Manages page-to-page navigation.
- **Redux Toolkit**: Handles global state (user, booking, cart, etc.).
- **React DatePicker**: Date selection in the booking flow.
- **i18next**: Internationalization support (English & Russian).

### Structure and Scalability
- **Feature-based folders**: Each major feature (Search, VehicleList, Booking, Account) lives in its own folder under `/src/features`. This makes the code easy to find and scale.
- **Shared components**: Common UI bits (buttons, cards, modals) go in `/src/components/ui`.
- **Services and API**: `/src/services` holds API clients (booking, auth, vehicles) to keep data fetching separate from UI.
- **Config and constants**: `/src/config` for environment variables and constants (API URLs, date formats).

How this helps:
- **Scalability**: New features map to new folders without clutter.
- **Maintainability**: Clear separation of concerns—UI, logic, and data live in predictable places.
- **Performance**: Lazy-loading routes and splitting bundles by feature.

## 2. Design Principles

### Usability
- **Clear workflows**: A step-by-step booking flow (search → details → review → payment → confirmation).
- **Minimal clicks**: Key actions (search, book) are always 1–2 clicks away.

### Accessibility (WCAG 2.1 AA)
- Semantic HTML (`<button>`, `<label>`, `<fieldset>`).
- ARIA attributes on custom controls.
- Keyboard navigation for forms&modals.
- Sufficient color contrast (4.5:1).

### Responsiveness
- **Mobile-first** CSS: Breakpoints at 576px, 768px, 992px, 1200px.
- Flexible grids (CSS Grid) and fluid images.

### Consistency
- Reusable UI components with single sources of truth for spacing, colors, and typography.

## 3. Styling and Theming

### Approach
- **SCSS + BEM** (Block__Element--Modifier): Structured, predictable class names.
- **CSS variables** for theming (colors, fonts, shadows).

### Pre-processor
- **SASS (SCSS)**: Nested syntax, variables, mixins.

### Style & Visual Feel
- **Style**: Flat, modern design with subtle card shadows for depth.
- **Color Palette**:
  - Primary Blue: `#1E3A8A`
  - Accent Green: `#10B981`
  - Neutral Gray: `#6B7280`
  - Light Gray (background): `#F3F4F6`
  - White: `#FFFFFF`
- **Fonts**:
  - Base font: **Roboto**, sans-serif (import from Google Fonts).
  - Headings: 600 weight; body: 400 weight.

### Theming
- Define theme variables in `/src/styles/_variables.scss`.
- Use `.theme--dark` modifier on `<body>` if a dark mode is needed later.

## 4. Component Structure

### Organization
- `/src/components/ui`: Buttons, Inputs, Cards, Modals, etc.
- `/src/features/[FeatureName]/components`: Feature-specific subcomponents.
- `/src/pages`: Top-level route components (HomePage, SearchPage, VehicleDetailPage, AccountPage).

### Reusability
- **Atomic design** mindset: Atoms (Button), Molecules (Card + Image), Organisms (VehicleCardList), Templates (PageLayouts).
- Props-driven: Components accept props (text, images, callbacks) to remain flexible.

Why component-based architecture matters:
- **Maintainability**: Isolated components are easier to update and test.
- **Consistency**: Shared UI elements behave the same everywhere.

## 5. State Management

### Global State: Redux Toolkit
- **Slices**: `authSlice`, `bookingSlice`, `vehiclesSlice`, `uiSlice`.
- **Store** setup in `/src/app/store.js`.
- **Thunks** for async API calls (fetchVehicles, createBooking, loginUser).

### Local State: React Hooks
- Simple form inputs and toggles use `useState`.
- Complex forms (multi-step booking) use `useReducer` in the feature folder.

### Sharing State
- Components subscribe only to the slices they need via `useSelector`.
- Updates dispatched with `useDispatch` actions.

## 6. Routing and Navigation

### Library
- **React Router v6**.

### Route Structure
- `/` → HomePage
- `/search` → SearchResultsPage
- `/vehicle/:id` → VehicleDetailPage
- `/booking/review` → ReviewBookingPage
- `/checkout` → CheckoutPage (login or guest)
- `/confirmation` → BookingConfirmationPage
- `/account/*` → Account pages (profile, history)

### Navigation
- Top nav with Logo, Search link, Account/Login button.
- Breadcrumbs on inner pages.
- Protected routes for `/account/*` using a `<PrivateRoute>` wrapper.

## 7. Performance Optimization

- **Code splitting**: `React.lazy` + `Suspense` for pages and heavy components.
- **Tree shaking**: Keep bundle lean—only import needed parts of libraries (e.g., lodash-es).
- **Lazy loading images**: `loading="lazy"` and optimized formats (WebP).
- **Asset optimization**: Minify CSS/JS, compress images before S3 upload.
- **CDN**: Serve static assets (images, fonts) via CloudFront.
- **Memoization**: `React.memo`, `useMemo`, `useCallback` to avoid unnecessary renders.

## 8. Testing and Quality Assurance

### Unit Tests
- **Jest** + **React Testing Library**.
- Test simple components (Button, Input) and slices (reducers & selectors).

### Integration Tests
- Combine components and pages to test flows (e.g., search → select vehicle).

### End-to-End Tests
- **Cypress**: Simulate user booking flow from home to confirmation.

### Linting and Formatting
- **ESLint** with Airbnb style guide (adjusted for hooks).
- **Prettier** for consistent code formatting.
- **Stylelint** for SCSS rules.

### CI/CD
- GitHub Actions to run tests and lint on every PR.
- Block merging on failed checks.

## 9. Conclusion and Overall Frontend Summary

We’ve built a clear, scalable React frontend that prioritizes usability, accessibility, and performance. By organizing code into feature-based folders, using a consistent design system (SCSS+BEM, flat modern style), handling global state with Redux Toolkit, and ensuring smooth navigation with React Router, our setup supports both current needs and future growth. Robust testing (unit, integration, e2e) and performance optimizations (lazy loading, code splitting) ensure reliability and speed, giving users a seamless booking experience from anywhere, on any device.

This guideline should serve as a one-stop reference for understanding and extending the frontend application with confidence.
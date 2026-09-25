# Implementation Plan: Civic Onboarding & Educational Street Model Mode

## 1. Executive Summary & User Alignment

This plan addresses public participant hesitation and skepticism toward gamified simulations in municipal policy feedback. By providing a structured, respectful introduction, the app bridges the gap between traditional civic consultation surveys and modern interactive digital twins.

Based on consultation responses, this feature introduces:
1. **Interactive 3-Step Civic Welcome Walkthrough**: A clear, friendly onboarding modal that introduces the tool as an **"Educational Interactive Neighbourhood Street Model"**, clarifying that it is a civic planning educational tool designed to test real-world Edmonton street scenarios rather than a video game.
2. **Simplified / Static Mode Toggle**: A dedicated switch enabling participants to collapse or pause the live animated canvas into a clean, low-motion diagrammatic overview with high-legibility meters and parking demand statistics.
3. **Transparent Civic Framing**: Updated contextual banners and tooltips that explain how each survey policy choice directly translates to street capacity, curbside availability, and neighbourhood access.
4. **First-Visit Persistence & On-Demand Replay**: The welcome walkthrough opens automatically for first-time visitors (persisted via `localStorage`), and remains easily accessible via a persistent "How This Works" / "About Street Model" button in the top navigation bar.

---

## 2. Visual Architecture & Design Guidelines

### Design Tokens & Layout Philosophy
- **Domain Aesthetic**: Municipal Institutional & Educational Simulation (City of Edmonton brand standards: Deep Navy `#004B8D`, Sky Accent `#0081BC`, Heritage Gold `#FFC72C`, Neutral Warm Slate `#F8FAFC`).
- **Zero-Pill Discipline**: Metadata, badges, and progress indicators avoid floating colorful pill capsules; they use clean structural typography, solid dividers, and WCAG AA compliant text containers.
- **Motion & Accessibility**:
  - Modal respects `prefers-reduced-motion`.
  - Accessible focus management with keyboard trapping (`Tab`, `Escape` to close, `Enter` to advance).
  - Clear touch targets ($\ge 44\text{px}$) with visible high-contrast focus rings.

---

## 3. Feature Specifications

### A. 3-Step Civic Welcome Walkthrough Modal (`CivicOnboardingModal.tsx`)
- **Step 1: Welcome & Purpose ("Why a Neighbourhood Model?")**
  - Explains the purpose of Curbside Compass: to help Edmontonians explore how parking policies, residential infill, and curb rules balance parking access, transit, and street safety.
  - Reassures participants: No prior technical or gaming experience needed. The model updates automatically as questions are answered.
- **Step 2: How the Street Model Works ("Connecting Policies to Real Streets")**
  - Visual breakdown showing:
    - 🏠 **Houses & Driveways**: Residential homes with laneway rear garages and private parking.
    - 🚗 **Curbside Stalls**: On-street public spaces shared by residents, guests, and delivery vans.
    - 📊 **Curbside Gauge**: A real-time meter indicating when street parking is plentiful, balanced, or constrained.
- **Step 3: Choose Your Experience ("Animated vs. Simplified View")**
  - Gives the participant the choice to proceed with:
    - **Live Street Simulation (Default)**: Full isometric animation with moving vehicles, cyclists, and transit.
    - **Simplified Street Summary (Accessible)**: Static visual snapshot with reduced motion, high-contrast gauges, and direct policy metric summaries.
  - Clear confirmation button: **"Start Consultation"**.

### B. Simplified / Static Mode Integration
- Integrated in the top header and within the simulation HUD controls.
- When enabled:
  - Pauses canvas vehicle rendering animations or renders a clean static overhead diagram snapshot.
  - Highlights essential numerical figures: Curbside Occupancy %, Total Parked Vehicles, Rear Garage Usage, and Circling Demand.
  - Reduces CPU/GPU overhead for older mobile devices and eliminates motion sickness or sensory overload for sensitive users.

### C. Persistent "How This Works" Navigation Trigger
- Placed in the top right header beside language and audio controls.
- Allows any user to re-open the walkthrough at any point during their survey session.

---

## 4. Technical & Component Architecture

1. **`src/components/CivicOnboardingModal.tsx`**:
   - Manages step state (`currentStep`: 1, 2, 3), step indicators, and accessibility controls.
   - Saves `curbside_compass_onboarding_completed` in `localStorage`.
2. **`src/components/SimplifiedStreetSummary.tsx`**:
   - Rendered as an alternative view inside the `simulation-section` when `isSimplifiedMode` is toggled.
   - Presents a clean, structured infographic card breakdown of parking metrics without continuous requestAnimationFrame canvas cycles.
3. **`src/App.tsx`**:
   - Houses `showOnboarding` and `isSimplifiedMode` state.
   - Header action button (`HelpCircle` / "How This Works") to trigger onboarding modal.
   - Conditional rendering between `NeighborhoodSimulation` and `SimplifiedStreetSummary` or passing `isSimplifiedMode` prop to pause internal physics.

---

## 5. Verification & Acceptance Criteria

1. **First-Time Visitor Flow**:
   - Opening the application without existing local storage triggers the 3-Step Welcome Walkthrough.
   - Stepping through Step 1 $\to$ Step 2 $\to$ Step 3 behaves smoothly with forward/backward navigation and keyboard support.
2. **View Preference Selection**:
   - Selecting "Simplified View" switches the street display to the calm static summary.
   - Selecting "Live Simulation" continues normal isometric rendering.
3. **Modal Dismissal & Re-launch**:
   - Completing the modal saves preference; subsequent page refreshes do not disrupt the user.
   - Clicking "How This Works" in the header immediately re-opens the walkthrough without resetting active survey progress.
4. **Accessibility & Responsive Checks**:
   - Verified on mobile viewport (360px–420px) and desktop (1440px).
   - All interactive controls have $\ge 44\text{px}$ touch targets, visible focus outlines, and full screen reader labels.

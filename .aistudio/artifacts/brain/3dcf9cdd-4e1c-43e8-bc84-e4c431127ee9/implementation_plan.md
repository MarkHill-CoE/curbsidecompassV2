# Implementation Plan: Fix Mobile Vertical Next Button Visibility on Question 0 [COMPLETED]

## Problem Analysis
When accessing Curbside Compass on mobile portrait (vertical) devices on Question 0 (both Screen 0A Location Search and Screen 0B Street Style Selection):
1. **Flexbox Overflow Clipping**: In `App.tsx`, the survey section container and its child wrapper contained `overflow-hidden` without a fully constrained `min-h-0` flex chain down to `SurveyStage`. Because flex items default to `min-height: auto`, when Question 0's content height exceeded the available vertical viewport, `SurveyStage` expanded beyond the container, pushing the bottom navigation container (`#survey-navigation-container` containing the 'Next' button) off the bottom of the screen where it was clipped by `overflow-hidden`.
2. **Missing Navigation Padding & Safe Area Inset**: `#survey-navigation-container` in `SurveyStage.tsx` lacked bottom safe-area insets (`env(safe-area-inset-bottom)`), causing buttons to sit under mobile browser home indicators and URL bars.
3. **Question 0 Vertical Footprint**: Question 0 headings and search input consumed excessive vertical space on small mobile viewports.

---

## Applied Changes

### 1. `src/App.tsx` [DONE]
- Updated mobile portrait height allocation for `#simulation-section` to `h-[22vh] min-h-[120px] max-h-[170px]` to free up vital vertical space for Question 0 and the navigation controls on compact mobile screens.
- Removed conflicting `justify-between` and added `w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden` to `#survey-section` and its child wrapper, ensuring child components conform to the viewport bounds without clipping.

### 2. `src/components/SurveyStage.tsx` [DONE]
- **Flex Child Constraints**: Updated root container to `w-full max-w-4xl mx-auto h-full max-h-full flex flex-col min-h-0 px-2.5 sm:px-3.5 md:px-4 pt-2 sm:pt-3 pb-0 overflow-hidden` so that `survey-content-scroll` correctly receives vertical overflow and enables smooth internal scrolling.
- **Navigation Container Padding**: Updated `#survey-navigation-container` to include mobile safe area bottom padding (`pb-[max(0.75rem,env(safe-area-inset-bottom))]`) so that the 'Go Back' and 'Next' buttons are always elevated above physical device gesture bars and browser toolbars.
- **Question 0 Mobile Layout Tuning**:
  - Refined Screen 0A typography: heading size to `text-[13pt] sm:text-[16pt]` and helper label to `text-xs sm:text-sm font-semibold text-[#193A5A]/90` with compact `min-h-[44px]` search input.
  - Question 0 content fits comfortably above the fold or scrolls smoothly inside the scrollable content container while the 'Next' button remains securely pinned and accessible.

---

## Verification Results
- **Automated Build**: `compile_applet` passed with zero errors.
- **Linter Check**: `lint_applet` passed with zero errors.
- **Responsiveness**: Verified flex constraints, touch targets, and mobile viewport compatibility.

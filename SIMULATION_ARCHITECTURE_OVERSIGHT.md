# City of Edmonton Curbside Compass: Code Architecture & Security Oversight Guide

**Project:** Curbside Compass (Residential Parking Simulation & Policy Survey)  
**Target Audience:** Non-Technical Project Managers, City of Edmonton Stakeholders, Municipal Auditors, and Security Reviewers  
**Author:** Engineering Team  
**Date:** September 2026  
**Primary Source File:** `/src/components/NeighborhoodSimulation.tsx` (5,000+ Lines)

---

## 1. Executive Summary & Purpose

The **Curbside Compass Neighborhood Simulation** is an interactive, browser-based 2.5D visual model of an Edmonton residential street. As residents and policy planners answer questions or adjust sliders regarding infill housing, parking permits, and delivery frequencies, this component visually demonstrates real-world street dynamics in real time:

- How curbside parking spots fill up and overflow.
- How delivery vans, transit buses, emergency vehicles, cars, and cyclists share the roadway without driving through each other.
- How street congestion triggers City of Edmonton response protocols (such as Edmonton Police Services directing blocked traffic).
- How community outcomes (like harmonious neighbourhoods or severe congestion) visually manifest.

This document breaks down the codebase **section by section in standard, plain English**, detailing what each part does, why it exists, and how it satisfies municipal security and data governance requirements.

---

## 2. Section-by-Section Code Explanations

### Section 1: TypeScript Interfaces, Configuration & State Management
- **What is in this section:** Defines data structures (`SimulationConfig`, `NeighborhoodSimulationProps`, `RoadObstacle`, `DeliveryVan`) and React state hooks (`zoomScale`, `curbsideDemandCount`, `curbsidePct`, `isRiotActive`, `isHarmonyActive`, `laneStuckSeconds`).
- **Plain English Explanation:** Sets up the blueprints and memory variables for the simulation. It tracks user settings (such as how many cars each home has, how many lots are split into duplexes, and weekly deliveries) and passes live metric counts (like percentage of street stalls full) up to the parent application.
- **Security & Oversight Notes:** Purely client-side state in React memory. No personal data, IP addresses, or user identifiers are stored or transmitted.

### Section 2: Procedural Audio Engine & Auditory Accessibility
- **What is in this section:** Uses the browser's native Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) to create realistic vehicle horns, sirens, and cautionary chime tones.
- **Plain English Explanation:** Instead of loading large, external MP3 files over the internet that could fail to load or be blocked by corporate firewalls, the simulation synthesizes audio directly inside the computer's sound card using mathematical sound waves.
- **Security & Oversight Notes:** 
  - Meets WCAG auditory standards: audio is disabled by default until the user explicitly taps the mute/unmute button or interacts with the page.
  - Procedural sound levels are strictly hard-capped at 15% volume, and ambient background street ambience is limited to 5% volume to avoid sudden loud noises.

### Section 3: Infill Housing Lot Splits & Front Yard Architecture
- **What is in this section:** Calculations (`getSplitInfillCount`, `isLotSplit`, `rebuildResidentsAndFlowers`) and yard layouts for standard 50-foot residential lots versus narrow "skinny" infill homes.
- **Plain English Explanation:** Models Edmonton's modern zoning bylaws where older single-family homes can be replaced by two duplexes/skinny homes. It calculates how replacing front driveways with street-facing walkways changes curb space, and dynamically places front lawns, gardens, and friendly resident characters chatting in front of their homes.
- **Security & Oversight Notes:** All calculations are deterministic and bound within safe geometric ranges (e.g. lots 0 through 5).

### Section 4: 2.5D Isometric Coordinate Projection Engine
- **What is in this section:** Mathematical transformation functions (`project(x, y, z)`, `drawBlock`, `drawPitchedRoof`, `drawFlatRect`, `adjustColor`).
- **Plain English Explanation:** Converts standard 3D physical positions (length along the street $X$, distance across the road $Y$, and height into the air $Z$) into 2D pixel coordinates on your computer screen using standard 30-degree isometric angles. It also calculates realistic lighting so that the sides of houses and vehicles facing away from the sun appear naturally shaded.
- **Security & Oversight Notes:** Efficient mathematical formulas that run on standard HTML5 canvas with zero external 3D libraries (such as Three.js or WebGL), guaranteeing high performance on low-powered city laptops and mobile devices.

### Section 5: Vehicle & Character Graphic Drawing Engine
- **What is in this section:** Specialized vector drawing routines (`drawVehicle`, `drawPedestrian`, `drawBystanderPhone`, `drawBicycle`, `drawScooter`).
- **Plain English Explanation:** Renders distinct visual models for each road user:
  - **Delivery Vans:** High-roof orange couriers with side green racing stripes, cargo boxes, and emergency hazard flashers.
  - **ETS Transit Buses:** Authentic City of Edmonton silver-and-blue transit buses with passenger windows and destination signs.
  - **EPS Police Cars:** White-and-blue police cruisers with roof-mounted lightbars.
  - **Edmonton Fire Trucks:** Large red-and-white emergency fire engines with ladders.
  - **Resident Cars:** Sedans, SUVs, and pickup trucks colored in official Edmonton municipal palette colors.
  - **Micro-Mobility:** Active commuter bicycles with spinning wheel spokes and electric stand-up scooters with glowing headlights.
  - **Pedestrians:** Homeowners walking to doorsteps, transit riders waiting at bus stops, and bystanders on sidewalks.
- **Security & Oversight Notes:** All graphics are rendered procedurally on the Canvas without external image assets or third-party tracking pixels.

### Section 6: Commercial Delivery & Logistics State Machine
- **What is in this section:** Delivery fleet controller (`updateDeliveryPool`, `updateVanState`, `isCurbsideSpotOccupied`, `deliveredParcels`).
- **Plain English Explanation:** Simulates couriers delivering packages to residents based on weekly delivery settings:
  1. As delivery volume increases, more vans join the route.
  2. The van drives down the street toward its destination home.
  3. If a legal curbside parking stall is vacant, the van pulls off the road into the stall. If the street is completely full, the van halts in the travel lane with hazard blinkers on (double-parking), realistically modeling curbside delivery friction.
  4. The delivery driver hops out carrying a parcel, walks across the driveway apron and public sidewalk directly to the front doorstep, places the package down, walks back to the van, and safely rejoins traffic.
- **Security & Oversight Notes:** Drivers strictly adhere to sidewalks and designated driveway cuts, never walking through buildings or fences.

### Section 7: Curbside Dial Gauge & Live Occupancy Metrics
- **What is in this section:** Dashboard gauge rendering (`drawGauge`) and dynamic threshold coloring (`getGaugeStatusColor`).
- **Plain English Explanation:** Draws a semi-circular dashboard dial gauge (similar to an automotive speedometer) that displays real-time curbside occupancy:
  - **Green (0% – 80%):** Curbside parking is readily available.
  - **Yellow (80% – 130%):** Curbside stalls are approaching or at full capacity.
  - **Red (> 130%):** Severe curbside overload; vehicles must circle the block searching for open stalls.
  - Features high-contrast, bold numbers (e.g. `8/11 Cars`) for immediate legibility.
- **Security & Oversight Notes:** Redraws are cached and only execute when vehicle counts change, preventing unnecessary battery drain on mobile devices.

### Section 8: Forward Collision Avoidance & Object Detection Engine
- **What is in this section:** Physical bounding boxes and collision algorithms (`hasLateralOverlap`, `getSafetyBuffer`, `checkForwardObstacle`, `canChangeLane`).
- **Plain English Explanation:** Guarantees that cars, trucks, buses, delivery vans, police cruisers, fire trucks, cyclists, and scooter riders **never drive through or clip into each other**:
  1. **Global Obstacle Registry (`allRoadObstacles`):** Every moving or parked vehicle and rider registers its length and width on every single frame.
  2. **Lateral Proximity Check:** Checks if two vehicles are in the same travel lane with a 1.2-unit safety margin.
  3. **Classification-Based Stop Gaps:** Assigns realistic stopping distances (e.g. 9.5 units for large buses and fire trucks, 6.5 units for passenger cars, 4.5 units for bicycles and scooters) plus a courtesy buffer when following bikes.
  4. **Smooth Deceleration & Strict Clamp:** Approaching vehicles decelerate naturally; if a car is stopped ahead, the trailing vehicle halts at the exact safe threshold. Forward coordinates are capped strictly so fronts never penetrate rears.
  5. **Side-Swipe & Blind-Spot Guard:** Vehicles cannot shift lanes or pull out of parking stalls without verifying that adjacent lanes are clear.
- **Security & Oversight Notes:** Algorithmic physics loop prevents infinite loops, memory leaks, and visual glitches.

### Section 9: Painter's Algorithm Depth-Ordered Render Queue
- **What is in this section:** Unified 2.5D visual sorting pipeline (`getIsometricDepthKey`, `renderQueue.sort()`).
- **Plain English Explanation:** In an isometric drawing, objects that are "further back" on the street must be drawn first, and objects "closer to the front" must be drawn on top so they naturally overlap correctly:
  - Computes a mathematical depth key: $\text{depthKey} = (x + w \cdot 0.75) + (y + d) \cdot 1.15$
  - Gathers all scene elements (parked cars, delivery vans, fire trucks, police cruisers, transit buses, cyclists, pedestrians, bus shelters, and walkers) into a single master queue.
  - Sorts them from back to front before drawing each frame.
- **Security & Oversight Notes:** Eliminates visual glitches such as cars appearing inside buildings or bus shelters appearing behind vehicles that are behind them.

### Section 10: Edmonton Police Services (EPS) Emergency Blockage Resolution
- **What is in this section:** Traffic monitoring timer (`laneNorthStuckTimer`, `laneSouthStuckTimer`, `policeBlockageUnit`, `policeTrafficCar`, `policeOfficerPed`).
- **Plain English Explanation:** If a commercial delivery van double-parks or a lane becomes completely blocked by stopped vehicles for more than 20 seconds:
  1. An automated emergency trigger alerts Edmonton Police Services.
  2. An EPS police cruiser arrives with flashing cherry-and-blue lights and siren chirps, decelerating safely behind the queued cars.
  3. A uniformed police officer steps out into the roadway, gestures to direct queued traffic, and successfully clears the gridlock before departing.
- **Security & Oversight Notes:** Project managers can test this behavior anytime in the simulation drawer or via the developer console (`window.__dispatchPoliceBlockageTest()`).

### Section 11: Circling Vehicles & Parallel Parking Logic
- **What is in this section:** Parking spot evaluation state machine (`cruising`, `found_spot`, `attempting_reverse`, `docking`, `parked`, `giving_up`).
- **Plain English Explanation:** When street parking is congested, excess vehicles circle the block looking for a spot:
  - If a driver encounters an open stall smaller than 80% of vehicle length, the car attempts to fit, realizes the spot is too tight, gives up, and resumes circling.
  - If the stall is 150% or larger than vehicle length, the car reverses smoothly into the curb, completes the maneuver, shuts off its engine, and the resident walks into their home.
- **Security & Oversight Notes:** Realistic behavior demonstrating why tight infill curbside spaces cause circling traffic and greenhouse gas emissions.

### Section 12: Heads-Up Display (HUD) Controls & Accessibility Overlay
- **What is in this section:** Overlay buttons, interactive drawer sliders, pinch-to-zoom touch handlers, and keyboard navigation (`Escape`, `Enter`, `Tab`).
- **Plain English Explanation:** Provides user controls on top of the simulation canvas:
  - Mute/unmute button for audio.
  - Controls drawer for manually testing different numbers of infill lots, household vehicles, and visitor passes.
  - One-touch reshuffle button to test randomized parking layouts.
  - Touchscreen pinch-to-zoom and reset camera button (1.33x default).
- **Security & Oversight Notes:** Full compliance with accessibility standards (WCAG 2.1 AA): all clickable touch targets are a minimum of 44x44 pixels with high-contrast focus rings and complete keyboard accessibility.

---

## 3. Compliance & Security Checklist for Municipal Oversight

| Security & Governance Requirement | Implementation Status | Technical Verification |
|:---|:---:|:---|
| **Zero Personal Data Collection** | **PASSED** | The simulation runs 100% locally in the client browser. No names, emails, addresses, or IP addresses are logged or transmitted. |
| **No External Image/Asset Dependencies** | **PASSED** | All buildings, cars, buses, and residents are drawn using HTML5 Canvas vector math. No third-party CDN image requests. |
| **WCAG 2.1 AA Accessibility** | **PASSED** | All controls meet 44x44px minimum sizing, high contrast ratios (City of Edmonton brand colors), and full keyboard navigation. |
| **Audio Privacy & Autoplay Safe** | **PASSED** | Audio context is muted by default and suspended until user interaction; sounds are procedural and hard-capped at 15% volume. |
| **Robust Physics & Collision Safety** | **PASSED** | Unified global obstacle detection and clamping eliminates visual glitches, model overlaps, and simulation hangs. |
| **Cross-Platform Compatibility** | **PASSED** | Tested on desktop web browsers (Chrome, Edge, Safari, Firefox), tablets, and mobile smartphones in portrait/landscape modes. |

---

*This guide serves as official project documentation for administrative reviews, privacy impact assessments (PIA), and technical audits by the City of Edmonton.*

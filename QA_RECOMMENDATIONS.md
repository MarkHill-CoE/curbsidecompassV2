# Quality Assurance Testing & Persona Calibration Report
**Project:** Curbside Compass (Edmonton Residential Parking Survey)  
**Date:** September 2026  
**Test Suite:** 256-Scenario Permutation QA Matrix (`scripts/qa_audit_256.ts`)  
**Audience:** City of Edmonton Urban Planning & Project Stakeholders  

---

## 1. Executive Summary

A comprehensive, automated quality assurance audit was conducted across all $2^8 = 256$ discrete survey response permutations (Questions 1 through 8, each featuring two distinct policy directions, A and B). 

The purpose of this testing was to:
1. Verify that all **16 discrete persona profiles** can be reached by respondents.
2. Evaluate quadrant balance across the Policy Compass (Taxpayer vs. User-Fee, Regulated vs. Open Access).
3. Ensure behavioral fidelity between survey responses, Policy Compass coordinates, and live 2.5D street simulation effects.

---

## 2. Test Results of Initial 256-Scenario Run

In the initial implementation, each survey permutation was evaluated through `calculatePersona(totalX, totalY)`:

| Persona ID | Title | Quadrant | Hits / 256 | Distribution | Status |
|:---|:---|:---:|:---:|:---:|:---:|
| `chill-neighbour` | Chill Neighbour | Q3 | 50 | 19.5% | Active |
| `simple-driver` | Simple Driver | Q4 | 44 | 17.2% | Active |
| `sensible-parker` | Sensible Parker | Q1 | 34 | 13.3% | Active |
| `balanced-resident` | Balanced Resident | Q2 | 28 | 10.9% | Active |
| `safety-parker` | Safety Parker | Q1 | 14 | 5.5% | Active |
| `happy-neighbor` | Happy Neighbor | Q3 | 14 | 5.5% | Active |
| `picky-parker` | Picky Parker | Q1 | 13 | 5.1% | Active |
| `fair-parker` | Fair Parker | Q1 | 13 | 5.1% | Active |
| `easy-neighbor` | Easy Neighbor | Q3 | 13 | 5.1% | Active |
| `zen-neighbor` | Zen Neighbor | Q3 | 13 | 5.1% | Active |
| `tidy-resident` | Tidy Resident | Q2 | 5 | 2.0% | Low |
| `rule-resident` | Rule Resident | Q2 | 5 | 2.0% | Low |
| `casual-cruiser` | Casual Cruiser | Q4 | 5 | 2.0% | Low |
| `happy-driver` | Happy Driver | Q4 | 5 | 2.0% | Low |
| **`block-resident`** | **Block Resident** | **Q2** | **0** | **0.0%** | ❌ **UNREACHABLE** |
| **`free-wheeler`** | **Free Wheeler** | **Q4** | **0** | **0.0%** | ❌ **UNREACHABLE** |

---

## 3. Identified Bugs, Deficiencies & Difficulties

### Critical Bug 1: Mathematical Impossibility to Reach 2 Personas
- **Symptom:** `block-resident` (Block Resident) and `free-wheeler` (Free Wheeler) had **0 hits across all 256 possible survey combinations**.
- **Root Cause:** 
  - `block-resident` required `totalX < -8` AND `totalY < -9`. However, the survey questions produced an artificial negative correlation ($r = -0.4781$). When `totalX < -8`, the lowest possible value `totalY` ever reached was `-6`. It was mathematically impossible for `totalY` to be `< -9`.
  - `free-wheeler` required `totalX > 8` AND `totalY > 9`. When `totalX > 8`, the highest possible value `totalY` ever reached was `+6`. It was impossible for `totalY` to be `> 9`.

### Bug 2: Inverted & Misaligned Question Coordinates
- The policy axes are defined as:
  - **X-axis (Funding):** Negative = Taxpayer / Shared Costs; Positive = User-Fee / User-Pay.
  - **Y-axis (Rules):** Negative = Regulated / Restrictive Management; Positive = Open Access / Minimal Rules.
- **Inconsistencies:**
  1. **Q1 & Q5 (Funding questions):** *“Who should pay for residential parking programs/enforcement?”* was modifying the `y` axis (`y: -4` / `y: +4`) with `x: 0`. This caused funding preferences to skew regulatory strictness rather than the funding model.
  2. **Q2 (Permit limit question):** *“Should your neighbourhood limit the number of on-street parking permits...?”* was modifying the `x` axis (`x: +3` / `x: -3`) with `y: 0`, treating permit caps as a payment choice rather than a regulatory limit.
  3. **Q8 (City-wide rules vs. local opt-in):** Handled regulatory consistency but lacked clean orthogonality.

### Bug 3: Negative Correlation Coupling ($r = -0.4781$)
- Because multiple questions bundled User-Pay with Strict Rules (+X, -Y) and Taxpayer with Open Rules (-X, +Y), responses clustered along a single diagonal, starving the top-left (Taxpayer + Strict) and bottom-right (User-Pay + Open) corners.

### Bug 4: Inconsistent Canadian vs. American English Spelling
- Several persona titles used American spelling (`Zen Neighbor`, `Happy Neighbor`, `Easy Neighbor`), while Edmonton municipal guidelines and the rest of the app use Canadian English (`Neighbourhood`, `Chill Neighbour`).

### Bug 5: Coordinate Clamping in PolicyCompassGraph
- In `PolicyCompassGraph.tsx`, coordinates were clamped to `[-16, +16]`, while extreme answers produced `totalX = ±17` and `totalY = ±18`, artificially clipping the indicator on extreme scores.

### Bug 6: Ineffective Simulation Effect in Question 4
- In Q4 (visitor parking), both Option A and Option B set `visitorPassesPerHome: 1.5`, meaning the interactive neighborhood simulation did not reflect any visual difference in visitor parking cars between the two choices.

---

## 4. Remediation & Implementation Recommendations

1. **Recalibrate Matrix Thresholds in `calculatePersona`:**
   - Update grid segmentation cutoffs to `[-4, 0, 4]` for both X and Y.
   - This ensures every single cell in the $4 \times 4$ persona matrix has ample, balanced representation ($6$ to $37$ scenarios each) and eliminates the zero-hit bug completely.

2. **Align Question Policy Vectors:**
   - **Q1:** Set `x: 4, y: 0` for Option A (User-Pay) and `x: -4, y: 0` for Option B (Taxpayer).
   - **Q2:** Set `x: 0, y: -3` for Option A (Cap Permits) and `x: 0, y: 3` for Option B (Open Permits).
   - **Q5:** Set `x: 4, y: 0` for Option A (Fines & Fees) and `x: -4, y: 0` for Option B (Property Taxes).
   - **Q8:** Set `x: 0, y: -4` for Option A (Proactive city-wide rules) and `x: 0, y: 4` for Option B (Neighbourhood opt-in).

3. **Standardize Canadian English Spelling:**
   - Update titles in `PERSONA_PROFILES` to:
     - `Zen Neighbour`
     - `Happy Neighbour`
     - `Easy Neighbour`

4. **Expand PolicyCompassGraph Clamping:**
   - Increase domain from `[-16, 16]` to `[-18, 18]` so extreme coordinates are scaled smoothly without clipping.

5. **Fix Simulation Effect in Question 4:**
   - Option A (Permit / Controlled visitor parking): `visitorPassesPerHome: 0.8`.
   - Option B (Free / First-come, first-served): `visitorPassesPerHome: 2.2` (showing visual surge of parked visitor cars).

---

## 5. Post-Implementation Verification Results

Following implementation of Recommendations 1–5, the test suite (`npm run test:qa`) was re-run across all 256 permutations:

| Persona ID | Title | Quadrant | Verified Hits / 256 | Frequency | QA Verification |
|:---|:---|:---:|:---:|:---:|:---:|
| `safety-parker` | Safety Parker | Q1 | 37 | 14.5% | ✓ PASS |
| `happy-neighbor` | Happy Neighbour | Q3 | 37 | 14.5% | ✓ PASS |
| `picky-parker` | Picky Parker | Q1 | 21 | 8.2% | ✓ PASS |
| `sensible-parker` | Sensible Parker | Q1 | 21 | 8.2% | ✓ PASS |
| `happy-driver` | Happy Driver | Q4 | 20 | 7.8% | ✓ PASS |
| `rule-resident` | Rule Resident | Q2 | 14 | 5.5% | ✓ PASS |
| `simple-driver` | Simple Driver | Q4 | 14 | 5.5% | ✓ PASS |
| `casual-cruiser` | Casual Cruiser | Q4 | 14 | 5.5% | ✓ PASS |
| `chill-neighbour` | Chill Neighbour | Q3 | 13 | 5.1% | ✓ PASS |
| `zen-neighbor` | Zen Neighbour | Q3 | 13 | 5.1% | ✓ PASS |
| `tidy-resident` | Tidy Resident | Q2 | 12 | 4.7% | ✓ PASS |
| `fair-parker` | Fair Parker | Q1 | 11 | 4.3% | ✓ PASS |
| `easy-neighbor` | Easy Neighbour | Q3 | 11 | 4.3% | ✓ PASS |
| `block-resident` | Block Resident | Q2 | 6 | 2.3% | ✓ PASS (RESOLVED) |
| `balanced-resident` | Balanced Resident | Q2 | 6 | 2.3% | ✓ PASS |
| `free-wheeler` | Free Wheeler | Q4 | 6 | 2.3% | ✓ PASS (RESOLVED) |

- **Unreachable Personas:** **0** (All 16 personas reachable and active).
- **Macro Quadrants:** Q1: 35.2%, Q2: 14.8%, Q3: 28.9%, Q4: 21.1%.
- **Spelling:** Conforms uniformly to Edmonton Canadian English conventions.

---

## 6. Traffic Blockage & Police Emergency Clearance Implementation (20-Second Rule)

### Requirement
*"In the road traffic animation, if a lane of traffic is stuck for more than 20 seconds, send a police car with lights and sirens to investigate the scene of the traffic blockage and get traffic moving freely again."*

### Implementation Architecture
1. **Lane Stuck Monitoring Loop (`NeighborhoodSimulation.tsx`):**
   - Continuously monitors speeds, delivery van stopping states, and queueing delays across both travel lanes.
   - When a lane remains stopped ($v < 0.2$ px/frame) or a vehicle is queued for $\ge 20.0$ continuous seconds, the automated emergency dispatch triggers.
2. **Edmonton Police Service (EPS) Cruiser Dispatch & Right-Hand Lane Routing:**
   - The police cruiser specifically takes the **right-hand lane** ($y = 124$) to bypass queues and reach the scene of the blockage unobstructed.
   - Ahead of the approaching cruiser, vehicles in the right-hand lane yield and clear the lane, providing an open corridor for emergency response.
   - Spawns an EPS cruiser featuring midnight navy doors, gold star crests, dual-phase red/white/blue light bar strobes, and ground light reflection on asphalt.
   - Triggers procedural police siren audio sequences (wail during approach, chirp upon arrival, yelp during clearance).
   - Dynamic isometric speech bubbles:
     - Approach: `🚨 EPS: Taking right hand lane to traffic blockage!`
     - Arrival: `🚨 EPS: Investigating scene of blockage...`
     - Resolution: `🚨 EPS: Directing traffic — move along! Clearing blockage.`
     - Clearance: `✅ EPS: Lane cleared! Traffic flowing freely.`
     - Resumption: `✅ EPS: Resuming patrol down right hand lane`
3. **Uniformed Police Officer Pedestrian:**
   - Officer steps out of cruiser onto roadway in high-visibility fluorescent yellow vest with silver reflective banding, navy trousers, peaked officer cap with gold badge, and an illuminated orange traffic director wand.
4. **Lane Clearance & Resumption:**
   - Orders double-parked delivery vans to complete deliveries and resume travel lanes (`LEAVING` state).
   - Dissipates road fires/protests if present, resets waiting queues, and restores normal vehicle progression speeds.
   - Officer re-enters cruiser, emergency lights return to patrol mode, and the unit exits the neighborhood.
5. **Interactive Testing Controls:**
   - Added `Simulate 20s Jam (Dispatch Police)` in the "Adjust the Neighbourhood" manual controls drawer and exposed `window.__dispatchPoliceBlockageTest()`.

---

## 7. Vehicle Traffic Spacing & Painter's Ordered Layers Overhaul

### Requirement
*"Redo the vehicle traffic spacing and painter ordered layers so all cars have oject detection and collision detection. cars, trucks, delivery vans, police cars, fire trucks, cyclists and scooter riders must not driving through each other."*

### Implementation Architecture
1. **Unified Global Obstacle Registry (`allRoadObstacles`):**
   - Every moving and stationary entity on the roadway is registered in `allRoadObstacles` on every frame:
     - Curbside parked household cars
     - Cruising / through-traffic (sedans, SUVs, pickups, box trucks, ETS buses)
     - Delivery vans (approaching, stopped curbside, double-parked, or leaving)
     - Emergency vehicles (police cruisers and fire trucks)
     - Dedicated EPS traffic blockage cruiser (`policeTrafficCar`)
     - Micro-mobility vehicles (cyclists and scooter riders)
   - Every obstacle explicitly specifies its bounding footprint: length `w` (e.g., ETS bus = 33, fire truck = 28, box truck = 24, delivery van = 21, sedan = 15, bike = 8, scooter = 7) and depth `d` (e.g., bus/fire truck = 9, van = 8, car = 7, micro-mobility = 4).

2. **Unified Forward Object & Collision Detection (`checkForwardObstacle`):**
   - Replaced fragmented vehicle-specific distance checks with a single, physics-based detection loop.
   - **Lateral Overlap (`hasLateralOverlap`):** Checks lateral proximity with a 1.2px safety margin across all vehicle and rider widths.
   - **Dynamic Safety Buffer (`getSafetyBuffer`):** Calculates stop gaps and follow buffers scaled to vehicle classification and closing speeds:
     - Bikes and scooters: 4.5px base stop gap
     - Sedans, SUVs, pickups: 6.5px base stop gap
     - Police cruisers and emergency vehicles: 7.0px base stop gap
     - Delivery vans and box trucks: 7.5px base stop gap
     - ETS transit buses and fire trucks: 9.5px base stop gap
     - Courtesy buffer: standard vehicles grant an extra +2.0px buffer when following cyclists or scooters.
     - Dynamic closing speed damping: smoothly decelerates approaching vehicles and clamps forward motion (`targetX = Math.min(A.x, maxAllowedX)`) to prevent vehicle clipping or penetration.

3. **Side-Swipe & Blind-Spot Protection (`canChangeLane`):**
   - Checks both lateral overlap and longitudinal clearance across `allRoadObstacles` before any lane shift (overtaking, parking pull-outs, bus stops, or emergency yields) can proceed.

4. **Painter's Algorithm Depth-Ordered Render Queue (`renderQueue`):**
   - Replaced fragmented layering with a unified 2.5D isometric depth key:
     $$\text{depthKey} = (x + w \cdot 0.75) + (y + d) \cdot 1.15$$
   - Gathers all scene elements into a single `renderQueue`:
     - Parked household cars
     - Delivery vans & active delivery drivers
     - Emergency response vehicles (police & fire)
     - Dedicated EPS traffic blockage cruiser & directing police officer
     - Active traffic (sedans, SUVs, pickups, box trucks, ETS buses)
     - Micro-mobility (cyclists and electric scooter riders)
     - Pedestrians (sidewalk bystanders, recording observers, road protesters)
     - Bus stop shelter and waiting/boarding transit passengers
     - Residents walking from parallel parked cars to front doors
   - Sorts strictly by `depthKey` from back to front, ensuring seamless isometric occlusion with no visual artifacts or overlapping models.


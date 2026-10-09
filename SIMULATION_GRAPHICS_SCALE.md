# City of Edmonton Curbside Compass: Graphic Assets Scale & Procedural Geometry Specification

**Project:** Curbside Compass (Residential Parking Simulation & Policy Survey)  
**Document:** Graphic Scale, Pixel Density & Procedural Polygon Specification  
**Target Audience:** Urban Planners, Simulation Engineers, 3D Artists, GIS Specialists, and City Stakeholders  
**Author:** Engineering Team  
**Date:** October 2026  
**Primary Source Component:** `/src/components/NeighborhoodSimulation.tsx`

---

## 1. Executive Summary & Coordinate System Overview

The **Curbside Compass Neighborhood Simulation** renders a real-time, browser-based 2.5D isometric model of an Edmonton residential street block. Unlike traditional tile-based or raster-sprite engines, **100% of the graphic assets in this simulation are procedurally modeled and rendered using vector math on an HTML5 2D Canvas context**.

To ensure architectural accuracy when comparing policy outcomes across heritage neighbourhoods, skinny infills, and suburban front-garage subdivisions, all assets adhere to a strict internal geometric coordinate system derived from City of Edmonton municipal standards (such as **Bylaw 5590**, the **Complete Streets Design and Construction Standards**, and **Edmonton Transit Service Specifications**).

---

## 2. Mathematical Projection Engine & Pixels per Metre (px/m)

### 2.1 3D World Coordinate Space
The simulation models physical space using a Cartesian right-handed coordinate frame:
- **$X$ (Longitudinal Axis):** Extends along the roadway from the west end ($x = 0$) to the east end of the block ($x = 380$ units).
- **$Y$ (Transverse Axis):** Extends across the street profile, encompassing the rear lane ($y = -24$ to $-6$), private residential lots ($y = 0$ to $70$), public sidewalk ($y = 70$ to $78$), grass boulevard swale ($y = 78$ to $92.4$), legal curbside ($y = 92.4$ to $93.3$), and the two-way asphalt roadway ($y = 93$ to $138$).
- **$Z$ (Vertical Axis):** Represents height above ground level, from street pavement ($z = 0$) up to 3-storey building parapets ($z = 18.6$ units).

### 2.2 True 30° Isometric Projection Formula
The 3D coordinates $(x, y, z)$ are projected onto screen pixels $(x_{\text{screen}}, y_{\text{screen}})$ via the transformation:

$$\begin{aligned}
x_{\text{screen}} &= (x - y) \cdot \text{ISO\_X} + \text{offsetX} \\
y_{\text{screen}} &= (x + y) \cdot \text{ISO\_Y} - z \cdot \text{ISO\_Z} + \text{offsetY}
\end{aligned}$$

Where:
- $\text{scale} = 2.2$ (default baseline canvas scale at 1.0× zoom; dynamic zoom spans $0.7\times$ to $1.8\times$)
- $\text{ISO\_X} = \text{scale} \cdot \cos(30^\circ) = 2.2 \cdot \frac{\sqrt{3}}{2} \approx \mathbf{1.905256 \text{ px / coordinate unit}}$
- $\text{ISO\_Y} = \text{scale} \cdot \sin(30^\circ) = 2.2 \cdot 0.5 = \mathbf{1.100000 \text{ px / coordinate unit}}$
- $\text{ISO\_Z} = \text{scale} = \mathbf{2.200000 \text{ px / coordinate unit}}$
- $\text{offsetX} = 380\text{ px}$, $\text{offsetY} = 160\text{ px}$ (centering origin offsets)

### 2.3 Isometric Vector Length on Screen
For any physical element of coordinate length $\Delta x$ extending along the street:
$$L_{\text{screen}} = \sqrt{(\Delta x \cdot \text{ISO\_X})^2 + (\Delta x \cdot \text{ISO\_Y})^2} = \sqrt{(\Delta x \cdot 2.2 \cos 30^\circ)^2 + (\Delta x \cdot 2.2 \sin 30^\circ)^2} = \mathbf{2.20 \cdot \Delta x \text{ pixels}}$$

Every **1.0 coordinate unit in world space equals exactly 2.20 screen pixels** along the primary isometric axes.

---

### 2.4 Calculating Number of Pixels per Metre (px/m)

The simulation bridges real-world metric measurements and coordinate units across two calibrated domains:

#### A. Vehicular & Infrastructure Scale (Curbside Stalls, Roadways & Vehicles)
- **Standard Edmonton Curbside Parallel Stall:**
  - Real-world size: **6.00 m** (City of Edmonton Design & Construction Standard)
  - Simulation size: **16.00 coordinate units**
  - Metric ratio: $\frac{16.00\text{ units}}{6.00\text{ m}} \approx \mathbf{2.667 \text{ coordinate units / metre}}$ (or $0.375\text{ m / unit}$)
  - On-screen pixel length: $16.00 \times 2.20 = \mathbf{35.2 \text{ pixels}}$
  - **Pixels per Metre:**
    $$\text{Scale}_{\text{vehicular}} = \frac{35.2 \text{ px}}{6.0 \text{ m}} = 2.667 \text{ units/m} \times 2.20 \text{ px/unit} \approx \mathbf{5.87 \text{ px / metre}}$$

- **Edmonton Transit Service (ETS) 40ft Bus (New Flyer XD40):**
  - Real-world length: **12.50 m** (41.0 ft)
  - Simulation length: **33.00 coordinate units**
  - Metric ratio: $\frac{33.00\text{ units}}{12.50\text{ m}} = \mathbf{2.640 \text{ coordinate units / metre}}$
  - On-screen pixel length: $33.00 \times 2.20 = \mathbf{72.6 \text{ pixels}}$
  - Pixels per Metre: $\frac{72.6\text{ px}}{12.50\text{ m}} = \mathbf{5.81 \text{ px / metre}}$

- **30-Metre ETS Bus Stop No-Parking Zone:**
  - Real-world length: **30.00 m**
  - Simulation span: **80.00 coordinate units** ($x = 295$ to $375$)
  - Metric ratio: $\frac{80.00\text{ units}}{30.00\text{ m}} = \mathbf{2.667 \text{ coordinate units / metre}}$
  - On-screen pixel length: $80.00 \times 2.20 = \mathbf{176.0 \text{ pixels}}$
  - Pixels per Metre: $\frac{176.0\text{ px}}{30.00\text{ m}} = \mathbf{5.87 \text{ px / metre}}$

#### B. Architectural & Lot Planning Scale (Lot Widths, Building Footprints & Heights)
- **Standard Residential Lot Frontage (Mature Laned / 50ft Lot):**
  - Real-world width: **15.60 m** (approx. 51.2 ft)
  - Simulation lot width: **30.50 coordinate units**
  - Metric ratio: $\frac{30.50\text{ units}}{15.60\text{ m}} \approx \mathbf{1.955 \text{ coordinate units / metre}}$ (or $0.511\text{ m / unit}$)
  - On-screen pixel width: $30.50 \times 2.20 = \mathbf{67.1 \text{ pixels}}$
  - **Pixels per Metre:**
    $$\text{Scale}_{\text{architectural}} = \frac{67.1 \text{ px}}{15.60 \text{ m}} = 1.955 \text{ units/m} \times 2.20 \text{ px/unit} \approx \mathbf{4.30 \text{ px / metre}}$$

- **Missing-Middle 8-Plex Multi-Unit Building:**
  - Building frontage: **13.00 m** real life = **25.40 coordinate units** ($\implies \mathbf{4.30 \text{ px / metre}}$)
  - Building depth: **30.00 m** real life = **58.00 coordinate units** ($\implies \mathbf{4.25 \text{ px / metre}}$)
  - Building height: **9.50 m** (3 storeys + parapet) = **18.60 coordinate units** ($\implies \mathbf{4.31 \text{ px / metre}}$)

#### C. Summary Scale Range
| Scale Context | Real-World Anchor | Coordinate Ratio | Screen Pixels per Metre (at 1.0× Zoom) | Screen Pixels per Metre (at 1.5× Zoom) |
|---|---|---|---|---|
| **Vehicular / Stalls / Street Safety** | 6.0m Stall / 12.5m ETS Bus / 30m Bus Zone | 2.67 units / m | **5.87 px / m** | **8.80 px / m** |
| **Architectural / Lot Footprint** | 15.6m Lot / 13.0m 8-Plex Building | 1.96 units / m | **4.30 px / m** | **6.45 px / m** |
| **Composite Viewport Average** | Full Street Block (180m / 380 units) | 2.11 units / m | **4.64 – 5.87 px / m** (~**5.0 px / m** nominal) | **7.50 px / m** |

---

## 3. Procedural Geometry & Polygon Definition

In 2.5D canvas rendering, every 3D object is decomposed into a collection of shaded 2D planar polygons:

1. **`drawFlatRect(x, y, w, d, color)`**:
   - Generates **1 polygon** (a 4-vertex quadrilateral lying flat on the $z = 0$ ground plane). Used for sidewalks, road asphalt, parking stall lines, driveways, and ground shadows.
2. **`drawBlock(x, y, z, w, d, h, topColor, leftColor, rightColor)`**:
   - Generates **3 polygons** (three 4-vertex quadrilaterals: Top Face, Left Face, and Right Face). In 30° isometric projection, exactly 3 faces of an orthogonal cuboid are visible from the camera viewpoint. Each face is independently stroked, shaded, and filled with sunlight-calibrated hues.
3. **`drawPitchedRoof(x, y, z, w, d, h, roofColor, gableColor)`**:
   - Generates **2 polygons** (1 triangular gable polygon with 3 vertices + 1 quadrilateral roof pitch plane with 4 vertices).
4. **Decals & Custom Vector Shapes**:
   - Diagonal chevron stripes, hazard beacons, and wheel hubcaps use individual 3-vertex or 4-vertex vector paths, each counting as **1 polygon**.

---

## 4. Master Graphic Assets Scale & Polygon Table

The table below details every procedurally generated asset in the simulation, including its real-life dimensions, coordinate dimensions, screen pixel footprint, and the exact polygon count required to build it.

| Asset Category | Asset Name | Real-Life Size ($L \times W \times H$) | Simulation Coordinate Units ($X \times Y \times Z$) | Projected Screen Pixel Footprint ($W \times H$) | Procedural Polygons Count | Procedural Construction Breakdown |
|---|---|---|---|---|---|---|
| **Vehicles** | **Standard Resident Sedan** (`sedan`) | 4.80 m × 1.85 m × 1.45 m | 15.0 × 7.0 × 3.3 | 33.0 px × 24.2 px | **19 polygons** | 1 ground shadow quad + 4 wheels ($4 \times 3$) + 1 chassis body (3) + 1 glass cabin (3) |
| **Vehicles** | **Transverse Sedan** (`sedanY`, in driveway/garage) | 1.85 m × 4.80 m × 1.45 m | 7.0 × 15.0 × 3.3 | 33.0 px × 24.2 px | **19 polygons** | 1 ground shadow quad + 4 wheels ($4 \times 3$) + 1 chassis body (3) + 1 glass cabin (3) |
| **Vehicles** | **EPS Police Cruiser** (`police`) | 4.90 m × 1.90 m × 1.50 m | 15.0 × 7.0 × 3.6 | 33.0 px × 28.5 px | **38 polygons** | 2 shadow/strobe quads + 4 wheels ($4 \times 3$) + 1 white chassis (3) + 1 navy door wrap (3) + 1 gold stripe (3) + 1 glass cabin (3) + 1 lightbar mount (3) + 3 LED strobe pods (9) |
| **Vehicles** | **Fire Rescue Engine** (`firetruck`) | 8.80 m × 2.60 m × 3.30 m | 24.0 × 9.0 × 8.7 | 52.8 px × 42.0 px | **25 polygons** | 1 ground shadow quad + 4 wheels ($4 \times 3$) + 1 pumper body (3) + 1 forward cab (3) + 1 chrome grille (3) + 1 emergency beacon (3) |
| **Vehicles** | **Compact / Midsize SUV** (`suv`) | 4.90 m × 1.95 m × 1.75 m | 16.0 × 7.5 × 4.2 | 35.2 px × 26.5 px | **19 polygons** | 1 ground shadow quad + 4 wheels ($4 \times 3$) + 1 SUV body (3) + 1 tinted cabin (3) |
| **Vehicles** | **Transverse SUV** (`suvY`, in driveway/garage) | 1.95 m × 4.90 m × 1.75 m | 7.5 × 16.0 × 4.2 | 35.2 px × 26.5 px | **19 polygons** | 1 ground shadow quad + 4 wheels ($4 \times 3$) + 1 SUV body (3) + 1 tinted cabin (3) |
| **Vehicles** | **Full-Size Pickup Truck** (`pickup`) | 5.80 m × 2.05 m × 1.90 m | 18.0 × 7.5 × 4.2 | 39.6 px × 27.5 px | **22 polygons** | 1 ground shadow quad + 4 wheels ($4 \times 3$) + 1 cargo bed (3) + 1 cab body (3) + 1 cabin greenhouse (3) |
| **Vehicles** | **Courier Delivery Van** (`deliveryVan`) | 6.80 m × 2.40 m × 2.90 m | 21.0 × 8.0 × 9.2 | 46.2 px × 41.5 px | **49 polygons** | 1 shadow quad + 6 wheel/rim blocks ($6 \times 3$) + 1 cargo box (3) + 3 green stripe paths + 1 cab (3) + 1 bumper/grille (3) + 1 headlight (3) + 1 windshield (3) + 4 hazard blinkers ($4 \times 3$) |
| **Vehicles** | **Commercial Box Truck** (`boxTruck`) | 7.80 m × 2.50 m × 3.50 m | 24.0 × 8.0 × 10.5 | 52.8 px × 45.0 px | **22 polygons** | 1 shadow quad + 4 wheels ($4 \times 3$) + 1 cargo box (3) + 1 commercial cab (3) + 1 windshield (3) |
| **Vehicles** | **ETS 40ft Transit Bus** (`etsBus`) | 12.50 m × 2.60 m × 3.20 m | 33.0 × 8.6 × 12.8 | 72.6 px × 58.0 px | **148 polygons** | 1 shadow quad + 10 wheel/hubcap blocks ($10 \times 3$) + 1 skirt (3) + 1 silver body (3) + 2 wheel arches (6) + 1 gold stripe (3) + 1 blue band (3) + 1 glass band (3) + 4 window pillars (12) + 3 bi-fold door blocks (9) + 2 roof blocks (6) + 6 HVAC/battery blocks (18) + 3 front cap blocks (9) + 2 destination sign blocks (6) + 5 bumper/light blocks (15) + 4 bike rack blocks (12) + 3 marker lights (9) |
| **Characters** | **Standard Pedestrian** (Walking / Bystander) | 0.50 m × 0.40 m × 1.75 m | 1.4 × 1.4 × 6.4 | 4.5 px × 15.0 px | **12 polygons** | 1 pants block (3) + 1 torso/shirt block (3) + 1 face/skin block (3) + 1 hair block (3) |
| **Characters** | **EPS Police Officer** (With Wand) | 0.50 m × 0.40 m × 1.80 m | 1.6 × 1.6 × 6.8 | 5.2 px × 16.5 px | **24 polygons** | 1 pants (3) + 1 high-vis vest (3) + 1 silver stripe (3) + 1 face (3) + 1 peaked cap (3) + 1 cap visor (3) + 1 gold crest (3) + 1 traffic wand (3) |
| **Characters** | **Bystander with Smartphone** | 0.50 m × 0.40 m × 1.75 m | 1.4 × 1.4 × 6.4 | 4.5 px × 15.5 px | **18 polygons** | 4 standard body blocks ($4 \times 3 = 12$) + 1 raised arm/phone (3) + 1 glowing illuminated phone screen (3) |
| **Mobility** | **Resident with 4-Wheel Walker** | 0.90 m × 0.65 m × 1.75 m | 3.5 × 1.8 × 6.1 | 8.5 px × 15.2 px | **45 polygons** | 4 walker wheels ($4 \times 3$) + 4 frame legs ($4 \times 3$) + 1 seat (3) + 1 basket (3) + 2 handles (6) + 3 pedestrian body blocks (9) |
| **Mobility** | **Motorized Mobility Scooter & Rider** | 1.25 m × 0.70 m × 1.40 m | 4.0 × 2.4 × 5.8 | 10.5 px × 14.5 px | **48 polygons** | 4 scooter wheels ($4 \times 3$) + 1 floorboard (3) + 1 steering tiller (3) + 1 handlebar (3) + 1 basket (3) + 1 headlight (3) + 2 chair blocks (6) + 4 rider blocks (12) |
| **Mobility** | **Wheelchair Occupant & Companion Pusher** | 1.50 m × 0.70 m × 1.75 m | 4.5 × 2.0 × 6.3 | 11.5 px × 16.0 px | **60 polygons** | 4 wheels ($4 \times 3$) + 2 push rims (6) + 1 seat (3) + 1 backrest (3) + 1 footrest (3) + 2 push handles (6) + 3 occupant blocks (9) + 6 companion pusher blocks (18) |
| **Active Trans.** | **Commuter Cyclist on Bicycle** | 1.80 m × 0.60 m × 1.60 m | 6.0 × 1.0 × 5.5 | 14.5 px × 13.5 px | **21 polygons** | 2 wheels ($2 \times 3$) + 1 bike frame (3) + 4 seated cyclist blocks ($4 \times 3 = 12$) |
| **Active Trans.** | **Stand-Up Electric Scooter** (`drawScooter`) | 1.10 m × 0.45 m × 1.35 m | 7.0 × 1.0 × 4.6 | 16.5 px × 12.0 px | **18 polygons** | 1 footboard deck (3) + 1 steering column (3) + 4 standing rider blocks ($4 \times 3 = 12$) |
| **Streetscape** | **Curbside Parking Stall Markings** | 6.00 m × 2.40 m | 16.0 × 7.5 × 0.0 | 35.2 px × 16.5 px | **2 polygons** | 2 white painted limit lines ($2 \times 1$ flat quads) |
| **Streetscape** | **Fire Hydrant (City of Edmonton Standard)** | 0.50 m × 0.50 m × 0.95 m | 1.8 × 1.8 × 4.0 | 5.5 px × 10.5 px | **28 polygons** | 1 ground shadow ellipse + 1 base ring (3) + 1 lower barrel (3) + 1 main barrel (3) + 1 reflective collar (3) + 1 steamer port (3) + 2 side nozzle caps (6) + 1 post & bylaw plate (6) |
| **Streetscape** | **Fire Hydrant 5m Clearance Zone** | 10.00 m × 2.40 m | 33.0 × 7.5 × 0.0 | 72.6 px × 16.5 px | **15 polygons** | 1 yellow curb face + 1 yellow top curb + 11 diagonal hatch marks + 2 white limit lines |
| **Streetscape** | **30m ETS Bus Stop Curb Zone** | 30.00 m × 2.40 m | 80.0 × 7.5 × 0.0 | 176.0 px × 16.5 px | **21 polygons** | 1 yellow curb face + 1 yellow top curb + 17 yellow diagonal hatch marks + 2 white boundary limit bars |
| **Streetscape** | **ETS Bus Stop Shelter & Waiting Bench** | 6.00 m × 2.80 m × 2.80 m | 20.0 × 9.2 × 11.3 | 44.0 px × 30.0 px | **38 polygons** | 2 concrete/tactile quads + 4 stanchion posts ($4 \times 3 = 12$) + 1 wood bench (3) + 2 glass windscreens (6) + 2 canopy roof blocks (6) + 3 signpost blocks (9) |
| **Streetscape** | **Bioswale Rain Garden Bulb-Out** | 5.50 m × 4.20 m × 0.20 m | 18.0 × 14.0 × 0.8 | 39.6 px × 22.0 px | **3 polygons** | 1 concrete curb surround + 1 permeable soil bed + 1 native drought-tolerant plant cluster |
| **Streetscape** | **Residential Sidewalk Slab** (per 8-unit segment) | 3.50 m × 1.80 m | 8.0 × 8.0 × 0.0 | 17.6 px × 12.0 px | **2 polygons** | 1 concrete surface slab + 1 expansion joint groove line |
| **Vegetation** | **Mature American Elm Boulevard Tree** | Canopy Ø 8.0m × H 14.0m | 10.0 × 10.0 × 24.0 | 25.0 px × 55.0 px | **15 polygons** | 1 trunk base (3) + 2 branch brackets (6) + 2 layered lush foliage cuboids ($2 \times 3 = 6$) |
| **Vegetation** | **Columnar Infill Boulevard Tree** | Canopy Ø 3.5m × H 9.0m | 5.5 × 5.5 × 18.0 | 14.0 px × 42.0 px | **6 polygons** | 1 slender trunk (3) + 1 columnar foliage block (3) |
| **Vegetation** | **Multi-Tiered Pine / Conifer Tree** | Canopy Ø 6.5m × H 11.0m | 9.0 × 9.0 × 16.0 | 22.0 px × 38.0 px | **9 polygons** | 1 trunk (3) + 2 tiered foliage blocks ($2 \times 3 = 6$) |
| **Vegetation** | **Manicured Front-Yard Shrub** | Ø 1.20m × H 1.40m | 2.2 × 2.2 × 3.5 | 5.5 px × 8.5 px | **3 polygons** | 1 organic sheared foliage cube (3) |
| **Architecture** | **Heritage Mid-Century Bungalow (1950s)** | 12.00 m × 11.50 m × 6.50 m | 16.0 × 24.0 × 19.5 | 45.0 px × 58.0 px | **35 polygons** | 1 main living level (3) + 1 pitched roof (2) + 1 brick chimney (3) + 1 veranda deck (3) + 1 veranda roof (3) + 2 veranda posts (6) + 1 stairs (3) + 1 window (3) + 1 door (3) + 1 yard fence (6) |
| **Architecture** | **Heritage Rear Detached Garage** | 6.50 m × 7.50 m × 4.20 m | 12.0 × 15.5 × 11.1 | 32.0 px × 36.0 px | **44 polygons** | 1 concrete apron (3) + 1 garage body (3) + 4 horizontal siding shadow lines (12) + 3 corner trim blocks (9) + 1 door frame (3) + 1 raised door face (3) + 3 groove lines (9) + 1 pitched roof (2) |
| **Architecture** | **Suburban 2-Storey House** (Front Driveway) | 11.00 m × 13.00 m × 8.50 m | 12.5 × 27.0 × 22.0 | 48.0 px × 65.0 px | **29 polygons** | 1 foundation (3) + 1 2-storey house body (3) + 1 pitched roof (2) + 1 entry porch (3) + 1 porch roof (3) + 2 porch posts (6) + 1 front door (3) + 2 upper windows (6) |
| **Architecture** | **Front-Attached Double Garage** (Suburban) | 7.50 m × 8.50 m × 4.80 m | 15.5 × 17.0 × 12.7 | 42.0 px × 42.0 px | **41 polygons** | 1 garage body (3) + 1 gabled roof (2) + 1 sectional overhead door (3) + 1 inner panel (3) + 3 panel grooves (9) + 4 glass inserts (12) + 2 coach lights (6) + 1 side shrub (3) |
| **Architecture** | **Modern Infill Skinny Home Pair (Duplex)** | 13.50 m × 14.00 m × 9.50 m | 27.5 × 25.5 × 22.0 | 72.0 px × 68.0 px | **51 polygons** | **Unit A (20):** Body (3) + Roof (2) + Cedar slats (3) + Windows/trim (9) + Porch (3)<br>**Unit B (17):** Body (3) + Roof (2) + Accent panel (3) + Windows/trim (9)<br>**Garage Suite (14):** Body (3) + Roof (2) + Windows (6) + Door (3) |
| **Architecture** | **Connected 3-Storey Townhome Block** | 15.00 m × 13.00 m × 9.80 m | 29.5 × 25.0 × 19.0 | 78.0 px × 62.0 px | **30 polygons** | 1 brick ground level (3) + 1 composite upper level (3) + 1 parapet cap (3) + 1 fire-separation wall (3) + 2 stoop entries (6) + 2 glass balconies (6) + 2 window suites (6) |
| **Architecture** | **Missing-Middle 8-Plex Multi-Unit Building** | 13.00 m × 30.00 m × 9.50 m | 25.4 × 58.0 × 18.6 | 98.0 px × 82.0 px | **133 polygons** | 1 concrete foundation apron quad + 2 masonry brick base blocks (6) + 1 upper composite block (3) + 5 warm cedar accent bay blocks (15) + 1 metal accent bay (3) + 1 parapet cap (3) + 3 solar PV panel blocks (9) + 7 entrance portico blocks (21) + 4 ground windows (12) + 16 cantilevered balconies & window suites (48) + 4 active bike rack blocks (12) |

---

## 5. Architectural Lot Typology Layout Specifications

Edmonton neighbourhoods in the simulation are configured across four distinct street typologies. The table below outlines how coordinate boundaries, stall capacities, and street widths are assigned across each archetype:

| Typology ID | Neighbourhood Archetype | Front Lot Width | Rear Lane Access | Legal Curbside Stalls | Street Width (Curb-to-Curb) | Frontage Features |
|---|---|---|---|---|---|---|
| **`mature_laned`** | **Homes with Rear-lane Access** *(Mid-Century 1950s Heritage)* | 15.6 m (30.5 units) | Yes (Unpaved gravel alley, $y = -24$ to $-6$) | **12 legal stalls** (19.8 unit intervals) | 11.5 m (45.0 units, unmarked residential asphalt) | Detached rear garages, mature canopy boulevard elms, uninterrupted curbside |
| **`infill_skinny`** | **Multiple Homes on Smaller Lots** *(Infill & Redeveloping Core)* | 15.6 m subdivided into two 7.8 m skinny lots | Yes (Smooth paved alley with 2-storey garage suites) | **12 legal stalls** (Continuous curb line) | 11.5 m (45.0 units, smooth dense asphalt) | Dual front walkways, permeable landscaping, zero front driveway curb-cuts |
| **`suburban_front_driveway`** | **Homes with Front Driveways** *(Suburban Curbside 1980s–Present)* | 15.6 m (30.5 units) | No (Private fenced backyards, no rear lane) | **10 legal stalls** (Restricted by driveways) | 11.5 m (45.0 units, residential asphalt) | 13.5-unit front concrete driveways, attached double garages, 1.5m yellow curb cuts (Bylaw 5590) |
| **`contemporary_townhomes`** | **Townhomes** *(Transit-Oriented & Infill)* | Connected 15.0 m townhome parcels | Yes (Tuck-under rear service lane) | **9 legal stalls** (Arranged in pocket bays) | 11.5 m (45.0 units, traffic-calmed pavement) | 4 Landscaped bioswale bulb-outs, 3 pocket parking bays, integrated 30m ETS transit stop |

---

## 6. Rendering Performance & Memory Optimization

1. **Painter's Algorithm Depth Sorting:**
   Because all assets are rendered in 2.5D space without a hardware Z-buffer, assets are sorted along the compound depth axis:
   $$\text{Depth} = X + Y$$
   Elements with lower $X + Y$ are positioned further from the camera and are rendered first; elements with higher $X + Y$ overlap them naturally.
2. **Offscreen Canvas Caching:**
   To guarantee smooth 60 FPS performance across lower-powered municipal hardware:
   - **Ground Layer (`bgGroundCanvas`):** The roadway, grass boulevard, curbs, sidewalks, and parking stall markings are rendered once into an offscreen cache canvas.
   - **Buildings Layer (`bgHousesCanvas`):** All houses, garages, fences, porches, and infill 8-plexes are pre-rasterized offscreen.
   - **Trees Layer (`bgTreesCanvas`):** Mature elm foliage and boulevards are pre-rasterized offscreen.
   - **Real-Time Dynamic Layer (`ctx`):** Only moving vehicles (cars, buses, delivery vans), pedestrians, cyclists, strobe lighting, and UI speech bubbles are recalculated on each animation frame.
3. **Total Scene Polygon Load:**
   - **Static Scene:** Approx. **1,450 to 1,980 polygons** (cached offscreen).
   - **Dynamic Vehicles & Pedestrians (active block):** Approx. **350 to 750 polygons per frame**.
   - **Total Active Polygon Budget:** Well under **3,000 polygons**, requiring less than **4 MB** of RAM and consuming under 3% CPU utilization on modern web browsers.

---

## 7. Compliance & Standards Reference

1. **City of Edmonton Traffic Bylaw 5590 (Section 37):**
   - Prohibits parking within **1.5 metres** of any driveway edge (modeled as 1.5-unit yellow curb markings and diagonal road-edge hatch lines).
   - Prohibits parking within **5.0 metres** of a fire hydrant (modeled as 10.0-unit yellow curb safety zone with white boundary demarcation lines).
2. **Edmonton Transit Service (ETS) Design Standards:**
   - Standard transit stop clearance is **30.0 metres** (modeled as an 80-unit yellow painted curb zone spanning $x = 295$ to $375$).
3. **Complete Streets Design and Construction Standards (Volume 2):**
   - Standard parallel curbside stall length: **6.00 m** ($16.0$ units) to **7.00 m** for end stalls.
   - Standard sidewalk width: **1.50 m – 1.80 m** ($8.0$ coordinate units).
   - Standard residential travel lane: **3.00 m – 3.50 m** per direction.

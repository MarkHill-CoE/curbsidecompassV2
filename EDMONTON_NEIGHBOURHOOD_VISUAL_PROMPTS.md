# Edmonton Curbside Compass — Neighbourhood Visual Style Prompts & Palette Specifications

This reference document defines the **Master Visual Style Prompt** and **Four Edmonton Neighbourhood Typology Prompts**. Every prompt is mathematically and visually reverse-engineered from the **Curbside Compass 2.5D Isometric Simulation Engine** (`/src/components/NeighborhoodSimulation.tsx`) to guarantee identical perspective, geometric layout, lighting, stroke discipline, and official City of Edmonton colour palette.

---

## 1. Master Neighbourhood Visual Style Prompt (Base Template)

Use this **Master Style Prompt** as the foundational prefix for generating any neighbourhood scene in the exact style of the Curbside Compass simulation:

```text
Crisp 2.5D isometric orthographic municipal planning illustration of an Edmonton residential street corridor, 30-degree isometric projection angle, zero perspective distortion, zero vanishing point, clean geometric low-poly vector block art style.

COMPOSITION & DEPTH ZONES (TOP-LEFT TO BOTTOM-RIGHT):
1. Residential Lots (Top/Background): Clean rectangular residential building blocks with 30-degree pitched gabled roofs, flat geometric facade panels, recessed front doors (#FFFFFF with #CBD5E1 frames), neat horizontal window panes (#EEF5F9 with soft blue glass shading #A2C8E0).
2. Private Front Lawns & Walkways: Vibrant manicured grass lawns (#86C274), neat concrete pedestrian walkways (#D0D4D8), single-car concrete driveways (#9CA0A4) with faint expansion joints (#7E8387).
3. Public Pedestrian Corridor: Unbroken continuous municipal sidewalk (#B5BAC0) with scored expansion joint scorelines (#9A9FA3) cutting across all driveways.
4. Grass Boulevard & Urban Canopy: Lush planting boulevard (#7BB369) between sidewalk and curb, featuring mature boulevard trees with dark organic mulch rings (#2C1E16), dark bark trunks (#5C4033), and stepped geometric cubic foliage canopies (#009A44, #15803D, #22C55E highlights). Includes authentic City of Edmonton infrastructure: safety-yellow painted curb clearance zones (#FBBF24) and cast-iron fire hydrants (Edmonton fire red #DC2626 body with safety-yellow bonnet #FBBF24).
5. Roadway & Curbside (Bottom/Foreground): Smooth dark charcoal asphalt road (#505357) with dashed white centreline markings (#E0E0E0), designated curbside parking lanes with parked and moving vehicles (sedans, SUVs, pickup trucks, delivery vans).

COLOUR PALETTE & SHADING:
- Directional daylighting with consistent facet shading: Top faces full brightness, Left faces -15% shade, Right faces -30% shade, Roof pitches -45% shade. Crisp subtle outlines (0.8px dark translucent stroke rgba(0,0,0,0.15)).
- Authentic City of Edmonton Colour Accents: Sky Blue (#0081BC), Marigold Gold (#FFC72C), Parkland Green (#009A44), Heritage Brick Red (#E8552D), Deep River Navy (#005087), Royal Plum (#68217A).
- Pavement & Hardscaping: Road asphalt #505357, Sidewalks #B5BAC0, Driveways #9CA0A4, Curbs & markings #FBBF24.
- Pristine, friendly civic-tech urban planning graphic, uncluttered, no photorealism, no tilt-shift blur, no organic digital painting smudges, strictly clean isometric geometry.
```

---

## 2. The Four Edmonton Neighbourhood Typologies

Here are the four distinct Edmonton neighbourhood prompts. Each builds directly on top of the Master Style, modifying the architectural typologies, lot dimensions, driveway arrangements, tree canopies, and curbside parking dynamics:

---

### Typology 1: Mature / Historic Infill Neighbourhood (Core & Mature)
*Examples: Strathcona, Garneau, Ritchie, Westmount, Glenora, Oliver / Wîhkwêntôwin*

```text
[INSERT MASTER STYLE PROMPT HERE]

SPECIFIC NEIGHBOURHOOD TYPOLOGY: Mature Edmonton Historic & Infill Residential Block.
- Architecture: A mix of traditional 1920s-1940s craftsman character homes alongside modern split skinny infill duplexes (two slender 15-unit-wide modern houses on a single 50-foot lot). Siding painted in Edmonton Deep River Navy (#005087), Heritage Brick Red (#E8552D), and Sky Blue (#0081BC).
- Driveway & Curb Configuration: Rear lane / back alley access. ZERO front driveways or curb cuts for the infill houses; narrow shared walkways (#D0D4D8) leading directly to the front doors. Continuous curbside street frontage.
- Urban Forestry: Soaring mature American Elm canopy with large interlocking geometric green foliage (#009A44, #166534) arching over the street, casting soft shadows on the boulevard grass (#7BB369) and dark mulch rings (#2C1E16).
- Curbside Activity: High curbside parking demand with parked sedans and hatchbacks along the curb. Edmonton statutory 5-metre yellow painted fire hydrant zone (#FBBF24) and a red-and-yellow City of Edmonton fire hydrant (#DC2626 / #FBBF24). Active pedestrians and a bicycle riding on the asphalt street.
```

---

### Typology 2: Established Mid-Century Suburb (Inner Ring / Post-War)
*Examples: Ottewell, Capilano, Holyrood, Bonnie Doon, Meadowlark Park*

```text
[INSERT MASTER STYLE PROMPT HERE]

SPECIFIC NEIGHBOURHOOD TYPOLOGY: Established 1960s Mid-Century Edmonton Suburb.
- Architecture: Broad, low-slung single-storey mid-century bungalows and split-level homes on wide 55-unit lots with shallow pitched gable roofs (#475569) and brick/siding facades in Edmonton Parkland Green (#009A44), Marigold Yellow (#FFC72C), and warm neutrals.
- Driveway & Curb Configuration: Standard private front driveways (9.5-unit width, #9CA0A4) accommodating 2 parked family vehicles off-street. Dropped concrete curb aprons (#8E9398) with stencilled 1.5-metre safety yellow curb clearance zones (#FBBF24) painted on either side of each driveway entrance.
- Urban Forestry: Stately mid-century Green Ash and Birch trees planted evenly along the wide grass boulevard (#7BB369), with cubic stepped canopies in emerald and forest green (#15803D, #047857).
- Curbside Activity: Moderate, balanced curbside parking demand with 1-2 parked pickup trucks and family SUVs, clear driveway sightlines, and wide open asphalt lanes (#505357) with white dashed centre lines (#E0E0E0).
```

---

### Typology 3: Developing / Modern Outer Suburb (Greenfield / Outer Ring)
*Examples: Windermere, Terwillegar, Chappelle, Tamarack, McConachie*

```text
[INSERT MASTER STYLE PROMPT HERE]

SPECIFIC NEIGHBOURHOOD TYPOLOGY: Modern Developing Edmonton Outer Suburb / Greenfield Community.
- Architecture: High-density two-storey modern suburban homes and paired duplexes on narrow 40-unit zero-lot-line parcels. Contemporary facades featuring mixed materials, dark asphalt shingles (#334155), and vibrant accent gables in Edmonton Sky Blue (#0081BC) and Royal Plum (#68217A).
- Driveway & Curb Configuration: Dominant front-attached 2-car garages and wide double concrete driveways (#9CA0A4) occupying over 60% of the front lot width. Multiple closely spaced dropped curb aprons with yellow clearance markings (#FBBF24).
- Urban Forestry: Young, freshly planted municipal boulevard saplings with slender trunks (#5C4033) and smaller rounded cubic foliage spheres (#22C55E, #10B981) staked in fresh dark bark mulch (#2C1E16).
- Curbside Activity: High curbside congestion with multiple parked oversized pickup trucks and SUVs squeezed tightly between adjacent driveway aprons, an Amazon-style white parcel delivery box truck double-parked with safety flashers, and delivery couriers walking up concrete steps.
```

---

### Typology 4: High-Density Transit-Oriented & Mixed-Use Core
*Examples: Downtown Edmonton, Wîhkwêntôwin Urban Edge, Blatchford, Century Park, Stadium District*

```text
[INSERT MASTER STYLE PROMPT HERE]

SPECIFIC NEIGHBOURHOOD TYPOLOGY: High-Density Urban Transit-Oriented Development (TOD) & Mixed-Use Node.
- Architecture: 3- to 4-storey modern multi-unit row townhomes and flat-roofed mass-timber mid-rises with step-back balconies, rooftop patio gardens, large street-level storefront windows, and architectural cladding in crisp whites, charcoal zinc, and Edmonton Marigold Gold (#FFC72C) and Deep Navy (#005087).
- Streetscape & Multimodal Infrastructure: ZERO front driveways or private curb cuts. A dedicated curbside ETS Transit Bus Bay (#FFC72C yellow-painted transit boarding curb and chevron road hatching) with a waiting Edmonton Transit Service (ETS) city bus in white and navy livery. A green-painted protected curbside bicycle track (#009A44) separated from traffic by white delineator bollards.
- Urban Realm & Public Amenities: Broad concrete boulevard pavers (#CBD5E1), neat square tree grates housing boulevard trees, municipal bike lock rings (#94A3B8), street benches, and designated 15-minute commercial loading zones stencilled on the asphalt.
- Curbside Activity: Strictly regulated metered curbside stalls, a parked electric car at a curbside EV charging station, active pedestrian clusters chatting on the sidewalk, and seamless multimodal mobility.
```

---

## 3. Negative Prompt & AI Slop Filter

When using image generation models (Gemini / Imagen 3 / Midjourney / DALL-E 3 / Stable Diffusion), always append this negative prompt filter to prevent photorealism, distortion, or visual noise:

```text
NEGATIVE PROMPT / RESTRICTIONS:
photorealistic, photograph, 3D photorealism, photographic textures, depth of field blur, tilt-shift lens blur, bokeh, motion blur, distorted angles, non-isometric perspective, one-point perspective, two-point perspective, vanishing lines, fisheye lens, messy organic brushstrokes, sketch lines, watercolor splatter, noisy gradients, illegible gibberish text, floating artefacts, low resolution, muddy shadows, gloomy lighting, dark night scene.
```

---

## 4. City of Edmonton Colour Palette Hex Reference Table

| Element | Color Name | Hex Code | Visual Application |
| :--- | :--- | :---: | :--- |
| **House Accent 1** | Edmonton Sky Blue | `#0081BC` | House facade, sedans, branding accents |
| **House Accent 2** | Edmonton Marigold Yellow | `#FFC72C` | House facade, transit zones, honk indicators |
| **House Accent 3** | Edmonton Parkland Green | `#009A44` | House facade, bike tracks, tree leaves |
| **House Accent 4** | Edmonton Heritage Red | `#E8552D` | House facade, brick siding, hydrant highlights |
| **House Accent 5** | Edmonton Deep Navy | `#005087` | House facade, ETS bus livery, police cruisers |
| **House Accent 6** | Edmonton Royal Plum | `#68217A` | House facade, modern siding accents |
| **Front Lawns** | Manicured Grass | `#86C274` | Private residential front lawns |
| **Boulevard** | Parkway Grass | `#7BB369` | Public strip between sidewalk and curb |
| **Boulevard Trees** | Urban Forest Green | `#15803D` / `#009A44` | American Elm & Green Ash stepped cubic canopies |
| **Tree Mulch** | Dark Organic Mulch | `#2C1E16` | Circular mulch rings at base of trees |
| **Sidewalk** | Municipal Concrete | `#B5BAC0` | Continuous public sidewalk corridor |
| **Walkways** | Private Walkway | `#D0D4D8` | Front door and entry paths |
| **Driveways** | Driveway Concrete | `#9CA0A4` | Private single- and double-car driveway aprons |
| **Roadway** | Asphalt | `#505357` | Street roadway surface |
| **Curbs & Clearances**| Safety Yellow | `#FBBF24` | 1.5m driveway clearance, 5m hydrant no-parking |
| **Fire Hydrant** | Edmonton Red & Yellow | `#DC2626` / `#FBBF24` | 5m clearance statutory boulevard hydrant |
| **Transit Bay** | Transit Gold | `#FFC72C` | ETS Bus Stop curb and chevron road hatching |

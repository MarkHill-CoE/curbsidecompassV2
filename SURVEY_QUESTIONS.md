# Curbside Compass — Survey Questions, Scoring Matrix & Simulation Effects

This document details all survey questions, answer choices, scoring impacts (X & Y axis coordinates), and corresponding neighborhood simulation configuration effects (`drivewayCapacity` and `householdCarsPerHome`).

---

## Baseline Simulation Configuration

Before any survey question options are chosen, the default neighborhood simulation configuration is:

| Parameter | Baseline Value | Description |
| :--- | :--- | :--- |
| **`drivewayCapacity`** | **2** | Maximum vehicles that park off-street in each home's driveway |
| **`householdCarsPerHome`** | **2.5** | Average number of vehicles owned per household |
| **`visitorPassesPerHome`** | **0.5** | Average visitor vehicles per home |
| **`deliveriesPerHomePerWeek`** | **1.0** | Commercial/delivery vehicle frequency |
| **`enforcementLevel`** | **`standard`** | Parking compliance enforcement (`lenient`, `standard`, `strict`) |
| **`cruisingTrafficLevel`** | **`moderate`** | Circling traffic looking for parking (`low`, `moderate`, `high`) |
| **`curbsideFeeModel`** | **`free`** | Curbside pricing model (`free`, `permit`, `metered`) |

---

## Master Summary Table

| Q# | Question Summary | Option | Answer Choice Text | X Score | Y Score | Driveway Capacity | Household Cars / Home | Additional Simulation Effects |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Q1** | Who pays for residential parking programs? | **A** | Residents with vehicles pay permit fees | `0` | `-4` | **2** | **2.0** | 12 cars total fit in driveways (0 street parking) |
| | | **B** | Taxpayers cover program costs via property taxes | `0` | `+4` | **1** | **2.6** | ~16 cars total: 6 in driveway, 10 on street |
| **Q2** | Limit number of on-street parking permits? | **A** | Yes | `+3` | `0` | **2** | **1.8** | Encourages off-street driveway parking |
| | | **B** | No | `-3` | `0` | **1** | **2.5** | More vehicles park on the street |
| **Q3** | Restrictions on commercial & trade vehicles? | **A** | Specialized paid permits for work/loading zones | `+2` | `-2` | *2 (unchanged)* | *2.5 (unchanged)* | `deliveriesPerHomePerWeek: 2`, `enforcementLevel: 'strict'` |
| | | **B** | No restrictions — open access without permits | `-2` | `+2` | *2 (unchanged)* | *2.5 (unchanged)* | `deliveriesPerHomePerWeek: 4`, `enforcementLevel: 'lenient'` |
| **Q4** | Manage visitor parking? | **A** | Digital registration with regular enforcement | `+3` | `-3` | *2 (unchanged)* | *2.5 (unchanged)* | `visitorPassesPerHome: 0.5`, `enforcementLevel: 'strict'` |
| | | **B** | First-come, first-served basis | `-3` | `+3` | *2 (unchanged)* | *2.5 (unchanged)* | `visitorPassesPerHome: 1.5`, `enforcementLevel: 'lenient'` |
| **Q5** | Who pays for parking enforcement? | **A** | Residents & visitors through permits & fines | `0` | `-4` | **2** | **1.8** | `curbsideFeeModel: 'permit'` |
| | | **B** | Edmontonians through property taxes | `0` | `+4` | **1** | **2.8** | `curbsideFeeModel: 'free'` |
| **Q6** | Parking near institutions & hospitals? | **A** | Paid parking with time limits & frequent enforcement | `+3` | `-3` | *2 (unchanged)* | *2.5 (unchanged)* | `enforcementLevel: 'strict'`, `cruisingTrafficLevel: 'low'`, `visitorPassesPerHome: 0.2` |
| | | **B** | Maintain free, unenforced parking | `-3` | `+3` | *2 (unchanged)* | *2.5 (unchanged)* | `enforcementLevel: 'lenient'`, `cruisingTrafficLevel: 'high'`, `visitorPassesPerHome: 1.2` |
| **Q7** | Accessible parking zones during events? | **A** | Strict eligibility checks & digital passes | `+2` | `-2` | *2 (unchanged)* | **2.0** | `enforcementLevel: 'strict'` |
| | | **B** | No active enforcement, rely on public courtesy | `-2` | `+2` | *2 (unchanged)* | **2.5** | `enforcementLevel: 'lenient'` |
| **Q8** | Individual neighbourhood parking rules? | **A** | Allow neighbourhoods to opt into fee solutions | `+4` | `0` | **2** | **2.0** | Fewer street cars, more driveway parking |
| | | **B** | Apply one city-wide set of rules | `-4` | `0` | **1** | **3.0** | High street occupancy |
| **Q9** | Demographic / location identification | *Text* | Full Postal Code (e.g. `T5J 2R7`) | `0` | `0` | *2 (unchanged)* | *2.5 (unchanged)* | Spatial analysis; validation: 6 or 7 alphanumeric chars |

---

## Detailed Question Breakdown

### Question 1: Program Funding
> **"Who should pay for residential parking programs?"**  
> *Category:* `residential`

- **Option A (`q1_a`)**:
  - **Label**: *"Residents with vehicles in residential parking program areas pay permit fees that cover all program costs."*
  - **Score**: `X: 0`, `Y: -4` (Strong User-Pay / Cost Recovery)
  - **Driveway Capacity**: `2`
  - **Household Cars Per Home**: `2.0`
  - **Simulation Effect Note**: Total 12 cars across 6 homes; all 12 fit in off-street driveways, resulting in 0 street parking demand.

- **Option B (`q1_b`)**:
  - **Label**: *"Tax-payers cover program costs through property tax revenues."*
  - **Score**: `X: 0`, `Y: +4` (Strong Public / Taxpayer-Funded)
  - **Driveway Capacity**: `1`
  - **Household Cars Per Home**: `2.6`
  - **Simulation Effect Note**: Total ~16 cars across 6 homes; 6 fit in driveways and 10 spill over onto on-street curbside parking.

---

### Question 2: On-Street Permit Limits
> **"Should your neighbourhood limit the number of on-street parking permits residents can hold?"**  
> *Category:* `visitors`

- **Option A (`q2_a`)**:
  - **Label**: *"Yes."*
  - **Score**: `X: +3`, `Y: 0` (Structured / Regulated Access)
  - **Driveway Capacity**: `2`
  - **Household Cars Per Home**: `1.8`
  - **Simulation Effect Note**: Restricts on-street permit allocation, driving vehicles into private driveways and keeping streets clear.

- **Option B (`q2_b`)**:
  - **Label**: *"No."*
  - **Score**: `X: -3`, `Y: 0` (Unrestricted / Open Access)
  - **Driveway Capacity**: `1`
  - **Household Cars Per Home**: `2.5`
  - **Simulation Effect Note**: Allows unrestricted permit volume, increasing curbside vehicle counts.

---

### Question 3: Commercial & Trade Vehicles
> **"What restrictions should be placed on commercial and trade vehicles in residential areas?"**  
> *Category:* `commercial`

- **Option A (`q3_a`)**:
  - **Label**: *"Specialized paid permits are required to access work/loading zones."*
  - **Score**: `X: +2`, `Y: -2`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.5` *(Baseline)*
  - **Additional Effects**: `deliveriesPerHomePerWeek: 2`, `enforcementLevel: 'strict'`

- **Option B (`q3_b`)**:
  - **Label**: *"No restrictions - commercial and trade vehicles have access and do not require paid permits."*
  - **Score**: `X: -2`, `Y: +2`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.5` *(Baseline)*
  - **Additional Effects**: `deliveriesPerHomePerWeek: 4`, `enforcementLevel: 'lenient'`

---

### Question 4: Visitor Parking Management
> **"How would you manage visitor parking in your neighbourhood?"**  
> *Category:* `visitors`

- **Option A (`q4_a`)**:
  - **Label**: *"Visitors digitally register their vehicles, with enforcement conducted regularly."*
  - **Score**: `X: +3`, `Y: -3`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.5` *(Baseline)*
  - **Additional Effects**: `visitorPassesPerHome: 0.5`, `enforcementLevel: 'strict'`

- **Option B (`q4_b`)**:
  - **Label**: *"Visitor parking is on a first-come, first-served basis."*
  - **Score**: `X: -3`, `Y: +3`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.5` *(Baseline)*
  - **Additional Effects**: `visitorPassesPerHome: 1.5`, `enforcementLevel: 'lenient'`

---

### Question 5: Enforcement Funding
> **"Who should pay for residential parking enforcement?"**  
> *Category:* `finance`

- **Option A (`q5_a`)**:
  - **Label**: *"Residents and visitors — through permit fees, guest pass sales and violation fines."*
  - **Score**: `X: 0`, `Y: -4`
  - **Driveway Capacity**: `2`
  - **Household Cars Per Home**: `1.8`
  - **Additional Effects**: `curbsideFeeModel: 'permit'`

- **Option B (`q5_b`)**:
  - **Label**: *"Edmontonians — through property taxes."*
  - **Score**: `X: 0`, `Y: +4`
  - **Driveway Capacity**: `1`
  - **Household Cars Per Home**: `2.8`
  - **Additional Effects**: `curbsideFeeModel: 'free'`

---

### Question 6: Major Traffic Generators
> **"How would you manage parking near major traffic generators, like educational institutions and hospitals?"**  
> *Category:* `enforcement`

- **Option A (`q6_a`)**:
  - **Label**: *"Paid parking with time limits and frequent enforcement."*
  - **Score**: `X: +3`, `Y: -3`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.5` *(Baseline)*
  - **Additional Effects**: `enforcementLevel: 'strict'`, `cruisingTrafficLevel: 'low'`, `visitorPassesPerHome: 0.2`

- **Option B (`q6_b`)**:
  - **Label**: *"Maintain free, unenforced parking for visitors."*
  - **Score**: `X: -3`, `Y: +3`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **HouseholdCarsPerHome**: `2.5` *(Baseline)*
  - **Additional Effects**: `enforcementLevel: 'lenient'`, `cruisingTrafficLevel: 'high'`, `visitorPassesPerHome: 1.2`

---

### Question 7: Accessible Event Parking
> **"How would you manage accessible parking zones during events?"**  
> *Category:* `residential`

- **Option A (`q7_a`)**:
  - **Label**: *"Conduct strict eligibility and digital pass checks, plus regular enforcement."*
  - **Score**: `X: +2`, `Y: -2`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.0`
  - **Additional Effects**: `enforcementLevel: 'strict'`

- **Option B (`q7_b`)**:
  - **Label**: *"No active enforcement, relying on public courtesy to obey zone signage."*
  - **Score**: `X: -2`, `Y: +2`
  - **Driveway Capacity**: `2` *(Baseline)*
  - **Household Cars Per Home**: `2.5`
  - **Additional Effects**: `enforcementLevel: 'lenient'`

---

### Question 8: Neighbourhood Flexibility
> **"How should parking rules respond to the individual needs of each neighbourhood?"**  
> *Category:* `residential`

- **Option A (`q8_a`)**:
  - **Label**: *"Allow neighbourhoods to opt into fee-based parking solutions."*
  - **Score**: `X: +4`, `Y: 0` (Decentralized / Targeted Policy)
  - **Driveway Capacity**: `2`
  - **Household Cars Per Home**: `2.0`

- **Option B (`q8_b`)**:
  - **Label**: *"Apply one city-wide set of rules."*
  - **Score**: `X: -4`, `Y: 0` (Centralized / Uniform Policy)
  - **Driveway Capacity**: `1`
  - **Household Cars Per Home**: `3.0`

---

### Question 9: Neighbourhood Location (Postal Code)
> **"Please enter your full postal code."**  
> *Category:* `location`  
> *Type:* Free-form text (`input`)

- **Option Values**: User-provided Canadian Postal Code (e.g. `T5J 2R7`, `T6G 2R3`, `T5K 1X4`)
- **Score Impact**: `X: 0`, `Y: 0` *(Neutral demographic location data; does not shift policy coordinates)*
- **Driveway Capacity**: `2` *(Baseline unchanged)*
- **Household Cars Per Home**: `2.5` *(Baseline unchanged)*
- **Validation Rule**: Must contain 6 or 7 alphanumeric characters.

---

## Coordinate Scoring Compass Ranges

| Total Score Range | X-Axis Policy Dimension | Y-Axis Funding Dimension |
| :--- | :--- | :--- |
| **Negative (-)** | Open / Universal Access (Less regulation) | User-Pay / Direct Beneficiary Funding |
| **Positive (+)** | Targeted / Structured Access (More regulation) | Taxpayer-Funded / General Municipal Revenue |

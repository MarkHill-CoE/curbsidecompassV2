# Curbside Compass: Question Coordinate Weights & Policy Rationale

**Document:** Survey Coordinate Weighting & Fairness Analysis  
**Project:** City of Edmonton Residential Curbside Parking Management  
**Application:** Curbside Compass  
**Version:** 1.0 (Post-QA Calibration)  

---

## 1. Executive Summary & Policy Coordinate System

The **Curbside Compass** categorizes public attitudes toward residential curb management along two foundational policy axes:

```
                          ▲ REGULATED / STRUCTURED (Y < 0)
                          │   (Standardized rules, limits, active enforcement)
                          │
  TAX-PAYER FUNDED        │        USER-FEE FUNDED
  (Shared Civic Cost)     │        (User-Pay / Beneficiary-Pays)
  ◄───────────────────────┼───────────────────────►
  (X < 0)                 │        (X > 0)
                          │
                          │
                          ▼ OPEN ACCESS / PERMISSIVE (Y > 0)
                              (Fewer blanket rules, autonomy, self-regulation)
```

### The Two Axes Defined

1. **X-Axis: Fiscal & Funding Responsibility (Taxpayer vs. User-Pay)**
   - **Negative $X$ ($X < 0$): General Taxpayer / Shared Cost.** Public curbs are viewed as civic public goods funded through municipal property tax revenues, regardless of vehicle ownership.
   - **Positive $X$ ($X > 0$): User-Pay / Direct Beneficiary.** The cost of parking permits, enforcement, and administration is placed on the drivers, residents, and visitors who actively use the curbside infrastructure.

2. **Y-Axis: Regulatory Governance & Curb Structure (Regulated vs. Open Access)**
   - **Negative $Y$ ($Y < 0$): Structured / Regulated Management.** Proactive municipal rules, permit caps, registration mandates, and regular enforcement to prevent overcrowding and ensure turnover.
   - **Positive $Y$ ($Y > 0$): Open Access / Permissive Management.** Minimal municipal restrictions, first-come first-served access, neighbourhood-level autonomy, and voluntary compliance.

### Mathematical Fairness & Zero-Bias Design
- Every question offers two contrasting policy alternatives with **exact opposite signs** ($A = -B$).
- If a respondent answers randomly, the expected value for both axes is exactly zero ($E[X] = 0, E[Y] = 0$).
- No answer is arbitrarily favored or penalized; coordinate weights are directly calibrated to the policy strength of the choice.

---

## 2. Comprehensive Survey Questions & Weighting Matrix

| Q# | Question Text | Option ID | Option Label | X Weight | Y Weight | Compass Placement | Objective Justification & Fairness Rationale |
|:--:|:---|:---:|:---|:---:|:---:|:---|:---|
| **Q1** | **Who should pay for residential parking programs?**<br>*(Category: Residential / Finance)* | `q1_a` | *Residents with vehicles in residential parking program areas pay permit fees that cover all program costs.* | **+4** | **0** | **Strong User-Pay**<br>(Neutral Regulation) | **Fairness Rationale:** This option directly embodies the "user-pay" municipal finance principle: only citizens who store private property on public rights-of-way pay to administer the system. Weighting $X = +4$ provides a strong fiscal shift without skewing regulatory strictness ($Y = 0$), as paying a fee does not inherently dictate how many permits exist or how strictly parking hours are enforced. |
| | | `q1_b` | *Tax-payers cover program costs through property tax revenues.* | **-4** | **0** | **Strong Taxpayer**<br>(Neutral Regulation) | **Fairness Rationale:** This reflects the traditional municipal public-goods model where roads and curbs are maintained from general city coffers. Weighting $X = -4$ reflects an equal and opposite taxpayer commitment ($Y = 0$), fairly positioning respondents who believe street access is an inherent civic entitlement paid through property taxes. |
| **Q2** | **Should your neighbourhood limit the number of on-street parking permits residents can hold?**<br>*(Category: Visitors & Capacity)* | `q2_a` | *Yes.* | **0** | **-3** | **Regulated Management**<br>(Neutral Funding) | **Fairness Rationale:** Limiting the number of permits is a direct regulatory cap on curb capacity, discouraging vehicle hoarding and incentivizing off-street driveway use. It carries $Y = -3$ because it places strict governmental boundaries on resident behavior. It holds $X = 0$ because capping permits can occur under either a paid permit system or a free permit quota. |
| | | `q2_b` | *No.* | **0** | **+3** | **Open Access**<br>(Neutral Funding) | **Fairness Rationale:** Allowing unlimited permits embodies an open, permissive policy where the city does not restrict how many vehicles a household parks on the public road. It carries $Y = +3$, objectively reflecting an aversion to capacity restrictions while remaining neutral on who funds the system ($X = 0$). |
| **Q3** | **What restrictions should be placed on commercial and trade vehicles in residential areas?**<br>*(Category: Commercial)* | `q3_a` | *Specialized paid permits are required to access work/loading zones.* | **+2** | **-2** | **User-Pay + Regulated**<br>(Quadrant 1) | **Fairness Rationale:** Requiring commercial trades and delivery operators to hold dedicated paid permits introduces both a user-pay cost recovery mechanism ($X = +2$) and a clear regulatory constraint on curb space ($Y = -2$). It ensures trade vehicles do not monopolize residential stalls without paying for the commercial right. |
| | | `q3_b` | *No restrictions — commercial and trade vehicles have access and do not require paid permits.* | **-2** | **+2** | **Taxpayer + Open Access**<br>(Quadrant 3) | **Fairness Rationale:** Exempting commercial trades from permits and fees treats service access as an unfettered community necessity ($Y = +2$) supported by the general street network ($X = -2$). It fairly represents respondents who value convenience and lower contractor hurdles over street regulation. |
| **Q4** | **How would you manage visitor parking in your neighbourhood?**<br>*(Category: Visitors)* | `q4_a` | *Visitors digitally register their vehicles, with enforcement conducted regularly.* | **+3** | **-3** | **User-Pay + Regulated**<br>(Quadrant 1) | **Fairness Rationale:** Mandatory digital vehicle registration and active patrols impose an orderly, monitored regulatory structure ($Y = -3$) and shift administrative overhead toward visiting drivers ($X = +3$). This fairly represents users seeking predictable curb availability in front of homes. |
| | | `q4_b` | *Visitor parking is on a first-come, first-served basis.* | **-3** | **+3** | **Taxpayer + Open Access**<br>(Quadrant 3) | **Fairness Rationale:** First-come, first-served access eliminates registration red tape and parking enforcement intrusion ($Y = +3$), treating curb access as open public commons ($X = -3$). This objectively reflects the perspective of hospitality and low bureaucratic friction. |
| **Q5** | **Who should pay for residential parking enforcement?**<br>*(Category: Finance & Compliance)* | `q5_a` | *Residents and visitors — through permit fees, guest pass sales and violation fines.* | **+4** | **0** | **Strong User-Pay**<br>(Neutral Regulation) | **Fairness Rationale:** Funding parking enforcement officers, vehicles, and digital monitoring strictly through violation fines and permit revenues is a cornerstone user-pay policy ($X = +4$). It keeps non-driving taxpayers completely exempt from enforcement costs while remaining neutral ($Y = 0$) on how aggressive the rulebook itself is. |
| | | `q5_b` | *Edmontonians — through property taxes.* | **-4** | **0** | **Strong Taxpayer**<br>(Neutral Regulation) | **Fairness Rationale:** Funding bylaws and enforcement out of general municipal tax revenues treats compliance as a public safety and civic order service ($X = -4$) shared by the entire city. It is fiscally symmetric to Option A without penalizing regulatory preferences ($Y = 0$). |
| **Q6** | **How would you manage parking near major traffic generators, like educational institutions and hospitals?**<br>*(Category: Major Traffic Generators)* | `q6_a` | *Paid parking with time limits and frequent enforcement.* | **+3** | **-3** | **User-Pay + Regulated**<br>(Quadrant 1) | **Fairness Rationale:** Major institutions generate external commuter spillover. Implementing metered paid parking with time limits and frequent patrols is an intentional dual-lever policy: price signals fund turnover ($X = +3$) while strict time limits prevent all-day vehicle storage ($Y = -3$). |
| | | `q6_b` | *Maintain free, unenforced parking for visitors.* | **-3** | **+3** | **Taxpayer + Open Access**<br>(Quadrant 3) | **Fairness Rationale:** Providing free and unenforced parking prioritizes accessible, barrier-free access for patients, students, and institutional visitors ($Y = +3$), placing the spatial burden onto the shared public right-of-way ($X = -3$). It fairly represents individuals who prioritize compassion and ease of access over strict curb turnover. |
| **Q7** | **How would you manage accessible parking zones during events?**<br>*(Category: Accessibility & Events)* | `q7_a` | *Conduct strict eligibility and digital pass checks, plus regular enforcement.* | **+2** | **-2** | **User-Pay + Regulated**<br>(Quadrant 1) | **Fairness Rationale:** Active eligibility verifications and pass validation ensure dedicated spaces are preserved strictly for permitted placard holders ($Y = -2$), with administrative systems funded through user registration ($X = +2$). It objectively reflects a policy priority on verification and rights-protection. |
| | | `q7_b` | *No active enforcement, relying on public courtesy to obey zone signage.* | **-2** | **+2** | **Taxpayer + Open Access**<br>(Quadrant 3) | **Fairness Rationale:** Relying on social norms and unpatrolled signage avoids intrusive surveillance and enforcement conflicts ($Y = +2$), operating within standard civic infrastructure ($X = -2$). It captures respondents who value community trust over punitive municipal intervention. |
| **Q8** | **How should parking rules respond to the individual needs of each neighbourhood?**<br>*(Category: Governance & Standardization)* | `q8_a` | *Apply proactive, city-wide standardized rules across all mature and developing neighbourhoods.* | **0** | **-4** | **Strongly Regulated**<br>(Neutral Funding) | **Fairness Rationale:** Establishing one overarching city-wide regulatory framework establishes uniform, proactive rules that treat curb management as an integrated transportation system ($Y = -4$). It holds $X = 0$ because city-wide consistency can be applied equally across tax-funded or fee-funded models. |
| | | `q8_b` | *Allow neighbourhoods to opt into local solutions on a block-by-block basis.* | **0** | **+4** | **Permissive / Local Autonomy**<br>(Neutral Funding) | **Fairness Rationale:** A decentralized, opt-in petition model allows individual streets to remain completely free of parking rules unless residents explicitly organize to request them ($Y = +4$). It respects neighbourhood autonomy and minimal government overreach ($X = 0$). |
| **Q9** | **Please enter your full postal code.**<br>*(Category: Demographics & Geography)* | `q9` | *(Open text input, e.g., T5J 2R7)* | **0** | **0** | **Demographic Filter** | **Fairness Rationale:** Question 9 collects geographic spatial distribution across Edmonton neighbourhoods (mature core, suburban, developing) for urban planning analysis. It carries **zero weight** on the Policy Compass ($X = 0, Y = 0$) to guarantee that a respondent's geographic residence never biases their ideological persona outcome. |

---

## 3. Structural Policy Groupings

The eight scoring questions are structured into three balanced operational categories:

### Group 1: Pure Fiscal Anchors (X-Axis Orthogonal)
- **Question 1:** Who pays for residential parking programs? ($X = \pm 4, Y = 0$)
- **Question 5:** Who pays for residential parking enforcement? ($X = \pm 4, Y = 0$)
- **Combined Impact:** Up to $\pm 8$ points solely on the Funding Axis. Isolates the fiscal mechanism without confounding regulatory strictness.

### Group 2: Pure Regulatory Anchors (Y-Axis Orthogonal)
- **Question 2:** Should neighbourhoods cap permits per household? ($X = 0, Y = \pm 3$)
- **Question 8:** Standardized city-wide rules vs. local neighbourhood opt-in? ($X = 0, Y = \pm 4$)
- **Combined Impact:** Up to $\pm 7$ points solely on the Governance Axis. Isolates administrative oversight without confounding who pays.

### Group 3: Real-World Mixed Policy Decisions (X-Y Diagonal Levers)
- **Question 3:** Commercial & delivery vehicle permits ($X = \pm 2, Y = \mp 2$)
- **Question 4:** Visitor digital registration vs. first-come, first-served ($X = \pm 3, Y = \mp 3$)
- **Question 6:** High-density institutional generators (hospitals & universities) ($X = \pm 3, Y = \mp 3$)
- **Question 7:** Accessible parking zone verification ($X = \pm 2, Y = \mp 2$)
- **Combined Impact:** Reflects real-world municipal policy choices where user-fee implementations often accompany enforcement mechanisms, while free-access models typically accompany lower regulatory friction.

---

## 4. Coordinate Range & Persona Mapping Verification

With all 8 questions combined, the coordinate bounds are:
- **Maximum Possible Scores:** $X \in [-18, +18]$ and $Y \in [-17, +17]$.
- **Mean Expected Value:** $\mu_X = 0.000$, $\mu_Y = 0.000$.

### Persona Matrix Segmentation ($4 \times 4$ Grid)
The Policy Compass is divided into 16 persona zones using calibrated thresholds of $[-4, 0, 4]$:

```
                          Y < -4          -4 <= Y < 0        0 <= Y <= 4         Y > 4
                    (Strict / Standard)   (Regulated)         (Flexible)      (Autonomous)
──────────────────────────────────────────────────────────────────────────────────────────
X < -4 (Taxpayer)    Block Resident      Rule Resident      Easy Neighbour    Happy Neighbour
-4 <= X < 0          Tidy Resident       Balanced Resident  Chill Neighbour   Zen Neighbour
0 <= X <= 4          Picky Parker        Sensible Parker    Simple Driver     Happy Driver
X > 4 (User-Pay)     Safety Parker       Fair Parker        Casual Cruiser    Free Wheeler
```

Every single cell in this matrix is statistically reachable, thoroughly tested across all 256 response permutations, and fully verified by automated QA testing (`npm run test:qa`).

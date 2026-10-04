# Curbside Compass: Direct CSV Download, Revise & Upload Workflow

A streamlined, self-contained workflow allowing City of Edmonton planners to download the complete survey question dataset as a CSV file, edit questions and options in Excel, Numbers, or Google Sheets, and re-upload the file directly into the application for instant live updates.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Revised Approach based on your feedback:**
> - **Primary Workflow**: **Direct File Download -> Offline/Spreadsheet Revision -> Direct File Upload**.
> - **Zero Cloud Setup**: No Google Drive or published sheet permissions required; works 100% locally with standard `.csv` files.
> - **Instant Validation & Feedback**: Upon uploading the revised CSV, the app previews which questions were changed, verifies schema integrity, and applies updates across the survey immediately.
> - **Persistent & Reversible**: Custom questions persist across browser sessions (via local cache) with an instant "Reset to City Defaults" button if needed.

---

## 1. Overview & Core Concept

### Purpose
To provide the easiest, most familiar workflow for non-technical editors:
1. **Download**: Click "Download Questions CSV" to get the full question dataset.
2. **Revise**: Edit the text columns in Excel, Google Sheets, or any text editor.
3. **Upload**: Drag and drop (or select) the file into the app's upload modal. The app immediately updates all questions, answer options, hints, and trade-offs.

---

## 2. Complete User Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CSV DOWNLOAD, REVISE & UPLOAD FLOW                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: DOWNLOAD CSV                                                       │
│  Click "Copy Editor / CSV" in header -> Click "Download Questions CSV"      │
│  (Downloads curbside_compass_all_questions_text.csv)                        │
│                                                                             │
│  STEP 2: REVISE IN EXCEL OR SHEETS                                          │
│  Open file in Excel, Sheets, or Numbers.                                    │
│  Edit Question_Text, Option_Label, Option_Hint, Gains_Benefits, Pains_Costs. │
│  Save file as CSV.                                                          │
│                                                                             │
│  STEP 3: UPLOAD & APPLY                                                     │
│  Click "Upload Revised CSV" button or drag-and-drop file into the modal.    │
│  App displays instant green confirmation (e.g. "9 Questions Updated").      │
│  The survey questions and 2.5D simulation update live on screen.            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Supported CSV Columns & Format

Editors can edit any of the following standard columns:

| Column Name | Description | Can Be Edited? |
|---|---|:---:|
| `Question_Number` | `Q0`, `Q1`, `Q2` ... `Q8` | Identifier |
| `Category` | Policy category badge (e.g., Residential Funding, Visitor Parking) | **Yes** |
| `Question_Text` | The main civic question prompt | **Yes** |
| `Option_Letter` | `A` or `B` | Identifier |
| `Option_Label` | Full answer statement displayed on choice cards | **Yes** |
| `Option_Hint` | Educational hint displayed below the option | **Yes** |
| `Curbside_Stall_Impact` | Estimated on-street stall delta (e.g. `-1.5 stalls`) | **Yes** |
| `Gains_Benefits` | Real-world policy benefits of this choice | **Yes** |
| `Pains_Costs` | Real-world friction/costs of this choice | **Yes** |
| `Policy_Rationale` | Background municipal policy context | **Yes** |

*(Note: Also maintains backward compatibility with the City's 3-column `Text_Key, Current_Text, Revised_Text` inventory format).*

---

## 4. Technical Implementation Details

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            COMPONENT ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────┐      FileReader       ┌──────────────────────┐  │
│  │ File Upload Dropzone   │ ───────────────────>  │ textSync.ts Engine   │  │
│  │ (Drag & Drop or Pick)  │      readAsText()     │ - Delimiter check    │  │
│  └────────────────────────┘                       │ - CSV Row Parser     │  │
│                                                   │ - Schema Mapper      │  │
│                                                   └──────────┬───────────┘  │
│                                                              │              │
│                                                    Parsed Key-Value Map     │
│                                                              │              │
│                                                              ▼              │
│                                                   ┌──────────────────────┐  │
│                                                   │ TextContentContext   │  │
│                                                   │ - Updates state      │  │
│                                                   │ - Caches to Storage  │  │
│                                                   │ - Triggers re-render │  │
│                                                   └──────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components to Update:
1. **`src/components/GoogleSheetSyncModal.tsx`**:
   - Add a prominent **"Upload CSV File"** tab / dropzone alongside "Download Template".
   - Support file dragging and clicking to browse `.csv` files from local device.
   - Show instant change summary (which questions were modified vs. original defaults).
2. **`src/utils/textSync.ts`**:
   - Add parser for the 10-column Question Table format (`Question_Number`, `Option_Letter`, `Question_Text`, `Option_Label`, etc.).
   - Automatically map parsed rows to survey state keys (`q0_question`, `q1_question`, `q1_option_a`, `q1_hint_a`, etc.).
3. **`src/App.tsx` Header**:
   - Ensure the header button clearly indicates CSV / Copy Editor access (`"Questions & CSV"`).

---

## 5. Next Steps

Upon your approval ("Proceed"), I will:
1. Implement the file upload dropzone and CSV parser.
2. Connect the uploaded text directly into `TextContentContext` to update Question 0 through Question 8 live.
3. Test end-to-end with a sample revised CSV file.

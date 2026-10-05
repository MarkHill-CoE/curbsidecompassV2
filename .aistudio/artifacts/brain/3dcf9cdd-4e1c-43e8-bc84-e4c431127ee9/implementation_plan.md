# Implementation Plan - Reversible AES-256-GCM Postal Code Encryption & Unlock Mechanism

Implement authenticated, reversible AES-256-GCM encryption for full residential postal codes using PBKDF2 key derivation. This protects respondent privacy in transit and at rest in the database while allowing authorized City staff to unlock the original full postal codes with a secret administrative key.

---

## User-Confirmed Requirements
1. **Reversible AES-256 Encryption**:
   - Encrypt full 6-character postal codes with military-grade AES-256-GCM (Galois/Counter Mode with 128-bit authentication tag).
   - Use PBKDF2 with SHA-256 and dynamic salt to securely derive encryption keys.
   - Include decryption utility (`decryptPostalCode`) so authorized staff can unlock full postal codes using the administrative secret key.
2. **Immediate Visibility for Planning & Analysis**:
   - Maintain visible, human-readable `neighbourhood` names (e.g., *Strathcona*, *Garneau*, *Oliver*).
   - Store 3-character `fsa` (e.g., *T5J*, *T6E*) in plaintext so standard spatial maps and aggregate charts work out of the box without needing decryption.
   - Anonymized `OPT_OUT` choice remains fully supported.

---

## Proposed Changes

### 1. Cryptographic AES-256-GCM Engine (`src/utils/postalEncryption.ts`)
- Implement `encryptPostalCode(postalCode: string, secretKey?: string): Promise<string>`:
  - Generates a random 16-byte salt and 12-byte initialization vector (IV).
  - Derives an AES-GCM 256-bit key via PBKDF2 (100,000 iterations, SHA-256).
  - Returns a self-contained authenticated encrypted string format (`aes_gcm:salt:iv:ciphertext:tag`).
- Implement `decryptPostalCode(encryptedBundle: string, secretKey: string): Promise<string>`:
  - Validates formatting, re-derives key from salt, and decrypts back to the exact original postal code (e.g., `T6E 2A1`).
  - Throws a descriptive error if an incorrect secret key is supplied.

### 2. Survey Submission Pipeline (`src/services/firebaseService.ts`)
- Integrate `encryptPostalCode` into `saveSurveyResponse()`.
- Store `encryptedPostalCode` in Firestore `survey_responses` document.
- Store `fsa` (first 3 alphanumeric chars) and `neighbourhood` for immediate planning visibility.

### 3. Firestore Schema & Security Rules (`firebase-blueprint.json`, `firestore.rules`)
- Update `firebase-blueprint.json` schema to include `encryptedPostalCode` (string, max 256 chars).
- Update `firestore.rules` validation helper to validate `encryptedPostalCode` format and string size limits.

### 4. Administrative Unlock / Decryption Tool
- Add an exportable helper function and optional developer/admin console modal to quickly test and verify unlocking encrypted postal codes with the secret key.

---

## Verification Plan
1. **Cryptographic Round-Trip Validation**:
   - Encrypt a sample Edmonton postal code (e.g., `T6G 2R3`).
   - Decrypt with the administrative secret key and assert exact match (`T6G 2R3`).
   - Test decryption with an invalid secret key and verify cryptographic rejection.
2. **Firestore & UI Integration**:
   - Complete survey submission and verify `encryptedPostalCode`, `fsa` (`T6G`), and `neighbourhood` (*Garneau*) in the payload.
3. **Compilation & Linting**:
   - Run `compile_applet` and `lint_applet` to confirm 0 build or TypeScript errors.

# Digital Signature Feature Design

This document outlines the design for the digital signature feature within the DarRent application.

## 1. Data Structure (Supabase)

The `contracts` table in Supabase will be updated to include fields for storing signature information for both renter and landlord.

**New fields in `contracts` table:**

*   **`renter_signature_data`**: `TEXT` - Stores the signature data. This could be:
    *   Base64 encoded image string (e.g., from `react-native-signature-capture`).
    *   SVG string data.
    *   A JSON string representing an array of points (if using a library like `react-native-sketch-canvas` and storing raw points).
    *   *Decision*: Prefer Base64 encoded image string for simplicity of display across platforms and in generated documents.
*   **`renter_signed_by_user_id`**: `UUID` (references `users.id`) - The ID of the user who provided the signature.
*   **`renter_signature_timestamp`**: `TIMESTAMPTZ` - The exact time the signature was captured.
*   **`renter_signature_ip_address`**: `TEXT` - The IP address of the device used for signing.
*   **`renter_signature_user_agent`**: `TEXT` - The user agent string of the device/browser used for signing.
*   **`landlord_signature_data`**: `TEXT` - (Same as `renter_signature_data` but for the landlord).
*   **`landlord_signed_by_user_id`**: `UUID` (references `users.id`) - (Same as `renter_signed_by_user_id` but for the landlord).
*   **`landlord_signature_timestamp`**: `TIMESTAMPTZ` - (Same as `renter_signature_timestamp` but for the landlord).
*   **`landlord_signature_ip_address`**: `TEXT` - (Same as `renter_signature_ip_address` but for the landlord).
*   **`landlord_signature_user_agent`**: `TEXT` - (Same as `renter_signature_user_agent` but for the landlord).

The `status` field in the `contracts` table will also be crucial, with states like `pending_renter_signature`, `pending_landlord_signature`, and `active`.

*(The [`database/schema.json`](database/schema.json:1) file has been updated accordingly).*

## 2. UI for Signature Capture (Mobile - React Native)

A dedicated modal or screen will be used for capturing the signature.

**Recommended Library:** [`react-native-signature-capture`](https://github.com/RepairShopr/react-native-signature-capture)
*   **Reasoning:** It's a mature library, provides events for saving (onSaveEvent), dragging (onDragEvent), and handles the canvas interactions well. It directly outputs a Base64 encoded image, which aligns with our data storage choice.

**Key UI Elements for Signature Capture Screen/Modal:**

*   **Signature Pad Area:** A clear, responsive area where the user can draw their signature using their finger or a stylus.
    *   Dimensions: Should occupy a significant portion of the screen for ease of use.
    *   Background: White or a very light color.
    *   Pen Color: Black or dark blue.
*   **"Sign Here" Placeholder:** A light text placeholder within the pad that disappears once the user starts drawing.
*   **Instructions:** Brief text like "Please sign in the box above."
*   **Clear Button:** Allows the user to erase their current signature and start over.
*   **Save/Confirm Signature Button:** Saves the captured signature. This button should be disabled until the user has drawn something.
*   **Cancel/Close Button:** Allows the user to close the signature capture UI without saving.
*   **Legal Disclaimer (Optional but Recommended):** A short text snippet below the signature area, e.g., "By signing, I agree to the terms of this contract."

**Example Layout:**

```
-----------------------------------------
| X (Close)        Sign Contract        |
-----------------------------------------
|                                       |
|  [ Brief instruction text ]           |
|                                       |
|  -----------------------------------  |
|  |                                 |  |
|  |      Signature Pad Area         |  |
|  |      (with "Sign Here"          |  |
|  |       placeholder)              |  |
|  |                                 |  |
|  -----------------------------------  |
|                                       |
|  [ Optional legal disclaimer ]        |
|                                       |
-----------------------------------------
| [ Clear ]          [ Save Signature ] |
-----------------------------------------
```

## 3. Signature Presentation in Contract Viewing Screen

Once a contract is signed, the signature(s) need to be displayed within the contract viewing screen (e.g., a screen similar to [`app/(renter-tabs)/ContractSignature.tsx`](app/(renter-tabs)/ContractSignature.tsx:1) or within the contract details page [`app/contracts/[id].tsx`](app/contracts/[id].tsx:1)).

**Display Method:**

*   The Base64 signature data (`renter_signature_data`, `landlord_signature_data`) will be rendered as an image.
*   Alongside the signature image, display:
    *   "Signed by: [User's Name]" (fetched based on `signed_by_user_id`)
    *   "Date: [signature_timestamp]" (formatted nicely)
    *   Optionally, for audit trail purposes (though perhaps not directly visible to the end-user unless they request details): IP address and User Agent.

**Layout within Contract View:**

*   **If contract is unsigned by the current user:**
    *   A prominent "Sign Contract" button.
    *   A placeholder area indicating where the signature will appear.
*   **If contract is signed by the current user (or both parties):**
    *   The signature image is displayed.
    *   Associated metadata (signer name, date) is shown below or next to the signature.
    *   If awaiting the other party's signature, a status message like "Awaiting Landlord's Signature" or "Awaiting Renter's Signature".

**Example Section in Contract View (for one signature):**

```
... (Contract Content) ...

-----------------------------------------
| Renter's Signature:                   |
|                                       |
|  +---------------------------------+  |
|  | [Rendered Signature Image Here] |  |
|  +---------------------------------+  |
|  Signed by: John Doe                  |
|  Date: May 26, 2025, 10:15 AM         |
-----------------------------------------

... (Potentially Landlord's Signature Section) ...

-----------------------------------------
| Landlord's Signature:                 |
|                                       |
|  [ Sign Contract Button OR           ]  |
|  [ Rendered Signature Image + Info ]  |
-----------------------------------------
```

## 4. Process Flow

1.  **User Views Contract:**
    *   The user (renter or landlord) navigates to the contract details screen (e.g., [`app/contracts/[id].tsx`](app/contracts/[id].tsx:1)).
    *   The system checks the contract status and whether the current user needs to sign.

2.  **User Taps "Sign Contract":**
    *   If the contract requires the current user's signature, a "Sign Contract" button is visible and enabled.
    *   Tapping this button opens the Signature Capture UI (modal or new screen).

3.  **Signature Capture UI Appears:**
    *   The user is presented with the signature pad as described in Section 2.

4.  **User Signs:**
    *   The user draws their signature on the pad.
    *   The user can "Clear" and re-draw if needed.
    *   Once satisfied, the user taps "Save Signature" (or "Confirm").

5.  **Signature is Saved and Associated:**
    *   **Client-side:**
        *   The `react-native-signature-capture` library returns the signature as a Base64 encoded string.
        *   The app also captures the current timestamp.
        *   The app *could* attempt to get IP and User Agent, but relying on server-side capture for these is more reliable for security/audit.
    *   **API Call to Supabase:**
        *   An API request is made to update the contract record.
        *   Payload includes:
            *   `contract_id`
            *   `signature_data` (Base64 string)
            *   `signed_by_user_id` (current user's ID)
            *   `signature_timestamp` (client or server generated)
            *   The backend function/trigger should capture `ip_address` and `user_agent` from the request headers.
        *   The contract status is updated (e.g., from `pending_renter_signature` to `pending_landlord_signature` or `active` if both signed).
    *   **Post-Save:**
        *   The Signature Capture UI is closed.
        *   The Contract Viewing screen refreshes to display the newly added signature and updated contract status.
        *   A confirmation message (e.g., "Contract signed successfully!") is shown.
        *   If the other party now needs to sign, notifications could be triggered.

## Future Considerations:

*   **Generating PDF with Signature:** For official records, a PDF version of the contract with the embedded signature image(s) will be needed. This would likely be a server-side process.
*   **Signature Verification (Advanced):** While visual, for higher security, biometric aspects or more advanced signature verification could be explored, but this is beyond the initial scope.
*   **Accessibility:** Ensure the signature capture and display are accessible.
*   **Offline Signing:** Potentially queueing signatures offline and syncing when back online (adds complexity).
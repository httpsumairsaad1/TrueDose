# Accessibility Compliance (WCAG 2.2 AA) — OmniCare Mesh

| Guideline | Target | Implementation in Simulation Stage | Status |
|---|---|---|---|
| **1.4.3 Contrast (Minimum)** | 4.5:1 text, 3:1 large text | Tested in both Light mode and Dark mode. Background: `#f3f5f7` / `#14181d`, Text: `#1c2128` / `#e9edf1`, Accents meet AA ratio. | **PASS** |
| **2.1.1 Keyboard Accessible** | Full operability via keyboard | All controls operable via Tab, Space, N, B, R, Y, Esc. Visible 3px green focus rings. | **PASS** |
| **2.1.4 Character Key Shortcuts** | Single-key shortcut governance | Single-key shortcuts do not fire while focus is inside any text field or input. Can be toggled. | **PASS** |
| **2.5.5 Target Size (Enhanced)** | Minimum 44px for primary controls | Consent buttons ("Yes, for 24 hours", "No, not now") strictly sized at $\ge 44\text{px}$ height. | **PASS** |
| **2.3.1 Three Flashes or Below** | Zero seizure triggers | All animations use smooth transitions ($\le 3\text{Hz}$). Respects `prefers-reduced-motion`. | **PASS** |
| **1.2.2 Captions (Prerecorded & Live)** | Synchronized captions for speech | Every voice message displays synchronized captions with speaker label. | **PASS** |
| **4.1.3 Status Messages** | ARIA live regions | Narrator bar uses `role="region" aria-live="polite"`. Consent prompt alerts screen readers. | **PASS** |
| **1.4.1 Use of Color** | Color is never the sole indicator | Every state (OK, Waiting, Denied, Revoked) combines an explicit icon, word, and color. | **PASS** |
| **1.4.10 Reflow** | 320px width without horizontal scroll | Stacks gracefully into single column on mobile screens without horizontal clipping. | **PASS** |

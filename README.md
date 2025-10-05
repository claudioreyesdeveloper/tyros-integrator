This document serves as the GitHub repository's README file, detailing the architecture, design, and technical requirements for the Tyros5 Advanced MIDI Controller and Librarian application.
🎹 Tyros5 Advanced MIDI Controller & Librarian
Project Overview
The Tyros5 Advanced MIDI Controller is a standalone application designed to unlock the full potential of the Yamaha Tyros5 Arranger Workstation by replacing the unit's native menu system with a highly graphical, intuitive interface.
The application merges the clean user experience (UX) of the Yamaha Smart Pianist app with the deep synthesis editing capabilities of professional editors (like the MOTIF Editor), allowing users to manage complex 32-channel mixing, DSP effects, and custom voice registrations remotely via USB-MIDI.
✨ Design Philosophy & Aesthetic
 * Design Aesthetic: Non-negotiable adherence to the Smart Pianist style (flat design, high-contrast panels, strong color segmentation, and professional typography).
 * Interaction Model: Optimized for desktop/laptop (non-touch) mouse and keyboard input.
 * Iconography (Critical): All voice categories and track headers must use visually distinct icons mapped directly to the Sub-Category (2nd column) of the provided Voice List CSV file.
🛠️ Core Functional Specification
The application’s functionality is built around controlling the Tyros5’s 32-part architecture and ensuring persistent state management.
1. Voice Management & Control
| Feature | Description | Technical Protocol |
|---|---|---|
| Voice Selection | Assigns any voice from the external voice list to any channel (R1, Left, Bass, Song 17, etc.). | PC + CC#0 (MSB) + CC#32 (LSB) chain. |
| Librarian Flow | Implements a 3-Tier Cascading List on the Voice Panel: Category → Sub-Category → Voice Name. | Directly maps the internal structure of the voice data CSV. |
| Layer & Split | Enables quick assignment of voices to multiple keyboard zones (Right 1, Right 2, Right 3, Left). | Controls MIDI Channels 1, 2, 3, and 4. |
2. Mixing and Channel Control
The mixer screen provides a full 32-channel view, navigated via tabs.
 * Global Controls: Features three horizontal sliders for global application of Volume, Global Reverb Send, and Global Chorus Send.
 * Track Header Naming: Uses the Tyros5’s official part names for clarity:
   * Keyboard & MultiPad (Port A 1-8): LEFT, RIGHT 1, RIGHT 2, RIGHT 3, MULTIPAD 1-4, etc.
   * Style Parts (Port A 9-16): RHYTHM 1, BASS, CHORD 1, etc.
   * Extra/Song Parts (Port B 17-32): Sequentially labeled SONG 17 through SONG 32.
 * Per-Track Controls (Horizontal Faders):
   * Volume: Horizontal slider (CC#7).
   * EQ: Three rotary knobs labeled BASS, MID, HIGH (visual interface for NRPN parameters).
3. DSP Effect Management (SysEx/NRPN)
| Feature | Description | Technical Protocol |
|---|---|---|
| DSP Assignment | A dedicated button navigates to a selection screen to assign a specific Effect Type (e.g., Rotary Speaker) to a track. | Requires a Two-Step SysEx Chain for assignment and type selection. |
| Internal Parameter Editing | The application must be ready to implement a subsequent parameter editing screen using graphical knobs. | Relies on NRPN (CC#99/98/6/38) for fine-tuning parameters within the selected DSP effect. |
4. Persistence & Registration (MIDI Snapshot)
| Feature | Description | Rationale |
|---|---|---|
| Registration Slots (x8) | A dedicated screen manages 8 named slots for saving the complete performance setup. | User must be able to name and save custom performance environments. |
| MIDI Snapshot (Persistence) | The SAVE function must capture the entire MIDI state of the 32 channels (including all PC, CC, and SysEx strings) and store them in a persistent local file. | Guarantees instant, accurate restoration of the user's setup upon application restart, compensating for the Tyros5's volatile memory. |
| Master Utilities | Includes controls for Master Transpose and displays MIDI Port Status (Port A/B activity). | Essential global controls for live performance. |
⚙️ Technical Specification Summary
| Protocol | Purpose | Messages Used |
|---|---|---|
| Voice Selection | Program Change | \text{CC\#0 (MSB)}, \text{CC\#32 (LSB)}, \text{PC} |
| Mixing/System FX | Control Change | \text{CC\#7 (Volume)}, \text{CC\#10 (Pan)}, \text{CC\#91/93 (Reverb/Chorus)} |
| DSP Configuration | System Exclusive | \text{F0 43 10 4C...} (for assignment and type select) |
| Fine Tuning | Non-Registered Parameter Number | \text{CC\#99/98} (Parameter Select) and \text{CC\#6/38} (Value) |
The complete functionality requires interpreting and generating these MIDI messages based on the structured data provided.

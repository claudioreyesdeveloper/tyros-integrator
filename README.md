# 🎹 Tyros5 Advanced MIDI Controller & Librarian

## Overview

The **Tyros5 Advanced MIDI Controller** is a standalone application designed to unlock the full potential of the **Yamaha Tyros5 Arranger Workstation** by replacing its native menu system with a highly graphical and intuitive interface.

The application merges the clean user experience (UX) of the *Yamaha Smart Pianist* app with the deep synthesis editing capabilities of professional editors such as *MOTIF Editor*, allowing users to manage complex **32-channel mixing**, **DSP effects**, and **custom voice registrations** remotely via USB-MIDI.

---

## ✨ Design Philosophy & Aesthetic

- **Design Aesthetic:** Non-negotiable adherence to the *Smart Pianist* visual style — flat design, high-contrast panels, strong color segmentation, and professional typography.  
- **Interaction Model:** Optimized for desktop/laptop use (mouse and keyboard input; not touch-based).  
- **Iconography (Critical):** All voice categories and track headers must use visually distinct icons mapped directly to the **Sub-Category (2nd column)** of the provided **Voice List CSV file**.

---

## 🛠️ Core Functional Specification

The application’s functionality is centered on controlling the Tyros5’s 32-part architecture and ensuring robust **state persistence**.

### 1. Voice Management & Control

| Feature | Description | Technical Protocol |
|----------|--------------|--------------------|
| **Voice Selection** | Assign any voice from the external voice list to any channel (e.g., R1, Left, Bass, Song 17). | PC + CC#0 (MSB) + CC#32 (LSB) chain |
| **Librarian Flow** | Implements a 3-tier cascading list: Category → Sub-Category → Voice Name. | Maps directly to the internal structure of the voice data CSV |
| **Layer & Split** | Enables quick assignment of voices to multiple keyboard zones (Right 1, Right 2, Right 3, Left). | Controls MIDI Channels 1–4 |

---

### 2. Mixing & Channel Control

The **Mixer Screen** provides a full 32-channel view navigated via tabs.

- **Global Controls:** Three horizontal sliders apply global **Volume**, **Reverb Send**, and **Chorus Send**.  
- **Track Header Naming:** Uses Tyros5’s official part names for consistency:
  - **Keyboard & MultiPad (Port A 1–8):** LEFT, RIGHT 1–3, MULTIPAD 1–4  
  - **Style Parts (Port A 9–16):** RHYTHM 1, BASS, CHORD 1, etc.  
  - **Song Parts (Port B 17–32):** Sequentially labeled SONG 17–SONG 32  
- **Per-Track Controls (Horizontal Faders):**
  - *Volume:* Horizontal slider (CC#7)  
  - *EQ:* Three rotary knobs labeled **BASS**, **MID**, **HIGH** (visual interface for NRPN parameters)

---

### 3. DSP Effect Management (SysEx/NRPN)

| Feature | Description | Technical Protocol |
|----------|--------------|--------------------|
| **DSP Assignment** | Dedicated selection screen to assign specific Effect Types (e.g., Rotary Speaker) to a track. | Two-step SysEx chain for assignment and type selection |
| **Internal Parameter Editing** | Implements parameter editing via graphical knobs. | NRPN (CC#99/98/6/38) for fine parameter control |

---

### 4. Persistence & Registration (MIDI Snapshot)

| Feature | Description | Rationale |
|----------|--------------|-----------|
| **Registration Slots (x8)** | Manages eight named slots for saving complete performance setups. | Allows naming and recalling of custom performance environments |
| **MIDI Snapshot (Persistence)** | The SAVE function captures the complete MIDI state (PC, CC, SysEx) of all 32 channels and stores locally. | Ensures instant restoration on restart, compensating for Tyros5’s volatile memory |
| **Master Utilities** | Controls for **Master Transpose** and **MIDI Port Status** display (Port A/B activity). | Essential for live performance management |

---

## ⚙️ Technical Specification Summary

| Protocol | Purpose | Messages Used |
|-----------|----------|----------------|
| **Voice Selection** | Program Change | `CC#0 (MSB)`, `CC#32 (LSB)`, `PC` |
| **Mixing/System FX** | Control Change | `CC#7 (Volume)`, `CC#10 (Pan)`, `CC#91/93 (Reverb/Chorus)` |
| **DSP Configuration** | System Exclusive | `F0 43 10 4C ...` (assignment and type select) |
| **Fine Tuning** | Non-Registered Parameter Number | `CC#99/98` (Parameter Select), `CC#6/38` (Value) |

The complete functionality depends on accurate interpretation and generation of these **MIDI messages** based on structured data provided in the **Voice List CSV** and internal configuration files.

---

## 📁 Repository Contents (Recommended)

# Market Sessions

<p align="center">
  <strong>A clean, minimal, and highly functional web application that tracks global market trading sessions.</strong>
  <br />
  Designed with a philosophy of clarity, intuition, and respect for the user's focus.
</p>

---

> ### Design Philosophy
> This application is built on the principle of the "quiet assistant." Every interaction and animation is designed to be smooth, intuitive, and non-intrusive, allowing the interface to recede into the background so the user can focus on the data.
> - **Clarity over Clutter:** We don't add new elements; we change the properties of existing ones to convey information.
> - **Intentional Interaction:** The interface reacts to deliberate user actions (a click) rather than accidental ones (a hover), creating a stable and predictable experience.
> - **Progressive Disclosure:** Complexity is only revealed when it becomes contextually relevant. The app starts simple and introduces powerful tools (like timezone selection) at the precise moment they are needed.

## Features & How to Use Them

This application provides a powerful suite of tools designed to organize your trading day.

### The Main View

Your dashboard gives you all the essential information at a glance.

- **Real-time Clock:** Intelligently defaults to your system's local time. This ensures immediate familiarity.
- **Interactive Timeline:** A bird's-eye view of all sessions across the 24 hours of the day, showing overlaps and activity.
- **Session Cards:** Each card represents a trading session, displaying its name, market, local open/close times, and current status.

---

### The Live Status System

Session cards aren't just static information; they are alive with the rhythm of the market.

- **Color-Coded Borders:** The border of a card instantly communicates its status:
  - **Green:** The session is currently **Active**.
  - **Yellow:** The session is **Upcoming** (within 60 minutes).
  - **Orange:** The session is **Closing Soon** (less than 30 minutes to close).
- **Animated Pulse:** The cards gently pulse to draw your attention at critical moments:
  - **Upcoming Soon (15 mins):** A soft amber glow and pulse signal you to get ready for the market open.
  - **Closing Soon (30 mins):** An alert orange pulse notifies you that the trading window is ending, giving you time to review positions.

---

### Focus Mode

Cut through the clutter when you need to concentrate on a single session.

- **How to Activate:** **Click** on any session card or its corresponding bar on the timeline.
- **What Happens:** The session you clicked is highlighted, rising slightly. Everything else—all other cards and timeline bars—gracefully fades into the background.
- **How to Exit:** **Click** the focused element again, or click anywhere in the empty space of the interface. Everything smoothly returns to its normal state.

---

### The Control Deck (`...` Menu)

This is your command center. Click the **ellipsis (...)** in the top right to fine-tune your experience.

- **☀️/🌙 Light & Dark Mode:** Switch between themes for your viewing comfort.
- **Compact View:** Switches the UI to a denser, single-line layout, perfect for smaller screens.
- **Display Options:**
  - **Show Overlaps:** Highlights periods on the timeline where multiple major sessions are active (often indicating higher volatility).
  - **Market Pulse:** Enables a subtle animation on the timeline bar for the currently active session.
- **Trading Schedule:** Choose when sessions are visible:
  - **Weekdays Only:** Hides all sessions during the weekend (Saturday, Sunday).
  - **24/7:** Shows all sessions, including on weekends, ideal for tracking cryptocurrencies or 24-hour markets.
- **Reset Sessions:** Resets all sessions back to the application's default set.

---

### The Session Workshop (Add/Edit)

Clicking `[ + ] Add Session` opens the Session Workshop, a meticulously designed modal for creating and customizing your sessions.

- **Hybrid Time Input:** Use precise number fields for start/end times and get instant visual feedback on a mini-timeline.
- **Live Time Conversion:** Automatically see the equivalent local time for the UTC hours you set.
- **Smart Validation:** The interface provides gentle warnings if your new session overlaps with an existing one.
- **Custom Colors:** Choose from a beautiful color palette to organize your sessions.

## License

This project is licensed under the MIT License.

# Market Sessions

A clean, minimalist, and highly functional web application for tracking global market trading sessions. Designed with a philosophy of clarity, intuition, and respect for the user's focus.

**Live version: [sessions.app.mantus.ru](https://sessions.app.mantus.ru)**

---

## Design Philosophy

This application is built on the principle of the "quiet assistant." Every interaction and animation is designed to be seamless, intuitive, and unobtrusive, allowing the interface to recede into the background so the user can focus on the data.

-   **Clarity over Clutter:** We don't add new elements; we change the properties of existing ones to convey information.
-   **Intentional Interaction:** The interface responds to deliberate user actions (a click) rather than accidental ones (a hover), creating a stable and predictable experience.
-   **Progressive Disclosure:** Complexity is revealed only when it becomes contextually relevant. The app starts simple and introduces powerful tools (like timezone selection) precisely when they are needed.

## Core Features

-   **Real-time Clock:** Displays the current time, intelligently defaulting to the user's local system time for an intuitive first run.
-   **Progressive Timezone Selector:** A beautiful, searchable modal for effortless timezone selection. The control only appears once the user engages with global sessions, keeping the initial view clean.
-   **Interactive Timeline with Focus Mode:** A visual representation of all sessions. Clicking a session on the timeline (or its card) activates **Focus Mode**, elegantly highlighting the selection while gracefully dimming all other elements.
-   **The "Session Workshop" Modal:** A complete re-imagining of the session editor. It combines the precision of digital input with the instant clarity of a visual mini-timeline, all while adhering to the app's strict, minimalist design system.
-   **Live Status Indicators:** Session cards are "alive," using subtle animations and color shifts to communicate their status. Cards gently pulse when a session is about to open or close, providing intuitive, at-a-glance information.
-   **Light & Dark Modes:** Switch between themes for optimal viewing comfort.
-   **Compact View:** A space-saving mode for a more condensed interface.
-   **Persistent Settings:** All customizations (sessions, theme, timezone, compact mode) are saved locally in your browser.

## Tech Stack

-   **Framework:** React
-   **Styling:** Tailwind CSS for a utility-first workflow.
-   **State Management:** React Hooks (`useState`, `useEffect`, custom hooks).
-   **Deployment:** Vercel

## Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aleksandrmantus/trading-sessions-app.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd trading-sessions-app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
The application will now be running on `http://localhost:5173`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

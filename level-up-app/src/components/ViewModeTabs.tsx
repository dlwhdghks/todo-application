import type { ViewMode } from "../types";
import "./ViewModeTabs.css";

interface Props {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const TABS: { mode: ViewMode; label: string }[] = [
  { mode: "today", label: "Today" },
  { mode: "7days", label: "7 Days" },
  { mode: "14days", label: "14 Days" },
];

export function ViewModeTabs({ viewMode, onChange }: Props) {
  return (
    <div className="view-mode-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          className={`view-tab ${viewMode === tab.mode ? "active" : ""}`}
          onClick={() => onChange(tab.mode)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

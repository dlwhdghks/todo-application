import { useEffect, useState } from "react";
import "./ExpPopup.css";

interface Props {
  amount: number; // +10 or -10
  trigger: number; // 바뀔 때마다 표시
}

export function ExpPopup({ amount, trigger }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible) return null;

  const isPositive = amount > 0;

  return (
    <div className={`exp-popup ${isPositive ? "positive" : "negative"}`}>
      <span className="exp-popup-text pixel-font">
        {isPositive ? "+" : ""}{amount} EXP
      </span>
    </div>
  );
}

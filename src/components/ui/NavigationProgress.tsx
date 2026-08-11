"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const previousPath = useRef(pathname);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];

    setProgress(10);
    setVisible(true);

    const at = (delay: number, value: number) => {
      timers.current.push(setTimeout(() => setProgress(value), delay));
    };
    at(60, 30);
    at(200, 55);
    at(380, 80);
    at(650, 95);
    at(950, 100);
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 1250),
    );

    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current = [];
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] h-1"
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

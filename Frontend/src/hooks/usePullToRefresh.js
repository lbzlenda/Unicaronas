import { useEffect, useRef, useState } from "react";

export function usePullToRefresh(onRefresh, threshold = 72) {
  const [state, setState] = useState({ pulling: false, progress: 0 });
  const startY = useRef(0);
  const active = useRef(false);
  const progressRef = useRef(0);
  const callbackRef = useRef(onRefresh);

  useEffect(() => { callbackRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    function onTouchStart(e) {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    }

    function onTouchMove(e) {
      if (!active.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY === 0) {
        const pct = Math.min(delta / threshold, 1);
        progressRef.current = pct;
        setState({ pulling: pct > 0.08, progress: pct });
        if (delta > 8) e.preventDefault();
      }
    }

    function onTouchEnd() {
      if (!active.current) return;
      active.current = false;
      if (progressRef.current >= 1) callbackRef.current?.();
      progressRef.current = 0;
      setState({ pulling: false, progress: 0 });
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [threshold]);

  return state;
}

import { useEffect, useState } from "react";

export type Breakpont = "2xl" | "xl" | "lg" | "md" | "sm" | "default";
export const useBreakpoint = () => {
  const detectBreakpoint = () => {
    let breakpoint: Breakpont;
    if (matchMedia("(min-width: 1536px)").matches) {
      breakpoint = "2xl";
    } else if (matchMedia("(min-width: 1280px)").matches) {
      breakpoint = "xl";
    } else if (matchMedia("(min-width: 1024px)").matches) {
      breakpoint = "lg";
    } else if (matchMedia("(min-width: 768px)").matches) {
      breakpoint = "md";
    } else if (matchMedia("(min-width: 640px)").matches) {
      breakpoint = "sm";
    } else {
      breakpoint = "default";
    }

    return breakpoint;
  };

  const [breakpoint, setBreakpoint] = useState<Breakpont>(detectBreakpoint());

  useEffect(() => {
    detectBreakpoint();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    const bp = detectBreakpoint();
    setBreakpoint(bp);
  };

  return { breakpoint };
};

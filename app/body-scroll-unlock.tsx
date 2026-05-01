"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Clears overflow locks on body/html after route changes (modal / overlay / SPA navigation). */
export default function BodyScrollUnlock() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, [pathname]);

  return null;
}

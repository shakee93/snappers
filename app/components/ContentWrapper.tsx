"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();
  const isCheckout = pathname?.startsWith("/checkout");

  return (
    <div className={isCheckout ? "" : "pb-8 md:pb-24"}>
      {children}
    </div>
  );
}




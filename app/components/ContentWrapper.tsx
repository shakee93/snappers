"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === "/checkout-2";

  return (
    <div className={isCheckoutPage ? "" : "pb-8 md:pb-24"}>
      {children}
    </div>
  );
}




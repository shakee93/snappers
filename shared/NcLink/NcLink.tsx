import React, { FC, ReactNode } from "react";
import Link from "next/link";
import LinkProps from "next/link";

export interface NcLinkProps {
  className?: string;
  colorClass?: string;
  children: ReactNode; 
}

const NcLink: FC<NcLinkProps> = ({
  className = "font-medium",
  colorClass = "text-primary-6000 hover:text-primary-800 dark:text-primary-500 dark:hover:text-primary-6000",
  children,
  ...args
}) => {
  return (
    <div
      className={`nc-NcLink ${colorClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default NcLink;

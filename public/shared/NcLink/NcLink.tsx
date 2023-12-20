import React, { FC, ReactNode  } from "react";
import { LinkProps } from "next/link";
import Link from "next/link";

export interface NcLinkProps extends LinkProps {
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
    <Link
      className={`nc-NcLink ${colorClass} ${className}`}
      data-nc-id="NcLink"
      {...args}
    >
      {children}
    </Link>
  );
};

export default NcLink;

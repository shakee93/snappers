"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import ArchiveLoading from "@/components/global/primitives/archive/ArchiveLoading";
import ProductPageSkeleton from "@/components/product/ProductPageSkeleton";
import {
  getArchiveSlugSnapshot,
  isRegisteredArchiveSlug,
  subscribeArchiveSlugs,
} from "@/lib/archiveSlugRegistry";

function slugFromPathname(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "";
}

const SlugRouteSkeleton = () => {
  useSyncExternalStore(
    subscribeArchiveSlugs,
    getArchiveSlugSnapshot,
    getArchiveSlugSnapshot,
  );

  const pathname = usePathname();
  const slug = slugFromPathname(pathname);

  if (slug && isRegisteredArchiveSlug(slug)) {
    return <ArchiveLoading />;
  }

  return <ProductPageSkeleton />;
};

export default SlugRouteSkeleton;

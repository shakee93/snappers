"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { getProductPath } from "@/lib/productUrl";
import { siteConfig } from "@/site.config";
import copyIcon from "@/public/product/copy.png";
import facebookIcon from "@/public/product/logos_facebook.png";

type ProductShareControlsProps = {
  product: SimpleProduct & VariableProduct;
  className?: string;
};

const shareIconClass = "h-6 w-6 object-contain";

const ProductShareControls = ({ product, className = "" }: ProductShareControlsProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const productUrl = useMemo(
    () => `${siteConfig.url.base}${getProductPath(product)}`,
    [product],
  );

  const facebookShareUrl = useMemo(
    () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    [productUrl],
  );

  const shareText = useMemo(
    () =>
      `Check out ${product.name ?? "this product"} at ${siteConfig.brand.name}: ${productUrl}`,
    [product.name, productUrl],
  );

  const whatsappShareUrl = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    [shareText],
  );

  const writeToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);
        return copied;
      } catch {
        return false;
      }
    }
  }, []);

  const copyProductLink = useCallback(async () => {
    const copied = await writeToClipboard(productUrl);

    if (!copied) {
      toast.error(`Unable to copy link. Copy manually: ${productUrl}`);
      return;
    }

    setLinkCopied(true);
    toast.success("Link copied!");

    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setLinkCopied(false);
      copyResetTimeoutRef.current = null;
    }, 2000);
  }, [productUrl, writeToClipboard]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={twMerge(
        "flex h-11 w-full shrink-0 items-stretch overflow-hidden rounded-lg border border-[#E8E8E8] bg-white p-1",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-evenly rounded-md bg-[#F3F4F6] px-2">
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp className="h-5 w-5 text-[#25D366]" />
        </a>
        <a
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
          aria-label="Share on Facebook"
        >
          <Image
            src={facebookIcon}
            alt=""
            width={24}
            height={24}
            className={shareIconClass}
            aria-hidden
          />
        </a>
      </div>
      <button
        type="button"
        onClick={copyProductLink}
        className="flex w-10 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
        aria-label={linkCopied ? "Link copied!" : "Copy link"}
      >
        {linkCopied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Image
            src={copyIcon}
            alt=""
            width={24}
            height={24}
            className={shareIconClass}
            aria-hidden
          />
        )}
      </button>
    </div>
  );
};

export default ProductShareControls;

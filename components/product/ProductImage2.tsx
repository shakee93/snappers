/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useImage } from "@/context/ImageChangeGrabber";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { getPreferredVariation } from "@/lib/getPreferredVariation";
import { type ProductVideoSource } from "@/lib/productVideo";
import {
  Thumb,
} from "@/components/product/SingleProductBlock/ProductCarouselThumb";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, ImageIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { pdpRadius } from "@/components/product/pdpStyles";

const ProductLightbox = dynamic(() => import("./ProductLightbox"), {
  ssr: false,
});
// import "styles/embla.css";
import "styles/product_embla.scss";

type PropType = {
  options?: EmblaOptionsType;
  product: SimpleProduct & VariableProduct & ProductVideoSource;
};
type selectedVariationType = {
  sourceUrl: string;
  databaseId: any;
};

type GalleryImage = {
  sourceUrl?: string | null;
  databaseId?: number | null;
};

const hasRenderableGalleryImages = (images: unknown): boolean => {
  if (!Array.isArray(images)) return false;

  return images.some((image) => {
    if (!image || typeof image !== "object") return false;
    return Boolean((image as GalleryImage).sourceUrl);
  });
};

/** Strip WP resized suffixes (`-300x300`) so full + thumb URLs of the same file match. */
const normalizeImageUrl = (sourceUrl: string): string => {
  try {
    const url = new URL(sourceUrl);
    url.pathname = url.pathname.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, "");
    url.search = "";
    url.hash = "";
    return `${url.origin}${url.pathname}`;
  } catch {
    return sourceUrl.replace(/-\d+x\d+(?=\.[a-zA-Z]+)(?:\?.*)?$/, (match) =>
      match.replace(/-\d+x\d+/, ""),
    );
  }
};

/** Woo featured image + product gallery are separate fields — merge both, dedupe. */
const buildProductGalleryImages = (
  featured: GalleryImage | null | undefined,
  galleryNodes: Array<GalleryImage | null | undefined> | null | undefined,
  leadImage?: GalleryImage | null,
): GalleryImage[] => {
  const images: GalleryImage[] = [];
  const seenIds = new Set<number>();
  const seenUrls = new Set<string>();

  const push = (image: GalleryImage | null | undefined) => {
    if (!image?.sourceUrl) return;

    const normalizedUrl = normalizeImageUrl(image.sourceUrl);
    const hasId = image.databaseId != null;

    if (hasId && seenIds.has(image.databaseId as number)) return;
    if (seenUrls.has(normalizedUrl)) return;

    if (hasId) seenIds.add(image.databaseId as number);
    seenUrls.add(normalizedUrl);
    images.push(image);
  };

  push(leadImage);
  push(featured);
  for (const node of galleryNodes ?? []) {
    push(node);
  }

  return images;
};

const EmblaCarousel: React.FC<PropType> = ({ product }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "trimSnaps",
    align: "start",
  });
  const { variationId } = useImage();
  const [variationImageEnabled, setVariationImageEnabled] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const galleryNodes = product?.galleryImages?.nodes;
  const featuredImage = product?.image;

  const preferredVariation = getPreferredVariation(product?.variations?.nodes);
  const preferredImage = preferredVariation?.image;

  // Featured + gallery are separate in Woo; lead with preferred variation when present.
  const initialGalleryImages = buildProductGalleryImages(
    featuredImage,
    galleryNodes,
    preferredImage,
  );

  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);


  const variationImages = product.variations?.nodes?.map(
    (variation: any) => variation.image
  ) ?? [product.image];

  const combinedImages = [...variationImages, ...(galleryImages || [])];
  const [selectedVariation, setSelectedVariation] =
    useState<selectedVariationType | null>(preferredImage || combinedImages[0]);


  // combinedImages.forEach((image) => {
  //   if (image?.sourceUrl?.includes("300x300")) {
  //     image.sourceUrl = image?.sourceUrl?.replace("-300x300", "");
  //   }
  // });

  combinedImages.forEach((image) => {
    if (image?.sourceUrl && image.sourceUrl.includes("300x300")) {
      image.sourceUrl = image.sourceUrl.replace("-300x300", "");
    }
  });

  useEffect(() => {
    if (variationId === null || variationId === undefined) return;

    const activeVariationImage = variationImages.find(
      (i) => i?.databaseId === variationId,
    );

    if (!activeVariationImage?.sourceUrl) return;

    const newImages = buildProductGalleryImages(
      featuredImage,
      galleryNodes,
      activeVariationImage,
    );

    setGalleryImages(newImages);
    emblaThumbsApi?.scrollTo(0);
    setSelectedIndex(0);
    emblaMainApi?.scrollTo(0);
  }, [variationId]);

  const onThumbVariationClick = (variationId: string | null = null) => {
    if (!emblaMainApi || !emblaThumbsApi) return;

    setVariationImageEnabled(false);
    if (variationId) {
      const variationIndex = combinedImages.findIndex(
        (image: any) => image.databaseId === parseInt(variationId)
      );
      combinedImages[variationIndex] &&
        setSelectedVariation(combinedImages[variationIndex]);

      if (variationIndex !== -1) {
        emblaMainApi.scrollTo(variationIndex);
      } else {
      }
      return;
    }
    return;
  };

  const onThumbClickCalculated = useCallback(
    (thumbIndex: number | null) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      setVariationImageEnabled(true);
      setSelectedIndex(thumbIndex as number)
      emblaThumbsApi.scrollTo(thumbIndex as number)
      emblaMainApi.scrollTo(thumbIndex as number);

      return;
    },
    [emblaMainApi, emblaThumbsApi, product]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const newIndex = emblaMainApi.selectedScrollSnap();
    setCanScrollPrev(emblaMainApi.canScrollPrev());
    setCanScrollNext(emblaMainApi.canScrollNext());
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  }, [emblaMainApi, emblaThumbsApi, selectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);

    const rootNode = emblaMainApi.rootNode();
    const onPointerDown = () => rootNode.classList.add("is-dragging");
    const onPointerUp = () => rootNode.classList.remove("is-dragging");
    emblaMainApi.on("pointerDown", onPointerDown);
    emblaMainApi.on("pointerUp", onPointerUp);

    return () => {
      emblaMainApi.off("select", onSelect);
      emblaMainApi.off("reInit", onSelect);
      emblaMainApi.off("pointerDown", onPointerDown);
      emblaMainApi.off("pointerUp", onPointerUp);
    };
  }, [emblaMainApi, onSelect]);

  const showGallery = hasRenderableGalleryImages(galleryImages);
  const renderableGalleryCount = Array.isArray(galleryImages)
    ? galleryImages.filter((image) =>
        Boolean((image as GalleryImage | null)?.sourceUrl),
      ).length
    : 0;
  // Single-image products: show only the main viewer (no redundant thumb strip).
  const showThumbs = showGallery && renderableGalleryCount > 1;

  return (
    <div className="embla w-full" id="product-image">
      <div className="relative">
        <div
          className={`embla__viewport border border-neutral-200 bg-white ${pdpRadius}`}
          ref={showGallery ? emblaMainRef : undefined}
        >
          <div className="embla__container">
            {showGallery ? (
              galleryImages?.map((variation, index: number) => {
                const sourceUrl = (variation as GalleryImage | null)?.sourceUrl;
                if (!sourceUrl) return null;

                return (
                  <div
                    className="embla__slide"
                    key={index}
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        fetchPriority={index === 0 ? "high" : undefined}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="image h-full w-full object-cover transition-transform duration-300"
                        alt={product.name ?? "Product"}
                        width={1000}
                        height={1000}
                        src={sourceUrl}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="embla__slide"
                aria-label={
                  product.name
                    ? `${product.name} — no image available`
                    : "No product image available"
                }
              >
                <div className="relative w-full pt-[100%]">
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <ImageIcon
                      className="h-20 w-20 text-neutral-400 sm:h-24 sm:w-24"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {showGallery && (
          <button
            onClick={() => {
              setLightboxIndex(selectedIndex);
              setLightboxOpen(true);
            }}
            className={`absolute top-3 left-3 z-10 bg-white/80 hover:bg-white p-2 shadow-md transition-colors ${pdpRadius}`}
            aria-label="View fullscreen"
          >
            <Expand className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {showGallery && canScrollPrev && (
          <button
            onClick={() => emblaMainApi?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {showGallery && canScrollNext && (
          <button
            onClick={() => emblaMainApi?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {showThumbs && (
        <div className="embla-thumbs">
          <div className="embla-thumbs__viewport " ref={emblaThumbsRef}>
            <div className="embla-thumbs__container" >
              {galleryImages?.map((variation, index: number) => {
                const sourceUrl = (variation as GalleryImage | null)?.sourceUrl;
                if (!sourceUrl) return null;

                return (
                  <Thumb
                    onClick={() => onThumbClickCalculated(index)}
                    selected={index === selectedIndex}
                    index={index}
                    imgSrc={sourceUrl}
                    key={index}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showGallery && lightboxOpen && galleryImages && (
        <ProductLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default EmblaCarousel;

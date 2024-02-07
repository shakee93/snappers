/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useImage } from "@/context/ImageChangeGrabber";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import {
  CoreVariationThumb,
  Thumb,
} from "app/components/SingleProductBlock/ProductCarouselThumb";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import "styles/product_embla.css";

type PropType = {
  options?: EmblaOptionsType;
  product: SimpleProduct & VariableProduct;
};
type selectedVariationType = {
  sourceUrl: string;
};

const EmblaCarousel: React.FC<PropType> = ({ product }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const { variationId } = useImage();
  const [selectedVariation, setSelectedVariation] =
    useState<selectedVariationType | null>(null);
  const [variationImageEnabled, setVariationImageEnabled] = useState(false);

  const galleryImages =
    product.galleryImages?.nodes.length !== 0
      ? product.galleryImages?.nodes
      : [];

  const variationImages = product.variations?.nodes?.map(
    (variation: any) => variation.image
  ) ?? [product.image];
  const combinedImages = [...variationImages, ...galleryImages || []];

  // console.log("galleryImages", galleryImages);
  // console.log("combinedImages", combinedImages);
  // console.log("variationImages", variationImages);

  useEffect(() => {
    onThumbVariationClick( variationId);
  }, [variationId]);

  const onThumbVariationClick = (
    variationId: string | null = null,
  ) => {
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
        console.log("Image with Variation ID not found in gallery.");
      }
      return;
    }
    return;
  };

  const onThumbClickCalculated = useCallback(
    (thumbIndex: number | null) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      setVariationImageEnabled(true);

      if (thumbIndex !== -1 && thumbIndex !== null) {
        thumbIndex += variationImages.length;
        emblaMainApi.scrollTo(thumbIndex ?? 0);
        return;
      }
      return;
    },
    [emblaMainApi, emblaThumbsApi, product]
  );
  
  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);


  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaMainRef}>
        <div className="embla__container">
          {combinedImages?.map((variation: any, index: number) => (
            <div className="embla__slide" key={index}>
              <div className="embla__slide__number">
                <span>{index + 1}</span>
              </div>
              <Image
                width={1000}
                height={1000}
                className="max-h-[330px] object-contain md:max-h-[410px]"
                src={variation?.sourceUrl || ""}
                alt=""
              />
            </div>
          ))}
        </div>
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {/* Variation Thumb */}
            {product.type === "VARIABLE" && (
              <CoreVariationThumb
                onClick={() => {
                  // onThumbClickCalculated(null, null, null)
                  onThumbVariationClick(variationImages[0].databaseId);
                }}
                selected={variationImageEnabled == false}
                index={0}
                imgSrc={selectedVariation?.sourceUrl || ""}
                key={0}
              />
            )}

            {/* Gallery Image */}
            {galleryImages?.map((variation: any, index: number) => (
              <Thumb
                onClick={() => onThumbClickCalculated(index)}
                selected={
                  variationImageEnabled &&
                  index + variationImages.length === selectedIndex
                }
                index={index}
                imgSrc={variation?.sourceUrl || ""}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;

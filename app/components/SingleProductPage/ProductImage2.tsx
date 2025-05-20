/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ImageEffect from "@/components/ImageMagnifier";
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
// import "styles/embla.css";
import "styles/product_embla.scss";

type PropType = {
  options?: EmblaOptionsType;
  product: SimpleProduct & VariableProduct;
};
type selectedVariationType = {
  sourceUrl: string;
  databaseId: any;
};

const EmblaCarousel: React.FC<PropType> = ({ product }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    align: "center"
  });
  const { variationId, activeVariation } = useImage();
  const [variationImageEnabled, setVariationImageEnabled] = useState(false);

  // const [galleryImages, setGalleryImages]  = useState(product.galleryImages?.nodes.length !== 0
  //     ? product.galleryImages?.nodes
  //     : [] || [])

  const [galleryImages, setGalleryImages] = useState(
    product?.galleryImages?.nodes?.length ? product.galleryImages.nodes : []
  );


  const variationImages = product.variations?.nodes?.map(
    (variation: any) => variation.image
  ) ?? [product.image];

  const combinedImages = [...variationImages, ...(galleryImages || [])];
  const [selectedVariation, setSelectedVariation] =
    useState<selectedVariationType | null>(combinedImages[0]);


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

    const activeVariationImage = variationImages.find(i => i.databaseId === variationId);

    setGalleryImages(previousImages => {

      if (!previousImages) {
        return []
      }

      if (activeVariationImage) {
        if (previousImages.length > 0 && previousImages[0].databaseId === activeVariationImage.databaseId) {
          return previousImages;
        } else {

          emblaThumbsApi?.scrollTo(0);
          setSelectedIndex(0);
          emblaMainApi?.scrollTo(0);

          return [activeVariationImage, ...previousImages.slice(1)];
        }
      }
      return previousImages;
    });


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
        // console.log("Image with Variation ID not found in gallery.");
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
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="embla min-h-[272px] md:min-h-[576px]" id='product-image'>
      <div className="embla__viewport  rounded-2xl" ref={emblaMainRef}>
        <div className="embla__container ">
          {galleryImages?.map((variation: any, index: number) => (
            <div className="embla__slide" key={index}>
              <ImageEffect
                index={index}
                src={variation?.sourceUrl || ""}
                classNames="max-h-[330px] object-contain md:max-h-[410px] image transform transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport " ref={emblaThumbsRef}>
          <div className="embla-thumbs__container" >
            {/* Gallery Image */}
            {galleryImages?.map((variation: any, index: number) => (
              <Thumb
                onClick={() => onThumbClickCalculated(index)}
                selected={
                  index === selectedIndex
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

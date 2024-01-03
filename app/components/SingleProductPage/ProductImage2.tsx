"use client"
import React, { useState, useEffect, useCallback } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import { Thumb } from "app/components/HomePage/EmblaCarouselThumbsButton";
import "styles/product_embla.css";
import {
  MediaItem,
  ProductGalleryImagesArgs,
  ProductToMediaItemConnection,
  SimpleProduct,
  VariableProduct
} from "@/graphql/types/graphql";
import {GalleryImage} from "@/types";
import Image from "next/image";


type PropType = {
  options?: EmblaOptionsType;
  product: SimpleProduct & VariableProduct
};


const EmblaCarousel: React.FC<PropType> = ({product}) => {

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
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
          {[
            ...[product.image as MediaItem] || [],
              ...product.galleryImages?.nodes || [],
          ].map((image: MediaItem, index) => (
            <div className="embla__slide" key={index}>
              <div className="embla__slide__number">
                <span>{index + 1}</span>
              </div>
              {/*<InnerImageZoom*/}
              {/*      src={image.sourceUrl || ''}*/}
              {/*      zoomSrc={image.sourceUrl || ''}*/}
              {/*      zoomType="hover"*/}
              {/*      zoomPreload={false}*/}
              {/*      className="embla__slide__img"*/}
              {/*  />*/}

               <Image
                   width={1000}
                   height={1000}
                className="embla__slide__img"
                src={image?.sourceUrl || ''}
                alt="Your alt text"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {[
              ...[product.image as MediaItem] || [],
              ...product.galleryImages?.nodes || [],
            ].map((image: MediaItem, index) => (
              <Thumb
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                index={index}
                imgSrc={image?.sourceUrl || ''}
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

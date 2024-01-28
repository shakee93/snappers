"use client";
import React, {useCallback, useEffect, useState} from "react";
import useEmblaCarousel from "embla-carousel-react";
import {Thumb} from "app/components/SingleProductBlock/ProductCarouselThumb";
import "styles/product_embla.css";
import {SimpleProduct, VariableProduct,} from "@/graphql/types/graphql";
import Image from "next/image";
import {EmblaOptionsType} from "embla-carousel";
import {useImage} from "@/context/ImageChangeGrabber";

type PropType = {
    options?: EmblaOptionsType;
    product: SimpleProduct & VariableProduct;
};

const EmblaCarousel: React.FC<PropType> = ({product}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: "keepSnaps",
        dragFree: true,
    });
    const {variationId} = useImage();

    useEffect(() => {
        onThumbClickCalculated(null, variationId)
    }, [variationId])

    const onThumbClickCalculated = useCallback((data: any, variationId: string | null = null) => {
        if (!emblaMainApi || !emblaThumbsApi) return;

        const variations = product?.variations?.nodes;
        const galleryImagesIndex = variations?.findIndex((image: any) => image?.databaseId === data?.databaseId);

        if (variationId) {
            const variationIndex = variations?.findIndex((variation: any) => variation?.image?.databaseId === variationId);
            if (variationIndex !== -1 && variationIndex !== undefined) {
                emblaMainApi.scrollTo(variationIndex);
            } else {
                // console.log("Image with Variation ID not found in gallery.");
            }
            return;
        }

        if (galleryImagesIndex === 0 || galleryImagesIndex === undefined) {
            emblaMainApi.scrollTo(0);
        } else if (galleryImagesIndex !== -1) {
            emblaMainApi.scrollTo(galleryImagesIndex);
        }
    }, [emblaMainApi, emblaThumbsApi, product]);

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

    let productsArray = product.type == "SIMPLE" ? [product] :  product.variations?.nodes;
    
    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaMainRef}>
                <div className="embla__container">
                    {productsArray?.map((variation: any, index: number) => (
                        <div className="embla__slide" key={index}>
                            <div className="embla__slide__number">
                                <span>{index + 1}</span>
                            </div>
                            <Image
                                width={1000}
                                height={1000}
                                className="object-contain max-h-[330px] md:max-h-[410px]"
                                src={variation.image?.sourceUrl || ""}
                                alt=""
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="embla-thumbs">
                <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
                    <div className="embla-thumbs__container">
                        {productsArray?.map((variation: any, index: number) => (
                            <Thumb
                                onClick={() => onThumbClickCalculated(variation, null)}
                                selected={index === selectedIndex}
                                index={index}
                                imgSrc={variation?.image?.sourceUrl || ""}
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

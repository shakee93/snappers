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

    const [productImage, setproductImage] = useState(product.image);

    const {variationId} = useImage();

    useEffect(() => {
        onThumbClickCalculated(null, variationId)

    }, [variationId])

    // TODO : use this to change the variation image
    const onThumbClick = useCallback(
        (index: number) => {
            console.log("product inside onThumbClick: ", product)
            console.log("index: ", index);
            if (!emblaMainApi || !emblaThumbsApi) return;
            emblaMainApi.scrollTo(index);
        },
        [emblaMainApi, emblaThumbsApi]
    );

    const onThumbClickCalculated = useCallback((data: any, variationId: string | null = null) => {
        if (!emblaMainApi || !emblaThumbsApi) return;

        const variations = product?.variations?.nodes;
        const galleryImagesIndex = variations?.findIndex((image: any) => image?.databaseId === data?.databaseId);

        if (variationId) {
            const variationIndex = variations?.findIndex((variation: any) => variation?.image?.databaseId === variationId);
            if (variationIndex !== -1 && variationIndex !== undefined) {
                emblaMainApi.scrollTo(variationIndex);
            } else {
                console.log("Image with Variation ID not found in gallery.");
            }
            return;
        }

        if (galleryImagesIndex === 0 || galleryImagesIndex === undefined) {
            emblaMainApi.scrollTo(0);
        } else if (galleryImagesIndex !== -1) {
            emblaMainApi.scrollTo(galleryImagesIndex);
            console.log(`Scrolling to the image with index: ${galleryImagesIndex}`);
        }

        console.log({variations, galleryImagesIndex});

        if (!variationId) console.log("Variation ID is not provided.");
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


    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaMainRef}>
                {/*{JSON.stringify(productImage?.sourceUrl)}*/}
                {/* <code>
          <pre className="bg-gray-100 p-4 rounded">
            {product && <code>{JSON.stringify(product.image, null, 2)}</code>}
          </pre>
        </code> */}
                <div className="embla__container">
                    {/*{[*/}
                    {/*    ...([product.image as MediaItem] || []),*/}
                    {/*    ...(product.galleryImages?.nodes || []),*/}
                    {/*].map((image: MediaItem, index) => (*/}
                    {product.variations?.nodes.map((variation: any, index: number) => (
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
                        {/*Updated image Array with real Images*/}
                        {/*{product?.variations.nodes.map((variation: MediaItem, index: number) => (*/}
                        {/*    <Thumb*/}
                        {/*        onClick={() => onThumbClickCalculated(variation, variation?.databaseId || null)}*/}
                        {/*        selected={index === selectedIndex}*/}
                        {/*        index={index}*/}
                        {/*        imgSrc={variation?.sourceUrl || ""}*/}
                        {/*        key={index}*/}
                        {/*    />*/}
                        {/*))}*/}

                        {product.variations?.nodes.map((variation: any, index: number) => (
                            <Thumb
                                onClick={() => onThumbClickCalculated(variation, null)}
                                selected={index === selectedIndex}
                                index={index}
                                imgSrc={variation?.image?.sourceUrl || ""}
                                key={index}
                            />
                        ))}
                        {/*{[*/}
                        {/*    ...([product.image as MediaItem] || []),*/}
                        {/*    ...(product.galleryImages?.nodes || []),*/}
                        {/*].map((image: MediaItem, index) => (*/}
                        {/*    // <div key={index}>*/}
                        {/*    //   <div>*/}

                        {/*    //   {JSON.stringify(product.galleryImages?.nodes[0]?.sourceUrl)}*/}

                        {/*    //   </div>*/}
                        {/*    <Thumb*/}
                        {/*        onClick={() => onThumbClickCalculated(image)}*/}
                        {/*        selected={index === selectedIndex}*/}
                        {/*        index={index}*/}
                        {/*        imgSrc={image?.sourceUrl || ""}*/}
                        {/*        key={index}*/}
                        {/*    />*/}

                        {/*    // </div>*/}
                        {/*))}*/}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmblaCarousel;

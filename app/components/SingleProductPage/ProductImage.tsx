'use client'

import InnerImageZoom from "react-inner-image-zoom";
import ImageGallery from "@/app/[brand]/imageGallery";
import {useEffect, useState} from "react";
import {SimpleProduct, VariableProduct} from "@/graphql/types/graphql";

interface ProductImageProps {
    product: SimpleProduct | VariableProduct
}

const ProductImage = ({
    product,
}: ProductImageProps) => {

    const [selectedImage, setSelectedImage] = useState({
        original: product?.image?.sourceUrl || '',
        thumbnail: product?.image?.sourceUrl || ''
    })
    const [images, setImages] = useState([
        selectedImage,
        ...product.galleryImages?.nodes.map((image: any, index) => {

            return {
                original : image.sourceUrl,
                thumbnail: image.sourceUrl
            }

        }) || []
    ])

    const onThumbClick = (image: string) => {

        const _im = images.find(i => i.original === image)

        if (_im) {
            setSelectedImage(_im);
        }
    }

    return <div>

        <div className="w-full flex p-4 min-h-[400px]">
            {selectedImage && (
                <InnerImageZoom
                    src={selectedImage.thumbnail}
                    zoomSrc={selectedImage.original}
                    zoomType="hover"
                    zoomPreload={false}
                    className="object-cover w-full h-auto "
                />
            )}
        </div>

        <div className="flex w-full md:w-full p-2">
            <ImageGallery
                // style={{ objectFit: 'cover' }}
                images={images}
                onThumbnailClick={onThumbClick}
                selectedImage={{
                    original: '',
                    thumbnail: ''
                }}
            />
        </div>

    </div>

}


export default ProductImage
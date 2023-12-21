'use client'
import React, { useState } from 'react';
import Thumbnail from './thumbnail';

interface ImageGalleryProps {
    images?: GalleryImage[];
    onThumbnailClick: (newImageSrc: GalleryImage) => void;
    selectedImage: GalleryImage
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onThumbnailClick, selectedImage }) => {
    const [startIndex, setStartIndex] = useState(0);


    if (!images) {
        return <div></div>
    }

    const handleSlideLeft = () => {
        setStartIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const handleSlideRight = () => {
        setStartIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const visibleImages =
        images.length >= 3
            ? [images[(startIndex + images.length - 1) % images.length], images[startIndex], images[(startIndex + 1) % images.length]]
            : images;

    return (
        <div className="image-gallery flex max-w-full overflow-x-auto relative">
            <button className="absolute top-2 left-2 bg-gray-300 p-1" onClick={handleSlideLeft}>
                {/* SVG for Slide Left */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            {visibleImages.map((image, index) => (
                <Thumbnail key={index} image={image} onClick={onThumbnailClick} isSelected={selectedImage.original === image.original} />
            ))}
            <button className="absolute top-2 right-2 bg-gray-300 p-1" onClick={handleSlideRight}>
                {/* SVG for Slide Right */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>
        </div>
    );
};

export default ImageGallery;

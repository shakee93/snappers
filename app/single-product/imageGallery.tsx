import React, { useState } from 'react';
import Thumbnail from './thumbnail';

interface ImageGalleryProps {
    images: {
        original: string;
        thumbnail: string;
    }[];
    onThumbnailClick: (newImageSrc: string) => void;
    selectedImage: {
        original: string;
        thumbnail: string;
    };
}

const ImageGallery: React.FC<Image fill style={{ objectFit: 'cover' }}GalleryProps> = ({ images, onThumbnailClick, selectedImage }) => {
    const [startIndex, setStartIndex] = useState(0);

    const handleNextClick = () => {
        setStartIndex((prevIndex) => Math.min(prevIndex + 1, images.length - 3));
    };

    const handlePrevClick = () => {
        setStartIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const visibleImages = images.slice(startIndex, startIndex + 3);

    return (
        <div className="image-gallery flex flex-col max-h-300 overflow-y-auto relative">
            {startIndex > 0 && (
                <button className="absolute top-2 left-2 bg-gray-300 p-1" onClick={handlePrevClick}>
                    {/* SVG for Previous */}
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
                        <path d="M19 20L12 13L5 20" />
                    </svg>
                </button>
            )}
            {visibleImages.map((image, index) => (
                <Thumbnail key={index} image={image} onClick={onThumbnailClick} isSelected={selectedImage.original === image.original} />
            ))}
            {startIndex < images.length - 3 && (
                <button className="absolute bottom-2 right-2 bg-gray-300 p-1" onClick={handleNextClick}>
                    {/* SVG for Next */}
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
                        <path d="M5 4L12 11L19 4" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default ImageGallery;

import React from 'react';
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

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onThumbnailClick, selectedImage }) => {
    return (
        <div className="image-gallery flex flex-col max-h-300 overflow-y-auto">
        {images.map((image, index) => (
            <Thumbnail key={index} image={image} onClick={onThumbnailClick} isSelected={selectedImage.original === image.original} />
        ))}
    </div>
    );
};

export default ImageGallery;

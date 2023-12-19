import React from 'react';

interface ThumbnailProps {
    image: {
        original: string;
        thumbnail: string;
    };
    onClick: (newImageSrc: string) => void;
    isSelected: boolean;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ image, onClick, isSelected }) => {
    return (
        <div className={`thumbnail cursor-pointer mb-4 ${isSelected ? 'border-4 border-red-300' : 'hover:border-4'}`} onClick={() => onClick(image.original)}>
            <img src={image.thumbnail} alt="Thumbnail" />
        </div>
    );
};

export default Thumbnail;

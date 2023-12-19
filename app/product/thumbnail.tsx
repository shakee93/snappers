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
        <div className={`thumbnail cursor-pointer mb-4 ${isSelected ? 'border-2 border-slate-900' : 'hover:border-2'}`} onClick={() => onClick(image.original)}>
            <img src={image.thumbnail} alt="Thumbnail" />
        </div>
    );
};

export default Thumbnail;

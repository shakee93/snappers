import React from 'react';
import Image from 'next/image';

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
            <Image src={image.thumbnail} alt="Thumbnail" width={300} height={300} className='max-h-[120px]'/>
        </div>
    );
};

export default Thumbnail;

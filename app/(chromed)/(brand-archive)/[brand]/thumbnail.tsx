import Image from 'next/image';
import {GalleryImage} from '@/types';

interface ThumbnailProps {
    image: GalleryImage;
    onClick: (newImageSrc: GalleryImage) => void;
    isSelected: boolean;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ image, onClick, isSelected }) => {
    
    return (
        <div className={`thumbnail cursor-pointer mb-4 ${isSelected ? 'border-2 border-slate-900' : 'hover:border-2'}`} onClick={() => onClick(image)}>
            <Image src={image.thumbnail} alt="Thumbnail" width={300} height={300} className='max-h-[120px]'/>
        </div>
    );
};

export default Thumbnail;

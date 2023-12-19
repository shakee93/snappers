import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavLink from 'next/link';
// 

interface Brand {
    id: string;
    name: string;
    logoSrc: string;
}

interface Category {
    id: string;
    name: string;
    brands: Brand[];
}

interface MegaMenuProps {
    categories: Category[];
    isVisible: boolean;
    onMouseLeave: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ categories, isVisible, onMouseLeave }) => {
    const router = useRouter();
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const menuClasses = `absolute top-full mt-0.5 left-0 z-10 bg-white rounded-b-2xl shadow-lg ${isVisible ? 'block' : 'hidden'
        } w-full `;

    return (
        <div className={menuClasses} onMouseLeave={onMouseLeave}>
            <div className="container mx-auto px-4 py-6 flex space-x-8">
                {/* Left side - Categories */}
                <div className="flex flex-col space-y-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className={`cursor-pointer ${hoveredCategory === category.id ? 'font-medium text-primaryColor' : 'text-gray-700'
                                }`}
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <p>{category.name}</p>
                        </div>
                    ))}
                </div>

                {/* Right side - Brands */}
                <div>
                    {hoveredCategory && (
                        <div className="flex flex-wrap gap-2">
                            {categories
                                .find((category) => category.id === hoveredCategory)
                                ?.brands.map((brand) => (
                                    <div key={brand.id}  className="flex flex-col gap-2 items-center justify-center">
                                        <img
                                            src={brand.logoSrc}
                                            alt={brand.name}
                                            className="w-full h-auto mb-2"
                                        />
                                        <div>{brand.name}</div>
                                    </div>
                                ))}
                                
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MegaMenu;

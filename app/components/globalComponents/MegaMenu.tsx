"use client"
import Link from "next/link";
import { PhoneCall, MapPin, Facebook, Instagram } from "lucide-react";
import { useState, useRef, useEffect } from 'react';

interface Product {
    id: string;
    brand: string;
    category: string;
    name: string;
    slug: string;
    description: string;
}

interface MegaMenuProps {
    products?: Product[];
    hover: boolean;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ products, hover }) => {

    return (
        <div
            className={`mega-menu fixed left-0 ${hover ? "block" : "hidden"} w-full bg-white p-4 mt-2 shadow-lg z-50`}
        >
            <ul>
                {products?.map((product) => (
                    <li key={product.id} className="text-primary-700">
                        <Link
                            href="/[brand]/[item]"
                            as={`/${product.brand.toLowerCase()}/${product.slug}`}
                        >
                            {product.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export default MegaMenu
'use client'
import { useQuery } from '@apollo/client';
import { GET_NAV_BRANDS } from '@/graphql/defs/nav';
import Link from 'next/link';
import { Brand } from '@/graphql/types/graphql';
import { ArrowRight } from 'lucide-react';

export default function BrandsMenu() {
    const { data, loading, error } = useQuery(GET_NAV_BRANDS);

    const brands: Brand[] = data?.brands?.nodes || [];

    // Function to split brands into columns
    const splitIntoColumns = (items: Brand[], columnCount: number): Brand[][] => {
        const columns: Brand[][] = Array.from({ length: columnCount }, () => []);
        items.forEach((item, index) => {
            columns[index % columnCount].push(item);
        });
        return columns;
    };

    const columnCount = 4;

    return (
        <div className="w-full bg-white md:w-[800px] lg:w-[800px] xl:w-[1200px]">
            <div className="text-sm p-3 text-muted-foreground mb-2 w-full border-b pb-2">
                <Link href="/brands" className="flex items-center hover:underline hover:text-blue-800 transition-colors duration-200">
                    <span>Browse all brands</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:text-blue-500" />
                </Link>
            </div>
            <div className="flex space-x-6 p-3 pt-1">
                {loading ? (
                    <div className="flex-1">
                        <p>Loading brands...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1">
                        <p>Error loading brands</p>
                    </div>
                ) : (
                    splitIntoColumns(brands, columnCount).map((column, colIndex) => (
                        <div key={colIndex} className="flex-1">
                            {column.map((brand) => (
                                <div key={brand.id} className="brand-item mb-2 p-2 hover:bg-zinc-100 rounded-md">
                                    <Link href={`/${brand.slug}`} className="text-blue-950 hover:underline flex items-center">
                                        <span className="inline-block bg-zinc-200 rounded-full w-6 h-6 mr-1.5"></span>
                                        <span className="truncate max-w-[200px] text-sm font-semibold">{brand.name}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
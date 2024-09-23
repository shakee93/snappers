'use client'
import { useQuery } from '@apollo/client';
import { GET_NAV_CATEGORIES } from '@/graphql/defs/nav';
import Link from 'next/link';
import { ProductCategory } from '@/graphql/types/graphql';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function NavCategories() {
    const { data, loading, error } = useQuery(GET_NAV_CATEGORIES);

    const categories: ProductCategory[] = data?.productCategories?.nodes || [];

    // console.log('categories', data?.productCategories?.nodes);

    // Function to split categories into columns
    const splitIntoColumns = (items: ProductCategory[], columnCount: number): ProductCategory[][] => {
        const columns: ProductCategory[][] = Array.from({ length: columnCount }, () => []);
        items.forEach((item, index) => {
            columns[index % columnCount].push(item);
        });
        return columns;
    };

    const columnCount = 3;

    return (
        <div className="w-full bg-white md:w-[800px] lg:w-[800px] xl:w-[1200px]">
            <div className="text-sm p-3 text-muted-foreground mb-2 w-full border-b pb-2">
                <Link href="/collections" className="flex items-center hover:underline hover:text-blue-800 transition-colors duration-200">
                    <span>Browse all categories</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:text-blue-500" />
                </Link>
            </div>
            <div className="flex space-x-6 p-3 pt-1">
                {loading ? (
                    <div className="flex-1">
                        <p>Loading categories...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1">
                        <p>Error loading categories</p>
                    </div>
                ) : (
                    splitIntoColumns(categories, columnCount).map((column, colIndex) => (
                        <div key={`column-${colIndex}`} className="flex-1">
                            {column.map((category) => (
                                <div key={`category-${category.slug}`} className="category-group mb-2 p-2 hover:bg-zinc-100 rounded-md">
                                    <h3 className={`text-sm font-semibold ${category.children?.nodes && category.children.nodes.length > 0 ? 'mb-2' : ''}`}>
                                        <Link href={`/collections/${category.slug}`} className="text-blue-950 hover:underline flex items-center">
                                            {category.image?.sourceUrl ? (
                                                <Image
                                                    src={category.image.sourceUrl}
                                                    alt={category.name ?? ''}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full w-6 h-6 mr-1.5 object-contain"
                                                />
                                            ) : (
                                                <span className="inline-block bg-zinc-200 rounded-full w-6 h-6 mr-1.5"></span>
                                            )}
                                            <span className="truncate max-w-[200px]">{category.name}</span>
                                        </Link>
                                    </h3>
                                    {category?.children?.nodes && category.children.nodes.length > 0 && (
                                        <ul className="space-y-1">
                                            {category?.children?.nodes.map((child: ProductCategory) => (
                                                <li key={`child-${child.slug}`} className='ml-2.5'>
                                                    <Link href={`/collections/${child.slug}`} className="text-sm text-muted-foreground hover:text-primary">
                                                        {child.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
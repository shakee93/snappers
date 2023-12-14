export interface Product {
    id: string;
    brand: string;
    category: string;
    name: string;
    slug: string;
    description: string;
}

export interface Brand {
    id: number;
    href: string;
    name: string;
    products?: Product[];
}

export const brands: Brand[] = [
    {
        id: 1,
        href: "/apple",
        name: "Apple",
        products: [
            {
                id: '1',
                brand: 'Apple',
                category: 'Phones',
                name: 'iPhone 15',
                slug: 'iphone-15',
                description: 'The latest iPhone model.',
            },
            {
                id: '2',
                brand: 'Apple',
                category: 'Laptops',
                name: 'MacBook Pro',
                slug: 'macbook-pro',
                description: 'Powerful MacBook for professionals.',
            },
            {
                id: '3',
                brand: 'Apple',
                category: 'Tablets',
                name: 'iPad Pro',
                slug: 'ipad-pro',
                description: 'High-performance iPad for creative tasks.',
            }
        ],
    },
    {
        id: 2,
        href: "/samsung",
        name: "Samsung",
        products: [
            {
                id: '1',
                brand: 'Samsung',
                category: 'Phones',
                name: 'Galaxy S',
                slug: 'galaxys',
                description: 'The latest Samsung model.',
            },
            {
                id: '2',
                brand: 'Samsung',
                category: 'Phone',
                name: 'Galaxy Note',
                slug: 'galaxy-note',
                description: 'Powerful MacBook for professionals.',
            },
            {
                id: '3',
                brand: 'Samsung',
                category: 'TV',
                name: 'Smart TV',
                slug: 'smart-tv',
                description: 'High-performance iPad for creative tasks.',
            }],
    },
    {
        id: 3,
        href: "/page-collection-2",
        name: "Beats",
    },

    {
        id: 4,
        href: "/page-collection-2",
        name: "Huawei",
    },
    {
        id: 5,
        href: "/page-collection-2",
        name: "Sony",
    },
    {
        id: 6,
        href: "/page-collection-2",
        name: "Realme",
    },
    {
        id: 7,
        href: "/page-collection-2",
        name: "OnePlus",
    },
    {
        id: 8,
        href: "/page-collection-2",
        name: "JBL",
    },
    {
        id: 9,
        href: "/page-collection-2",
        name: "Honor",
    },
    {
        id: 10,
        href: "/page-collection-2",
        name: "Microsoft",
    },
    {
        id: 11,
        href: "/page-collection-2",
        name: "Microsoft",
    },
    {
        id: 12,
        href: "/page-collection-2",
        name: "Microsoft",
    }
];

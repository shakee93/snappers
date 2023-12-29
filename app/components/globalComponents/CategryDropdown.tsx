"use client"
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/graphql/types/graphql';

const DropdownButton = ({categories} : { categories: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  
  // const categories = [
  //   { name: 'Mobile', link: '/mobile' },
  //   { name: 'Speakers', link: '/speakers' },
  //   { name: 'Laptops', link: '/laptops' },
  //   { name: 'Smart Watches', link: '/smart-watches' },
  // ];

  return (
    <div className="relative top-3 inline-block text-center">
      <button
        id="dropdownDefaultButton"
        onClick={toggleDropdown}
        className="hidden uppercase ml-[15px] mr-2 md:flex w-40 pl-3 justify-center py-2 text-xs xl:text-sm items-center rounded-lg"
        type="button"
      >
        All Categories <ChevronDown className="h-5 ml-1" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="z-50 absolute mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
          <ul className="py-2 text-left text-sm text-gray-700 grid grid-cols-4 min-w-max  dark:text-gray-200">
            {categories?.map((category: Category, index: number) => (
              <li key={index} className='w-full'>
                <Link
                  href={`/${category.slug}`}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                   {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;

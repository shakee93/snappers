import React, { useState } from 'react';
import { Transition } from '@headlessui/react';

const AccordionItem = ({ title, content }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
      >
        <div className="flex justify-between items-center">
          <span>{title}</span>
          <svg
            className={`w-6 h-6 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <Transition
        show={isOpen}
        enter="transition-all duration-500 ease-in-out"
        enterFrom="max-h-0 opacity-0"
        enterTo="max-h-screen opacity-100"
        leave="transition-all duration-500 ease-in-out"
        leaveFrom="max-h-screen opacity-100"
        leaveTo="max-h-0 opacity-0"
      >
        <div className="p-4 text-gray-600">
          {content}
        </div>
      </Transition>
    </div>
  );
};

const Accordion = () => {
  const items = [
    {
      title: 'Accordion Item 1',
      content: 'This is the content for the first accordion item.',
    },
    {
      title: 'Accordion Item 2',
      content: 'This is the content for the second accordion item.',
    },
    {
      title: 'Accordion Item 3',
      content: 'This is the content for the third accordion item.',
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10">
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.title} content={item.content} />
      ))}
    </div>
  );
};

export default Accordion;

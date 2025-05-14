'use client'

import { useState, useRef, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'
import { Transition } from '@headlessui/react'
import { CircleUser } from 'lucide-react'
import googleLogo from '@/public/images/testimonials/icons8-google.webp'

interface Testimonial {
    quote: string
    name: string
    role: string
}


const testimonials: Testimonial[] = [
    {
      quote: "I had an absolutely wonderful experience at GQ - The Mobile Store! The staff was incredibly helpful and went above and beyond to ensure I found the perfect product. They were friendly, approachable, and made the entire process smooth and stress-free.",
      name: 'Thilina M. Senadheera',
      role: ''
    },
    {
      quote: "Fourth time buying a phone from GQ. Always selling original products. No complaints whatsoever. Friendly customer service. A best place to buy electronic items",
      name: 'Angelo Yohan Diaz',
      role: ''
    },
    {
      quote: "Great experience at this shop! The staff was very helpful, and the prices were reasonable. The best part was their excellent service—when I needed to withdraw money from the ATM, they sent a staff member with me to make the process smooth and secure. Highly recommended!",
      name: 'Rashmika Wellappili',
      role: ''
    },
    {
      quote: "I recently purchase Bose QC ultra headphones from GQ mobile and I am so much satisfied with their service. Highly recommended place. Great service by ASIF who is very friendly.",
      name: 'Prasanna Fonseka',
      role: ''
    },
    {
      quote: "The best place to purchase genuine, reliable & quality products. The staff is very attentive and friendly. Quick and efficient delivery service. Order from Daraz. Good packing and no physical damage. Satisfied with the order. Package as same as expected and highly recommended to anyone. Thank you GQ team!",
      name: 'Missaka Sithara',
      role: ''
    },
    {
      quote: "Went to GQ Mobile looking for a mobile phone for a friend. Though we didn't end up buying the item, Aasif sat down with us and explained all the things to look for and the regions info and warranty processes. Thanks Aasif for providing such a great customer experience!",
      name: 'Kasun Eranda',
      role: ''
    }
  ]


export default function FancyTestimonialsSlider() {
    const testimonialsRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState<number>(0)
    const [autorotate, setAutorotate] = useState<boolean>(true)
    const autorotateTiming: number = 5000

    useEffect(() => {
        if (!autorotate) return
        const interval = setInterval(() => {
            setActive(active + 1 === testimonials.length ? 0 : active => active + 1)
        }, autorotateTiming)
        return () => clearInterval(interval)
    }, [active, autorotate])

    const heightFix = () => {
        if (testimonialsRef.current && testimonialsRef.current.parentElement) testimonialsRef.current.parentElement.style.height = `${testimonialsRef.current.clientHeight}px`
    }

    useEffect(() => {
        heightFix()
    }, [])

    return (
        <div className="w-full max-w-3xl mx-auto text-center">
            {/* Testimonial image */}
            <div className="relative h-32">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] pointer-events-none before:absolute before:inset-0 
                before:bg-gradient-to-b before:from-primaryColor/25 before:via-primaryColor/5 before:via-25% before:to-primaryColor/0 before:to-75% before:rounded-full before:-z-10">
                    <div className="h-32 [mask-image:_linear-gradient(0deg,transparent,theme(colors.white)_20%,theme(colors.white))]">

                        {testimonials.map((testimonial, index) => (
                            <Transition
                                as="div"
                                key={index}
                                show={active === index}
                                className="absolute inset-0 h-full -z-10"
                                enter="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700 order-first"
                                enterFrom="opacity-0 -rotate-[60deg]"
                                enterTo="opacity-100 rotate-0"
                                leave="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700"
                                leaveFrom="opacity-100 rotate-0"
                                leaveTo="opacity-0 rotate-[60deg]"
                                beforeEnter={() => heightFix()}
                            >
                                <Image className="relative top-11 left-1/2 -translate-x-1/2 rounded-full"
                                    src={googleLogo} width={56} height={56} alt={testimonial.name}
                                />
                                
                            </Transition>
                        ))}

                    </div>
                </div>
            </div>
            {/* Text */}
            <div className="mb-9 transition-all duration-150 delay-300 ease-in-out min-h-[96px]">
                <div className="relative flex flex-col" ref={testimonialsRef}>

                    {testimonials.map((testimonial, index) => (
                        <Transition
                            as="div"
                            key={index}
                            show={active === index}
                            enter="transition ease-in-out duration-500 delay-200 order-first"
                            enterFrom="opacity-0 -translate-x-4"
                            enterTo="opacity-100 translate-x-0"
                            leave="transition ease-out duration-300 delay-300 absolute"
                            leaveFrom="opacity-100 translate-x-0"
                            leaveTo="opacity-0 translate-x-4"
                            beforeEnter={() => heightFix()}
                        >
                            <div className="text-2xl font-bold text-slate-900  min-h-[96px] overflow-hidden text-ellipsis line-clamp-4">
                                {testimonial.quote}
                            </div>
                        </Transition>
                    ))}

                </div>
            </div>
            {/* Buttons */}
            <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto mb-4">
                {testimonials.slice(0, 4).map((testimonial: any, index: any) => (
                    <button
                        key={index}
                        className={`inline-flex justify-center items-center rounded-full px-3 py-1.5 w-[120px] overflow-hidden truncate text-xs shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 dark:focus-visible:ring-slate-600 transition-colors duration-150 text-center ${active === index ? 'bg-primaryColor text-white shadow-indigo-950/10' : 'bg-white hover:bg-indigo-100 text-slate-900'}`}
                        onClick={() => { setActive(index); setAutorotate(false); }}
                    >
                        <span className="truncate w-full">{testimonial.name}</span>
                    </button>
                ))}
            </div>
            <div className="flex justify-center gap-4">
                {testimonials.slice(4).map((testimonial: any, index: any) => (
                    <button
                        key={index + 4}
                        className={`inline-flex justify-center items-center rounded-full px-3 py-1.5 w-[120px] overflow-hidden truncate text-xs shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 dark:focus-visible:ring-slate-600 transition-colors duration-150 text-center ${active === index + 4 ? 'bg-primaryColor text-white shadow-indigo-950/10' : 'bg-white hover:bg-indigo-100 text-slate-900'}`}
                        onClick={() => { setActive(index + 4); setAutorotate(false); }}
                    >
                        <span className="truncate w-full">{testimonial.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
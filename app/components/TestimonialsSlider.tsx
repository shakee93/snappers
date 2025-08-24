'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

interface Testimonial {
    quote: string
    name: string
    role: string
    rating: number
}

interface ReviewData {
    quote?: string
    review?: string
    reviewer_name?: string
}

interface TestimonialsSliderProps {
    reviews?: ReviewData[]
}

const fallBacktestimonials: Testimonial[] = [
    {
              quote: "The best place to purchase genuine, reliable & quality products. The staff is very attentive and friendly. Quick and efficient delivery service. Order from Daraz. Good packing and no physical damage. Satisfied with the order. Package as same as expected and highly recommended to anyone. Thank you GQ team!",
              name: 'Missaka Sithara',
              role: '',
              rating: 5
            },
            {
              quote: "I recently purchase Bose QC ultra headphones from GQ mobile and I am so much satisfied with their service. Highly recommended place. Great service by ASIF who is very friendly.",
              name: 'Prasanna Fonseka',
              role: '',
              rating: 5
            },
            {
              quote: "Great experience at this shop! The staff was very helpful, and the prices were reasonable. The best part was their excellent service—when I needed to withdraw money from the ATM, they sent a staff member with me to make the process smooth and secure. Highly recommended!",
              name: 'Rashmika Wellappili',
              role: '',
              rating: 5
            },
            {
              quote: "I had an absolutely wonderful experience at GQ - The Mobile Store! The staff was incredibly helpful and went above and beyond to ensure I found the perfect product. They were friendly, approachable, and made the entire process smooth and stress-free.",
              name: 'Thilina M. Senadheera',
              role: '',
              rating: 5
            },
            {
              quote: "Fourth time buying a phone from GQ. Always selling original products. No complaints whatsoever. Friendly customer service. A best place to buy electronic items",
              name: 'Angelo Yohan Diaz',
              role: '',
              rating: 5
            },
            {
              quote: "Went to GQ Mobile looking for a mobile phone for a friend. Though we didn't end up buying the item, Aasif sat down with us and explained all the things to look for and the regions info and warranty processes. Thanks Aasif for providing such a great customer experience!",
              name: 'Kasun Eranda',
              role: '',
              rating: 5
            }
]

// NEW TESTIMONIALS SLIDER USING SHADCN CAROUSEL
export default function TestimonialsSlider({ reviews }: TestimonialsSliderProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    // Transform GraphQL reviews to testimonials format, fallback to static data
    const testimonials: Testimonial[] = reviews && reviews.length > 0 
        ? reviews.map((review) => ({
            quote: review.quote || review.review || '',
            name: review.reviewer_name || 'Anonymous',
            role: '',
            rating: 5 // Default rating since it's not provided in the GraphQL query
        }))
        : fallBacktestimonials

    useEffect(() => {
        if (!api) return

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    // Auto-slide functionality
    useEffect(() => {
        if (!api) return

        const interval = setInterval(() => {
            api.scrollNext()
        }, 5000)

        return () => clearInterval(interval)
    }, [api])

    return (
        <div className="w-full mx-auto px-4 py-8">
            {/* Section Title */}

            {/* Testimonials Carousel */}
            <div className="relative">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                        slidesToScroll: 1,
                    }}
                    setApi={setApi}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {/* Create groups of 6 testimonials for 2 rows of 3 */}
                        {Array.from({ length: Math.ceil(testimonials.length / 6) }, (_, groupIndex) => (
                            <CarouselItem 
                                key={groupIndex} 
                                className="pl-2 md:pl-4 basis-full"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {testimonials.slice(groupIndex * 6, (groupIndex + 1) * 6).map((testimonial, index) => (
                                        <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                            {/* Star Rating */}
                                            <div className="flex items-center mb-4">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>

                                            {/* Testimonial Text */}
                                            <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                                {testimonial.quote}
                                            </p>

                                            {/* Customer Name */}
                                            <p className="text-gray-900 font-medium text-sm">
                                                {testimonial.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Navigation arrows positioned in the middle */}
                    <CarouselPrevious className="absolute xl:-left-14 lg:-left-2 lg:right-auto right-10 lg:top-1/2 -top-14 -translate-y-1/2 z-10 border-0 bg-[#cecfd0] text-white hover:bg-[#9e9fa0] hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
                    <CarouselNext className="absolute xl:-right-14 -right-2 lg:top-1/2 -top-14 -translate-y-1/2 z-10 border-0 bg-[#cecfd0] text-white hover:bg-[#9e9fa0] hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
                </Carousel>

                {/* Dot Navigation */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                current === index + 1 
                                    ? 'bg-[#1e40af] w-6' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
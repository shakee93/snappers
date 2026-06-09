'use client'

import { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/global/ui/carousel"
import fallBacktestimonials from "@/content/testimonials.json"

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

// NEW TESTIMONIALS SLIDER USING SHADCN CAROUSEL
export default function TestimonialsSlider({ reviews }: TestimonialsSliderProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const carouselRef = useRef<HTMLDivElement>(null)

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

    // Auto-slide functionality with pause on hover
    useEffect(() => {
        if (!api) return

        let interval: NodeJS.Timeout;

        const startAutoSlide = () => {
            interval = setInterval(() => {
                api.scrollNext();
            }, 5000);
        };

        const stopAutoSlide = () => {
            if (interval) {
                clearInterval(interval);
            }
        };

        // Start auto-slide initially
        startAutoSlide();

        // Add event listeners for pause on hover using ref
        const carouselElement = carouselRef.current;
        if (carouselElement) {
            carouselElement.addEventListener('mouseenter', stopAutoSlide);
            carouselElement.addEventListener('mouseleave', startAutoSlide);
        }

        return () => {
            stopAutoSlide();
            if (carouselElement) {
                carouselElement.removeEventListener('mouseenter', stopAutoSlide);
                carouselElement.removeEventListener('mouseleave', startAutoSlide);
            }
        };
    }, [api])

    return (
        <div className="w-full mx-auto px-4 py-8">
            {/* Section Title */}

            {/* Testimonials Carousel */}
            <div ref={carouselRef} className="relative">
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
                    <CarouselPrevious className="absolute xl:-left-14 lg:-left-2 lg:right-auto right-10 lg:top-1/2 -top-14 -translate-y-1/2 z-10 border-0 bg-neutral-300 text-white hover:bg-neutral-400 hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
                    <CarouselNext className="absolute xl:-right-14 -right-2 lg:top-1/2 -top-14 -translate-y-1/2 z-10 border-0 bg-neutral-300 text-white hover:bg-neutral-400 hover:text-white transition-colors duration-200 p-1 md:p-2 w-8 h-8 md:w-10 md:h-10 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6" />
                </Carousel>

                {/* Dot Navigation */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                current === index + 1
                                    ? 'bg-blue-800 w-6'
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
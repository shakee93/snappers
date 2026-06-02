import BgGlassmorphism from "@/components/ui/BgGlassmorphism/BgGlassmorphism";
import { siteConfig } from "@/site.config";
import aboutContent from "@/content/about.json";
import Image from "next/image";
import StoreImg from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-1-1.webp";
import Img1 from "public/aboutpage/about-img-1-1.jpg";
import Img2 from "public/aboutpage/about-img-2-1.jpg";
import Img3 from "public/aboutpage/about-img-3-1.jpg";

const cardImages = [Img1, Img2, Img3];

const AccountPage = () => {
  const about = aboutContent.cards;
  const stats = aboutContent.stats;
  const services = aboutContent.services;
  const testimonialData = aboutContent.testimonials;

  return (
    <div>
      <BgGlassmorphism />
      <div className="container  lg:p-20 ">
        <div className="flex flex-col-reverse lg:flex-row items-center">
          <div className="lg:w-1/2 p-5 flex flex-col items-center gap-6">
            <h1 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100">
              About Us.
            </h1>
            <div className="block text-base xl:text-base text-neutral-6000 dark:text-neutral-400 lg:text-justify">
              For more than 20 years,{" "}
              <span className="text-primary-500">
                {siteConfig.brand.name}
              </span>{" "}
              has demonstrated excellence in the retail industry by
              distinguishing itself with a commitment to delivering complete
              customer satisfaction with trained and passionate staffs, and
              dedication to fair pricing. The company prides itself in its
              constant innovation by bringing new offerings, products and
              experiences to its customers on a regular basis.
            </div>
          </div>
          <div className="lg:w-1/2 p-5">
            <Image
              src={StoreImg}
              alt=""
              className="rounded-3xl h-auto w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-5  lg:py-20">
          {about.map((item, index) => (
            <div key={index} className="gap-2 md:gap-5 flex flex-col">
              <div className="">
                <Image
                  src={cardImages[index]}
                  alt={item.title}
                  className="rounded-3xl"
                />
              </div>
              <div className="text-xl xl:text-3xl !leading-tight font-semibold  dark:text-neutral-400 text-primary-500">
                {item.title}
              </div>
              <div className="text-base xl:text-base text-neutral-6000 dark:text-neutral-400 ">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="p-10 flex flex-col gap-5 bg-blue-50  md:p-20 rounded-3xl">
          <h2 className="text-2xl !leading-tight font-semibold text-neutral-900 md:text-3xl xl:text-4xl dark:text-neutral-100">
            Our Services.
          </h2>
          {services.map((service, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="text-primary-500 font-medium text-lg leading-tight md:text-xl">
                {service.title}
              </div>
              <div className="text-base xl:text-base text-neutral-6000 dark:text-neutral-400 ">
                {service.body}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-transparent py-16 lg:py-20 rounded-3xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center md:grid-cols-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="mx-auto flex max-w-xs flex-col gap-y-4"
                >
                  <dt className="text-base leading-7 text-gray-900">
                    {stat.name}
                  </dt>
                  <dd className="order-first text-4xl font-semibold tracking-tight text-primary-500 sm:text-6xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mx-auto text-center p-10 xl:p-20 rounded-3xl bg-orange-50 mb-10">
          <div className="pb-16">
            <h3 className="mb-3 text-2xl !leading-tight font-semibold text-neutral-900 md:text-3xl xl:text-4xl dark:text-neutral-100">
              Happy Customers.
            </h3>
            <div className="text-primary-500 font-medium text-lg leading-tight md:text-xl">
              Know what our loyal customers think about our store
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {testimonialData.map((testimonial, index) => (
              <div key={index} className="mb-12">
                <h5 className="mb-4 text-xl font-semibold">
                  {testimonial.name}
                </h5>
                <h6 className="mb-4 px-4 font-semibold text-primary dark:text-primary-500 ">
                  {testimonial.role}
                </h6>
                <p className="mb-4 ">{testimonial.content}</p>
                <ul className="mb-0 flex items-center justify-center">
                  {[...Array(testimonial.ratings)].map((_, index) => (
                    <li key={index}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

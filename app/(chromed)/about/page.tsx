import BgGlassmorphism from "@/components/BgGlassmorphism/BgGlassmorphism";
import Image from "next/image";
import StoreImg from "public/store/GqMobiles-Buy-geniune-branded-eletronics-from-GQMobiles-for-best-price-1-1.webp";
import Img1 from "public/aboutpage/about-img-1-1.jpg";
import Img2 from "public/aboutpage/about-img-2-1.jpg";
import Img3 from "public/aboutpage/about-img-3-1.jpg";


const AccountPage = () => {
  const about = [
    {
      id: 1,
      img: Img1,
      title: "Our Vision",
      desc: "Our vision is to create a place where you can buy the latest and best mobile phones and accessories with better best customer care services, all for a great price.",
    },
    {
      id: 2,
      img: Img2,
      title: "What We Do",
      desc: "We provide the latest mobile phones and accessories to our customers with great service and support for their tech products all around Sri Lanka.",
    },
    {
      id: 3,
      img: Img3,
      title: "Company History",
      desc: "GQ mobiles Pvt Ltd was founded in 2002. We have now expanded our operations into main branch at Liberty Plaza to better serve our loyal customers.",
    },
  ];
  const stats = [
    { id: 1, name: "Products", value: "500+" },
    { id: 2, name: "Orders Completed", value: "1200+" },
  ];

  const testimonialData = [
    {
      name: "Rushad Jiffry",
      role: "Production Manager It Cordinator at D Studio CMB",
      content:
        "“GQ is the Great Place to Buy Genuine Products! Very Professional their rates are competitive and fair. Thank you for the genuine chrome cast I am extremely happy with The Product . I would like to recommend this place anyone who likes to buy genuine branded products.”",
      ratings: 5,
    },
    {
      name: "Gayan De Silva",
      role: "Project Manager at Calcey Technologies Pvt Ltd",
      content:
        "“Have bought multiple smart phones and smart watches. Got agent warranty on the phones and the prices have been the best in the market as well. Would recommend their products + the service ”",
      ratings: 4,
    },
    {
      name: "Shal Jayatunga",
      role: "Works at Audi Sri Lanka",
      content:
        "“I was looking for a phone to buy urgently and a friend of mine put me on to this shop. I got a super service from them and a good price for the phone I wanted to buy. They even delivered the phone to my office. I can highly recommend them to anyone. All the best! ”",
      ratings: 5,
    },
  ];

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
              <span className="text-primaryColor">
                GQ Mobiles
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
          {about.map((item) => (
            <div key={item.id} className="gap-2 md:gap-5 flex flex-col">
              <div className="">
                <Image
                  src={item.img}
                  alt={item.title}
                  className="rounded-3xl"
                />
              </div>
              <div className="text-xl xl:text-3xl !leading-tight font-semibold  dark:text-neutral-400 ytext-primaryColor">
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
          <div className="flex flex-col gap-3">
            <div className="text-primaryColor font-medium text-lg leading-tight md:text-xl">
              Online Ordering. Your phone delivered to your doorstep!
            </div>
            <div className="text-base xl:text-base text-neutral-6000 dark:text-neutral-400 ">
              Prefer to purchase online? Then visit our online store. You can
              search by Brand, budget, or even model name. Once you’ve decided
              just complete the payment details. We promise to deliver your
              phone within 07 working days straight to your doorstep. We even
              give a cashback guarantee if you’re not satisfied.
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-primaryColor font-medium text-lg leading-tight md:text-xl">
              After Sales support. Fast response and solutions that satisfy.
            </div>
            <div className="text-base xl:text-base text-neutral-6000 dark:text-neutral-400 ">
              Nothing more frustrating than when a phone starts playing up. We
              understand! That’s why we aim to provide you fast and reliable
              after-sales support. For any support just call us on +94 75 455 5665
            </div>
          </div>
        </div>

        <div className="bg-transparent py-16 lg:py-20 rounded-3xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center md:grid-cols-2">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="mx-auto flex max-w-xs flex-col gap-y-4"
                >
                  <dt className="text-base leading-7 text-gray-900">
                    {stat.name}
                  </dt>
                  <dd className="order-first text-4xl font-semibold tracking-tight text-primaryColor sm:text-6xl">
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
            <div className="text-primaryColor font-medium text-lg leading-tight md:text-xl">
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

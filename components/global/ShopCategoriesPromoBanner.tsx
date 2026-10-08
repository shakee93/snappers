import Image from "next/image";

const BANNER_SRC =
  "/homepage/banners/Everyday%20Essentials%2C%20Delivered%202.png";

const ShopCategoriesPromoBanner = () => {
  return (
    <section
      className="container pt-4 lg:pt-6"
      aria-label="Your everyday essentials, delivered"
    >
      <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[28px]">
        <Image
          src={BANNER_SRC}
          alt="Snappers - Your Everyday Essentials, Delivered. Groceries, household essentials, personal care, baby care and more."
          width={2172}
          height={724}
          className="h-auto w-full object-cover object-center"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
        />
      </div>
    </section>
  );
};

export default ShopCategoriesPromoBanner;

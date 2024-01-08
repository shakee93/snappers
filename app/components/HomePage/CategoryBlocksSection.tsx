import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
} from "@nextui-org/react";
import img1 from "@/public/homepage/mobiles.png";
import img2 from "@/public/homepage/buds.jpg";
import img3 from "@/public/homepage/speaker.jpg";
import img4 from "@/public/homepage/watch.jpg";
import img5 from "@/public/homepage/laptop.webp";
import Link from "next/link";

export default function CategoryBlockSection() {
  return (
    <div className=" gap-5 grid grid-cols-12 grid-rows-2 py-5">
      <Card className="col-span-12 sm:col-span-4 h-[200px] md:h-[300px]">
        <CardHeader className="absolute z-10 top-1 flex-col !items-start">
          <p className="text-base text-white/80 font-medium">
            Elevate Your Productivity
          </p>

          <h4 className="text-white font-medium text-3xl">MacBooks</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-full object-cover"
          src={img5.src}
        />
        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <div className="flex flex-col">
              <p className="text-sm text-white/60 hidden lg:block">
                Experience the Power of MacBooks
              </p>
            </div>
          </div>
          <Link href={"/collections/macbooks"}>
            <Button
              className="bg-primaryColor text-white text-sm"
              radius="full"
              size="md"
            >
              Get a Mackbook
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card className="col-span-12 sm:col-span-4 h-[200px] md:h-[300px]">
        <CardHeader className="absolute z-10 top-1 flex-col !items-start">
          <p className="text-base text-white/80 font-medium">
            Immerse Yourself in Sound
          </p>

          <h4 className="text-white font-medium text-3xl">
            Audio Excellence Collection
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-full object-cover"
          src={img2.src}
        />
        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <div className="flex flex-col">
              <p className="text-sm text-white/60 hidden lg:block">
                Surround Yourself with Sound
              </p>
            </div>
          </div>
          <Link href={"/collections/all-headphones"}>
            <Button
              className="bg-primaryColor text-white text-sm"
              radius="full"
              size="md"
            >
              All Headphones
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card className="col-span-12 sm:col-span-4 h-[200px] md:h-[300px]">
        <CardHeader className="absolute z-10 top-1 flex-col !items-start">
          <p className="text-base text-white/80 font-medium">
            Surround Yourself with Sound
          </p>

          <h4 className="text-white font-medium text-3xl">
            Immersive Speaker Collection
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-full object-cover"
          src={img3.src}
        />
        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <div className="flex flex-col">
              <p className="text-sm text-white/60 hidden lg:block">
                Stay Connected, Stay Active
              </p>
            </div>
          </div>
          <Link href={"/collections/smart-speakers"}>
            <Button
              className="bg-primaryColor text-white text-sm"
              radius="full"
              size="md"
            >
              Browse Speakers
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card
        isFooterBlurred
        className="w-full h-[200px] md:h-[300px] col-span-12 sm:col-span-5"
      >
        <CardHeader className="absolute z-10 top-1 flex-col items-start">
          <p className="text-base text-white/80 font-medium">
            Stay Connected, Stay Active
          </p>

          <h4 className="text-white font-medium text-3xl">
            Futuristic Smartwatches
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card example background"
          className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
          src={img4.src}
        />

        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <div className="flex flex-col">
              <p className="text-sm text-white/60 hidden lg:block">
                Elevate Your Productivity
              </p>
            </div>
          </div>
          <Link href={"/collections/smartwatches"}>
            <Button
              className="bg-primaryColor text-white text-sm"
              radius="full"
              size="md"
            >
              Explore Smart Watches
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card
        isFooterBlurred
        className="w-full h-[200px] md:h-[300px] col-span-12 sm:col-span-7"
      >
        <CardHeader className="absolute z-10 top-1 flex-col items-start p-4">
          <p className="text-base text-white/80 font-medium">
            Infinite Possibilities
          </p>

          <h4 className="text-white font-medium text-3xl">
            Innovative Smartphones
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Relaxing app background"
          className="z-0 w-full h-full object-cover"
          src={img1.src}
        />
        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <div className="flex flex-col">
              <p className="text-sm text-white/60 hidden lg:block">
                Explore our collection of innovative smartphones that offer
                infinite possibilities.
              </p>
            </div>
          </div>
          <Link href={"/collections/smart-phones"}>
            <Button
              className="bg-primaryColor text-white text-sm"
              radius="full"
              size="md"
            >
              Explore Mobiles
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

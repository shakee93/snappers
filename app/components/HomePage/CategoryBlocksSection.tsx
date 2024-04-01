'use client'
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
import tablet1 from "@/public/homepage/tablet1.jpg";
import tablet2 from "@/public/homepage/tablet2.jpg";
import Link from "next/link";

export default function CategoryBlockSection() {
  return (
    <div className=" grid grid-cols-12 grid-rows-2 gap-5 py-5">

      <Card className="col-span-12 h-[200px] sm:col-span-4 md:h-[300px]">
        <CardHeader className="absolute top-1 z-10 flex-col !items-start">
          <p className="text-base font-medium text-white/80">
            Infinite Possibilities
          </p>

          <h4 className="text-3xl font-medium text-white">Innovative Smartphones</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 h-full w-full object-cover"
          src={img1.src}
        />
        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                {/* Explore our collection of innovative smartphones that offer infinite possibilities. */}
                Experience the Power of innovative smartphones
              </p>
            </div>
          </div>
          <Link href={"/collections/smart-phones"}>
            <Button
              className="bg-primaryColor text-sm text-white"
              radius="full"
              size="md"
            >
              Explore Mobiles
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* <Card className="col-span-12 h-[200px] sm:col-span-4 md:h-[300px]">
        <CardHeader className="absolute top-1 z-10 flex-col !items-start">
          <p className="text-base font-medium text-white/80">
            Elevate Your Productivity
          </p>

          <h4 className="text-3xl font-medium text-white">MacBooks</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 h-full w-full object-cover"
          src={img5.src}
        />
        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                Experience the Power of MacBooks
              </p>
            </div>
          </div>
          <Link href={"/collections/macbooks"}>
            <Button
              className="bg-primaryColor text-sm text-white"
              radius="full"
              size="md"
            >
              Get a Mackbook
            </Button>
          </Link>
        </CardFooter>
      </Card>
       */}
      <Card className="col-span-12 h-[200px] sm:col-span-4 md:h-[300px]">
        <CardHeader className="absolute top-1 z-10 flex-col !items-start">
          <p className="text-base font-medium text-white/80">
            Immerse Yourself in Sound
          </p>

          <h4 className="text-3xl font-medium text-white">
            Audio Excellence Collection
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 h-full w-full object-cover"
          src={img2.src}
        />
        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                Surround Yourself with Sound
              </p>
            </div>
          </div>
          <Link href={"/collections/all-headphones"}>
            <Button
              className="bg-primaryColor text-sm text-white"
              radius="full"
              size="md"
            >
              All Headphones
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card className="col-span-12 h-[200px] sm:col-span-4 md:h-[300px]">
        <CardHeader className="absolute top-1 z-10 flex-col !items-start">
          <p className="text-base font-medium text-white/80">
            Surround Yourself with Sound
          </p>

          <h4 className="text-3xl font-medium text-white">
            Immersive Speaker Collection
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 h-full w-full object-cover"
          src={img3.src}
        />
        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                Stay Connected, Stay Active
              </p>
            </div>
          </div>
          <Link href={"/collections/smart-speakers"}>
            <Button
              className="bg-primaryColor text-sm text-white"
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
        className="col-span-12 h-[200px] w-full sm:col-span-5 md:h-[300px]"
      >
        <CardHeader className="absolute top-1 z-10 flex-col items-start">
          <p className="text-base font-medium text-white/80">
            Stay Connected, Stay Active
          </p>

          <h4 className="text-3xl font-medium text-white">
            Futuristic Smartwatches
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card example background"
          className="z-0 h-full w-full -translate-y-6 scale-125 object-cover"
          src={img4.src}
        />

        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                Elevate Your Productivity
              </p>
            </div>
          </div>
          <Link href={"/collections/smartwatches"}>
            <Button
              className="bg-primaryColor text-sm text-white"
              radius="full"
              size="md"
            >
              Explore Smart Watches
            </Button>
          </Link>
        </CardFooter>
      </Card>
      {/* <Card
        isFooterBlurred
        className="col-span-12 h-[200px] w-full sm:col-span-7 md:h-[300px]"
      >
        <CardHeader className="absolute top-1 z-10 flex-col items-start p-4">
          <p className="text-base font-medium text-white/80">
            Infinite Possibilities
          </p>

          <h4 className="text-3xl font-medium text-white">
            Innovative Smartphones
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Relaxing app background"
          className="z-0 h-full w-full object-cover"
          src={img1.src}
        />
        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                Explore our collection of innovative smartphones that offer
                infinite possibilities.
              </p>
            </div>
          </div>
          <Link href={"/collections/smart-phones"}>
            <Button
              className="bg-primaryColor text-sm text-white"
              radius="full"
              size="md"
            >
              Explore Mobiles
            </Button>
          </Link>
        </CardFooter>
      </Card> */}

      <Card
        isFooterBlurred
        className="col-span-12 h-[200px] w-full sm:col-span-7 md:h-[300px]"
      >
        <CardHeader className="absolute top-1 z-10 flex-col items-start p-4">
          <p className="text-base font-medium text-white/80">
            Elevate Your Productivity
          </p>

          <h4 className="text-3xl font-medium text-white">
            Tablets
          </h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Relaxing app background"
          className="z-0 h-full w-full object-cover"
          src={tablet2.src}
        />
        <CardFooter className="border-default-600 dark:border-default-100 absolute bottom-0 z-10 bg-black/40">
          <div className="flex flex-grow items-center gap-2">
            <div className="flex flex-col">
              <p className="hidden text-sm text-white/60 lg:block">
                Explore our collection of Tablets that would boost your productivity.
              </p>
            </div>
          </div>
          <Link href={"/collections/macbooks"}>
            <Button
              className="bg-primaryColor text-sm text-white"
              radius="full"
              size="md"
            >
              Get a Mackbook
            </Button>
          </Link>
        </CardFooter>
      </Card>

    </div>
  );
}

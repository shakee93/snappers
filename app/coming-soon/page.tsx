
// @ts-ignore
import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";
import {twMerge} from "tailwind-merge";


export default async function Home() {

    const Logo = ({className = '', imageClass = ''}: { className?: string, imageClass?: string }) => {
        return (
            <Link href={"/"} className={className}>
                <Image
                    width={320}
                    height={400}
                    priority={true}
                    src={SiteLogo}
                    alt="logo"
                    className={twMerge(
                        "h-32 md:h-48 hover:scale-110 transition-all max-w-[80px] md:max-w-[320px] w-auto p-2 md:p-4 relative rounded-b-2xl",
                        imageClass
                    )}
                ></Image>
            </Link>
        );
    };

    return (
        <section key="1" className="w-full h-screen flex items-center justify-center bg-mobile-pattern">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <Logo/>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl py-8 text-primaryColor">Coming
                            Soon</h1>
                        <p className={`max-w-2xl`}>
                            {`
    Exciting news! Our e-commerce store is under construction. Stay tuned for our grand opening and get ready to explore amazing products and deals!
  `}
                        </p>
                    </div>
                </div>
            </div>
        </section>

    );
}

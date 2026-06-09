import React, { FC } from "react";
// import facebookSvg from "@/public/imahges/Facebook.svg";
// import twitterSvg from "@/public/images/Twitter.svg";
// import googleSvg from "@/public/images/Google.svg";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";


// const loginSocials = [
//     {
//         name: "Continue with Facebook",
//         href: "#",
//         icon: facebookSvg,
//     },
//     {
//         name: "Continue with Twitter",
//         href: "#",
//         icon: twitterSvg,
//     },
//     {
//         name: "Continue with Google",
//         href: "#",
//         icon: googleSvg,
//     },
// ];

const PageLogin = () => {

    return (
        <div className={`nc-PageLogin`} data-nc-id="PageLogin">
            <div className="container mb-24 lg:mb-32">
                <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
                    Login
                </h2>
                <div className="max-w-md mx-auto space-y-6">
                    {/* <div className="grid gap-3">
                        {loginSocials.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 transform transition-transform sm:px-6 hover:translate-y-[-2px]"
                            >
                                <Image style={{ objectFit: 'cover' }}
                                    className="flex-shrink-0 w-auto h-auto"
                                    src={item.icon}
                                    alt={item.name}
                                />
                                <h3 className="flex-grow text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">
                                    {item.name}
                                </h3>
                            </a>
                        ))}
                    </div> */}
                    {/* OR */}
                    <div className="relative text-center">
                        {/* <span
                            className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
                            OR
                        </span> */}
                        <div
                            className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
                    </div>
                    <LoginForm />
                    <span className="block text-center text-neutral-700 dark:text-neutral-300">
                        New user? {` `}
                        <Link className="text-green-600" href="/signup">
                            Create an account
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};


export default PageLogin
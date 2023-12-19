"use client";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/app/components/GlobalComponents/header'
import MainNav1 from "components/Header/MainNav1";
import MainNav2 from "components/Header/MainNav2";

// import Footer from './components/GlobalComponents/Footer'

import "../styles/index.scss";
// import './globals.css'
import "./index.css";
import "../fonts/line-awesome-1.3.0/css/line-awesome.css";
import "rc-slider/assets/index.css";
// import reportWebVitals from "./reportWebVitals";

// const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        <Header/>
        {/* <MainNav1 isTop/> */}
        {/* <MainNav2 isTop/> */}
        {children}
        {/* <Footer/> */}
        </body>
    </html>
  )
}

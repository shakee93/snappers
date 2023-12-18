import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from './components/GlobalComponents/Header'
import Footer from './components/GlobalComponents/Footer'

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
      <body className="bg-gray-100 text-base dark:bg-slate-900 text-slate-900 dark:text-slate-200">
        {/* <Header/> */}
        {children}
        {/* <Footer/> */}
        </body>
    </html>
  )
}

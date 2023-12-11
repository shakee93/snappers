import Image from 'next/image'
'use client';

import MainNav2 from "./components/Header/MainNav2";
import MainNav1 from "./components/Header/MainNav1";
import SectionHero2 from "./components/SectionHero/SectionHero2";

export default function Home() {
  return (
    <main>
      <MainNav1 isTop/>
      {/* <MainNav2 /> */}
      <div className="nc-PageHome relative overflow-hidden">
        {/* SECTION HERO */}
        <SectionHero2 />
      </div>
    </main>
  )
}

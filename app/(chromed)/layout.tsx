import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HeaderGate from "@/components/header/HeaderGate";
import { ChromeGate } from "@/context/ChromeVisibilityProvider";

export default function ChromedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ChromeGate>
        <HeaderGate>
          <Header />
        </HeaderGate>
      </ChromeGate>
      {children}
      <ChromeGate>
        <HeaderGate>
          <Footer />
        </HeaderGate>
      </ChromeGate>
    </>
  );
}

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HeaderGate from "@/components/header/HeaderGate";

export default function ChromedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderGate>
        <Header />
      </HeaderGate>
      {children}
      <HeaderGate>
        <Footer />
      </HeaderGate>
    </>
  );
}

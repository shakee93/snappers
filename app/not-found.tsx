import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HeaderGate from "@/components/header/HeaderGate";
import NotFoundPageContent from "@/components/global/NotFoundPageContent";

export default function NotFound() {
  return (
    <>
      <HeaderGate>
        <Header />
      </HeaderGate>
      <NotFoundPageContent />
      <HeaderGate>
        <Footer />
      </HeaderGate>
    </>
  );
}

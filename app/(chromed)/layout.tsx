import Header from "@/components/layout/globalComponents/header";
import Footer from "@/components/layout/globalComponents/footer";
import HeaderGate from "@/components/layout/globalComponents/HeaderGate";

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

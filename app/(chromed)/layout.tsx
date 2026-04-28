import Header from "@/app/components/globalComponents/header";
import Footer from "@/app/components/globalComponents/footer";
import HeaderGate from "@/app/components/globalComponents/HeaderGate";

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

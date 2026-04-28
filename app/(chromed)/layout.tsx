import Header from "@/app/components/globalComponents/header";
import Footer from "@/app/components/globalComponents/footer";

export default function ChromedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

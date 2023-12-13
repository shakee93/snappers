import { useEffect } from "react";
import { useRouter } from "next/router";

export interface ScrollToTopProps {}

const ScrollToTop: React.FC<ScrollToTopProps> = () => {
  const location = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;

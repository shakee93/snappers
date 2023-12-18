import HeaderTopBar from "@/app/components/globalComponents/HeaderTopBar";
import HeaderNavigationBar from "@/app/components/globalComponents/HeaderNavigationBar";
import HeaderCategoryBar from "@/app/components/globalComponents/HeaderCategoryBar";

const Header = () => {
  const iconSize = 13;
  return (
    <header className="flex flex-col justify-between ">
      <div className="hidden md:block">
        <HeaderTopBar />
      </div>
      <div><HeaderNavigationBar/></div>
      <div><HeaderCategoryBar/></div>


    </header>
  );
};

export default Header;

import HeaderTopBar from "./HeaderTopBar";
import HeaderNavigationBar from "./HeaderNavigationBar";
import HeaderCategoryBar from "./HeaderCategoryBar";
import TabHeader from "./TabHeader";

const Header = () => {
  return (
    <header className="flex flex-col justify-between ">
      <div className="hidden lg:block">
        <HeaderTopBar />
        <HeaderNavigationBar/>
      </div>
      <div className="block lg:hidden">
        <TabHeader/>
      </div>
      {/* <div><HeaderCategoryBar/></div> */}


    </header>
  );
};

export default Header;

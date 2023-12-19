import HeaderTopBar from "./HeaderTopBar";
import HeaderNavigationBar from "./HeaderNavigationBar";
import HeaderCategoryBar from "./HeaderCategoryBar";

const Header = () => {
  return (
    <header className="flex flex-col justify-between ">
      <div className="hidden md:block">
        <HeaderTopBar />
      </div>
      <div><HeaderNavigationBar/></div>
      {/* <div><HeaderCategoryBar/></div> */}


    </header>
  );
};

export default Header;

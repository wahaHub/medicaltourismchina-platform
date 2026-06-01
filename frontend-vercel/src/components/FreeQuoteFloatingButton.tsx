import { Link, useLocation } from "react-router-dom";

const FreeQuoteFloatingButton = () => {
  const location = useLocation();

  // 不在 dashboard、free-quote、medical-case-intake 页面显示
  const hiddenPaths = ['/dashboard', '/free-quote', '/medical-case-intake'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <Link
      to="/free-quote"
      className="fixed right-0 top-1/3 z-[9999] cursor-pointer hover:scale-105 transition-transform duration-300"
    >
      <img
        src="/free_quote_icon.png"
        alt="Free Quote"
        className="drop-shadow-lg w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] xl:w-[160px]"
      />
    </Link>
  );
};

export default FreeQuoteFloatingButton;

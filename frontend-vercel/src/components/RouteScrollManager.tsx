import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollRouteLocation } from "@/utils/routeScroll";

export default function RouteScrollManager() {
  const location = useLocation();

  useEffect(() => {
    scrollRouteLocation(location.hash);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

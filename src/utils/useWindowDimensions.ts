import { useEffect, useState } from "react";
import { WindowDimensions } from "./interfaces";


function getWindowsDimensions(): WindowDimensions {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
};

export default function useWindowDimensions(){
    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(getWindowsDimensions());

    useEffect(() => {
        function handleResize(){
            setWindowDimensions(getWindowsDimensions());
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    },[]);

    return windowDimensions;
};

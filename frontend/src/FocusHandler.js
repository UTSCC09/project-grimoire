import React, { useEffect } from "react";

//code taken from stack overflow
//https://stackoverflow.com/a/54820741
const WindowFocusHandler = () => {
    
    const FOCUSED_TITLE = "Grimoire 📖"
    const BLUR_TITLE = "Grimoire 📔"

    //adding focus props to make dyanmic title change of tab
    const onFocus = () => {
        document.title = FOCUSED_TITLE
    };

    // User has switched away from the tab (AKA tab is hidden)
    const onBlur = () => {
        document.title = BLUR_TITLE
    };

    useEffect(() => {
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        // Calls onFocus when the window first loads
        onFocus();
        // Specify how to clean up after this effect:
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, []);
    return <></>;
};

export default WindowFocusHandler;
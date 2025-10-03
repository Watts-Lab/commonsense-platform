import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { setMetaCookies } from "../utils/metaCookies";

const UrlParamCapture = () => {
  const [searchParams] = useSearchParams();
  const {
    actions: { captureUrlParams },
  } = useSession();

  useEffect(() => {
    const paramsToCapture: { key: string; value: string }[] = [];

    // Capture all query params
    searchParams.forEach((value, key) => {
      paramsToCapture.push({ key, value });

      // Handle fbclid for Meta cookies
      if (key === "fbclid") {
        setMetaCookies(value);
      }
    });

    // Save params if any exist
    if (paramsToCapture.length > 0) {
      captureUrlParams(paramsToCapture);
      console.log("URL params captured:", paramsToCapture);
    } else {
      // Ensure _fbp cookie exists even without fbclid
      setMetaCookies();
    }
  }, [searchParams.toString(), captureUrlParams]);

  return null; // This component doesn't render anything
};

export default UrlParamCapture;

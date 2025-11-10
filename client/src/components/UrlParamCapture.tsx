import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { setMetaCookies } from "../utils/metaCookies";

const UrlParamCapture = () => {
  const [searchParams] = useSearchParams();
  const {
    actions: { captureUrlParams },
  } = useSession();

  const previousParamsRef = useRef<string | null>(null);

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

    const currentParams = JSON.stringify(paramsToCapture);

    // Save params if any exist and are different from the previous ones
    if (
      paramsToCapture.length > 0 &&
      previousParamsRef.current !== currentParams
    ) {
      captureUrlParams(paramsToCapture);
      previousParamsRef.current = currentParams;
    } else {
      // Ensure _fbp cookie exists even without fbclid
      setMetaCookies();
    }
  }, [searchParams.toString(), captureUrlParams]);

  return null; // This component doesn't render anything
};

export default UrlParamCapture;

import Cookies from "js-cookie";

interface UrlParam {
  key: string;
  value: string;
  timestamp?: number;
}

/**
 * Constructs _fbc cookie value from fbclid
 * Format: fb.1.{timestamp}.{fbclid}
 */
export const constructFbc = (fbclid: string): string => {
  const timestamp = Date.now();
  return `fb.1.${timestamp}.${fbclid}`;
};

/**
 * Constructs _fbp cookie value if it doesn't exist
 * Format: fb.1.{timestamp}.{random_number}
 */
export const constructFbp = (): string => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1e16);
  return `fb.1.${timestamp}.${randomNumber}`;
};

/**
 * Sets Meta cookies with proper expiration (90 days)
 */
export const setMetaCookies = (fbclid?: string) => {
  const cookieOptions = {
    expires: 90, // 90 days
    secure: true,
    sameSite: "Lax" as const,
    domain: window.location.hostname.startsWith("www.")
      ? window.location.hostname.substring(4)
      : window.location.hostname,
  };

  // Handle _fbc cookie if fbclid is present
  if (fbclid) {
    const existingFbc = Cookies.get("_fbc");
    if (!existingFbc) {
      const fbcValue = constructFbc(fbclid);
      Cookies.set("_fbc", fbcValue, cookieOptions);
    }
  }

  // Always ensure _fbp exists
  const existingFbp = Cookies.get("_fbp");
  if (!existingFbp) {
    const fbpValue = constructFbp();
    Cookies.set("_fbp", fbpValue, cookieOptions);
  }
};

/**
 * Merges new URL params with existing ones from localStorage
 * If key exists, updates the value; otherwise adds new param
 */
export const mergeUrlParams = (
  existingParams: UrlParam[],
  newParams: UrlParam[]
): UrlParam[] => {
  const merged = [...existingParams];

  newParams.forEach((newParam) => {
    const existingIndex = merged.findIndex((p) => p.key === newParam.key);
    if (existingIndex >= 0) {
      // Update existing param with new value and timestamp
      merged[existingIndex] = {
        ...newParam,
        timestamp: Date.now(),
      };
    } else {
      // Add new param
      merged.push({
        ...newParam,
        timestamp: Date.now(),
      });
    }
  });

  return merged;
};

/**
 * Extracts and processes URL parameters
 */
export const extractUrlParams = (searchParams: URLSearchParams): UrlParam[] => {
  const params: UrlParam[] = [];

  searchParams.forEach((value, key) => {
    params.push({
      key,
      value,
      timestamp: Date.now(),
    });
  });

  return params;
};

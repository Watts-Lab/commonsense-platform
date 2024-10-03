import React, { createContext, useContext, useEffect, useState } from "react";
import Backend from "../apis/backend";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface User {
  email: string;
  token: string;
}

interface SessionContextProps {
  state: {
    sessionId: string;
    user: User | null;
    loading: boolean;
    urlParams: { key: string; value: string }[];
  };
  actions: {
    setSessionId: React.Dispatch<React.SetStateAction<string>>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string) => Promise<void>;
    setUrlParams: React.Dispatch<
      React.SetStateAction<{ key: string; value: string }[]>
    >;
  };
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [sessionId, setSessionIdState] = useState<string>(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    return storedSessionId || "";
  });

  const [user, setUserState] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(true);

  const [urlParams, setUrlParams] = useState<{ key: string; value: string }[]>(
    []
  );

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // for removing url params
  const [searchParamsNew, setSearchParamsNew] = useSearchParams();

  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId === "") {
        try {
          const sessionResponse = await Backend.get("/", {
            withCredentials: true,
          });
          const incomingSessionId = sessionResponse.data;
          setSessionId(incomingSessionId);

          // Optionally fetch user data if needed
        } catch (error) {
          console.error("Error fetching sessionId:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Optionally fetch user data if needed
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    // scroll to top on route change
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.style.scrollBehavior = "auto";
      window.scroll({ top: 0 });
      htmlElement.style.scrollBehavior = "";
    }

    // Get the current URL parameters
    const currentParams = searchParams.entries();
    const URLParams = [...currentParams].map(([key, value]) => ({
      key,
      value,
    }));

    if (location.pathname.startsWith("/s/")) {
      const shareLink = location.pathname.substring(3);
      URLParams.push({ key: "shareLink", value: shareLink });
    }

    // Dispatch the updated parameters
    if (URLParams.length > 0) {
      setUrlParams(urlParams);
      setSearchParamsNew("");
    }
  }, [location.pathname]);

  const setSessionId: React.Dispatch<React.SetStateAction<string>> = (
    value
  ) => {
    setSessionIdState(value);

    const newSessionId =
      typeof value === "function"
        ? (value as (prevState: string) => string)(sessionId)
        : value;

    if (newSessionId !== "") {
      localStorage.setItem("sessionId", newSessionId);
    } else {
      localStorage.removeItem("sessionId");
    }
  };

  const setUser: React.Dispatch<React.SetStateAction<User | null>> = (
    value
  ) => {
    setUserState(value);
    localStorage.setItem("user", JSON.stringify(value));
  };

  const signIn = async (email: string, magicLink: string) => {
    try {
      const response = await Backend.post(
        "/users/enter",
        { email, magicLink },
        { withCredentials: true }
      );

      if (response.data.token) {
        setSessionId(response.data.sessionId);
        setUser({ email, token: response.data.token });
        navigate("/dashboard");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  useEffect(() => {
    const verify_token = async () => {
      if (user === null) return;
      try {
        Backend.defaults.headers.common["Authorization"] = user.token;
        const response = await Backend.post(`/users/verify`);
        if (response.data.ok) {
          setUser({ email: user.email, token: user.token });
        } else {
          setUser(null);
        }
      } catch (error) {}
    };
    verify_token();
  }, []);

  const signUp = async (email: string) => {
    try {
      const response = await Backend.post("/users/enter", { email, sessionId });
      const newSessionId = response.data.sessionId || sessionId;
      const userData = response.data.user;
      setSessionId(newSessionId);
      setUser(userData);
    } catch (error) {
      console.error("Error during sign-up:", error);
    }
  };

  // Listen for changes to localStorage (e.g., from other tabs)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "sessionId") {
        if (event.newValue) {
          setSessionIdState(event.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        state: {
          user,
          sessionId,
          urlParams,
          loading,
        },
        actions: {
          setSessionId,
          setUser,
          signUp,
          signIn,
          setUrlParams,
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

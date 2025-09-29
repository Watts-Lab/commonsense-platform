import React, { createContext, useContext, useEffect, useState } from "react";
import Backend from "../apis/backend";
import { useNavigate } from "react-router-dom";

interface User {
  email: string;
  token: string;
}

interface UrlParam {
  key: string;
  value: string;
  timestamp?: number;
}

interface SessionContextProps {
  state: {
    sessionId: string;
    user: User | null;
    loading: boolean;
    urlParams: UrlParam[];
  };
  actions: {
    setSessionId: React.Dispatch<React.SetStateAction<string>>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    signIn: (email: string, magicLink?: string) => Promise<void>;
    signUp: (email: string) => Promise<void>;
    captureUrlParams: (params: { key: string; value: string }[]) => void;
  };
}

interface SessionProviderProps {
  children: React.ReactNode;
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

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [sessionId, setSessionIdState] = useState<string>(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    return storedSessionId === "undefined" ? "" : storedSessionId || "";
  });

  const [user, setUserState] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [loading, setLoading] = useState(true);

  const [urlParams, setUrlParamsState] = useState<UrlParam[]>(() => {
    const storedParams = localStorage.getItem("urlParams");
    if (!storedParams || storedParams === "undefined") return [];
    try {
      return JSON.parse(storedParams);
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  const captureUrlParams = (newParams: { key: string; value: string }[]) => {
    setUrlParamsState((prevParams) => {
      const merged = [...prevParams];

      newParams.forEach((newParam) => {
        const existingIndex = merged.findIndex((p) => p.key === newParam.key);
        if (existingIndex >= 0) {
          merged[existingIndex] = {
            ...newParam,
            timestamp: Date.now(),
          };
        } else {
          merged.push({
            ...newParam,
            timestamp: Date.now(),
          });
        }
      });

      localStorage.setItem("urlParams", JSON.stringify(merged));

      console.log("URL params captured and saved:", merged);

      return merged;
    });
  };

  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId === "") {
        try {
          const sessionResponse = await Backend.get("/", {
            withCredentials: true,
          });
          const incomingSessionId = sessionResponse.data;
          setSessionId(incomingSessionId);
        } catch (error) {
          console.error("Error fetching sessionId:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeSession();
  }, [sessionId]);

  const setSessionId: React.Dispatch<React.SetStateAction<string>> = (
    value
  ) => {
    setSessionIdState(value);
    const newSessionId = typeof value === "function" ? value(sessionId) : value;

    if (newSessionId !== "") {
      localStorage.setItem("sessionId", newSessionId);
    } else {
      localStorage.removeItem("sessionId");
    }
  };

  const setUser: React.Dispatch<React.SetStateAction<User | null>> = (
    value
  ) => {
    const newUser = typeof value === "function" ? value(user) : value;
    setUserState(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const signIn = async (email: string, magicLink?: string) => {
    try {
      const response = await Backend.post(
        "/users/enter",
        { email, magicLink, sessionId },
        { withCredentials: true }
      );

      if (magicLink) {
        if (response.data.token) {
          setSessionId(response.data.sessionId);
          setUser({ email, token: response.data.token });
          setTimeout(() => navigate("/dashboard"), 1000);
        } else {
          alert(response.data.message);
        }
      } else if (!response.data.ok) {
        console.error("Error during sign-in:", response.data.message);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const signUp = async (email: string) => {
    try {
      const response = await Backend.post("/users/enter", { email, sessionId });
      setSessionId(response.data.sessionId || sessionId);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error during sign-up:", error);
    }
  };

  useEffect(() => {
    if (user) {
      Backend.defaults.headers.common["Authorization"] = user.token;
      Backend.post("/users/verify").catch(() => setUser(null));
    }
  }, [user]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "sessionId" && event.newValue) {
        setSessionIdState(event.newValue);
      } else if (event.key === "urlParams" && event.newValue) {
        try {
          setUrlParamsState(JSON.parse(event.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        state: { user, sessionId, urlParams, loading },
        actions: { setSessionId, setUser, signUp, signIn, captureUrlParams },
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { verifyToken } from "../utils/verifyToken";
import api from "../api/axiosInstance";

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: UserPayload | null;
  isAuthenticated: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Use a ref so interceptors always have access to the latest token
  // without needing to re-register on every token change.
  const tokenRef = useRef<string | null>(token);

  const updateAuthState = useCallback((newToken: string | null) => {
    const { isValid, user: userData } = verifyToken(newToken);

    if (isValid && newToken && userData) {
      tokenRef.current = newToken;
      setToken(newToken);
      setUser(userData as UserPayload);
      setIsAuthenticated(true);
      localStorage.setItem("authToken", newToken);
    } else {
      tokenRef.current = null;
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout API errors — always clear local state
    } finally {
      updateAuthState(null);
    }
  }, [updateAuthState]);

  // Expose a stable refreshToken function for manual use
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api.post("/auth/refresh");
      updateAuthState(res.data.accessToken);
      return true;
    } catch {
      await logout();
      return false;
    }
  }, [updateAuthState, logout]);

  // Run ONCE on mount: verify the stored token and set up interceptors.
  // Interceptors are registered only once, using tokenRef to avoid stale closures.
  useEffect(() => {
    // Verify stored token on initial load
    updateAuthState(token);
    setLoading(false);

    // Track in-flight refresh to prevent duplicate 401 refresh calls
    let isRefreshing = false;
    let pendingRequests: Array<(newToken: string) => void> = [];

    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (tokenRef.current && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${tokenRef.current}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true;

          if (isRefreshing) {
            // Queue requests that come in while a refresh is already in progress
            return new Promise((resolve) => {
              pendingRequests.push((newToken: string) => {
                prevRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(api(prevRequest));
              });
            });
          }

          isRefreshing = true;

          try {
            const res = await api.post("/auth/refresh");
            const newAccessToken = res.data.accessToken;
            updateAuthState(newAccessToken);

            // Retry all queued requests with the new token
            pendingRequests.forEach((cb) => cb(newAccessToken));
            pendingRequests = [];

            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(prevRequest);
          } catch (refreshErr) {
            pendingRequests = [];
            await logout();
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps: interceptors register once, tokenRef keeps them current

  const loginWithCredentials = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      updateAuthState(res.data.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token, user, isAuthenticated,
        loginWithCredentials, logout, refreshToken,
        error, loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
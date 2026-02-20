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
  loginWithCredentials: (email: string, password: string) => Promise<UserPayload>; // ← returns UserPayload
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

  useEffect(() => {
    updateAuthState(token);
    setLoading(false);

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
  }, []);

  // Returns the user object directly so callers don't depend on React state timing
  const loginWithCredentials = async (email: string, password: string): Promise<UserPayload> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      updateAuthState(res.data.accessToken);
      return res.data.user; // ← returned directly, not read from state
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
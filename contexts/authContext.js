"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

function normalizeUser(user) {
  if (!user) return null;

  const id = user._id ?? user.id;
  return id ? { ...user, id: String(id), _id: String(id) } : user;
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const authVersion = useRef(0);

  const router = useRouter();

  const setUser = useCallback((nextUser) => {
    authVersion.current += 1;
    setUserState((previous) =>
      normalizeUser(
        typeof nextUser === "function" ? nextUser(previous) : nextUser
      )
    );
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const version = ++authVersion.current;

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();
      if (authVersion.current !== version) return;

      if (!res.ok) {
        if ([401, 403, 404].includes(res.status)) {
          setUser(null);
          return;
        }
        throw new Error("Failed to refresh user");
      }

      setUser(data.success && data.user ? data.user : null);
    } catch (err) {
      if (authVersion.current === version) {
        console.error("Error fetching user:", err);
      }
    } finally {
      if (authVersion.current === version) setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    refreshUser();
    return () => {
      authVersion.current += 1;
    };
  }, [refreshUser]);

  // logout function
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser(null);
        toast.success("با موفقیت خارج شدید");
        router.push("/auth");
      } else {
        toast.error("خطا در خروج از حساب");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("خطایی رخ داد");
    }
  };

  const value = {
    user,
    setUser,
    loading,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

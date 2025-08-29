// src/auth/AuthProvider.tsx
// Central place for auth state: { user, token, loading } + actions.
// Stores token (and last-known user) in SecureStore so session survives app restarts.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../api/client";
import { loginRequest, signupRequest, MeUser, LoginInput, SignupInput } from "../api/auth";

// Where we store secrets on device (Android Keystore under the hood)
const KEY_TOKEN = "auth_token";
const KEY_USER = "auth_user_json";

type AuthContextType = {
  user: MeUser | null;
  token: string | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [token, _setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync token to both state and the API client module (so all requests include the header)
  const setToken = useCallback((t: string | null) => {
    _setToken(t);
    setAuthToken(t);
  }, []);

  // On first mount, restore session from SecureStore
  useEffect(() => {
    (async () => {
      try {
        const [t, ujson] = await Promise.all([
          SecureStore.getItemAsync(KEY_TOKEN),
          SecureStore.getItemAsync(KEY_USER),
        ]);
        if (t) {
          setToken(t); // push into client header pipeline
          if (ujson) setUser(JSON.parse(ujson));
          // Optional: soft-verify token by calling a cheap authed endpoint later
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [setToken]);

  const login = useCallback(async (input: LoginInput) => {
    const res = await loginRequest(input);
    // Backend should return { token, user }
    setToken(res.token);
    setUser(res.user);
    await SecureStore.setItemAsync(KEY_TOKEN, res.token);
    await SecureStore.setItemAsync(KEY_USER, JSON.stringify(res.user));
  }, [setToken]);

  const signup = useCallback(async (input: SignupInput) => {
    const res = await signupRequest(input);
    // We decided to return token on signup for now
    setToken(res.token);
    setUser(res.user);
    await SecureStore.setItemAsync(KEY_TOKEN, res.token);
    await SecureStore.setItemAsync(KEY_USER, JSON.stringify(res.user));
  }, [setToken]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync(KEY_TOKEN);
    await SecureStore.deleteItemAsync(KEY_USER);
  }, [setToken]);

  const value: AuthContextType = { user, token, loading, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

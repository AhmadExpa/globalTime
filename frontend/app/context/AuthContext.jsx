'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    async function load() {
      if (!token) { setUser(null); return; }
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      } catch {
        setToken(null);
        if (typeof window !== 'undefined') localStorage.removeItem('authToken');
      }
    }
    load();
  }, [token]);

  async function login(email, password) {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`, { email, password });
    if (data?.token) {
      setToken(data.token);
      if (typeof window !== 'undefined') localStorage.setItem('authToken', data.token);
      return true;
    }
    return false;
  }

  async function register(email, password) {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`, { email, password });
    return !!data?.success;
  }

  function logout() {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem('authToken');
  }

  async function requestUpgrade() {
    if (!token) return false;
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/user/upgrade-request`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return !!data?.success;
  }

  async function savePreferences(preferredClockType, preferredTheme) {
    if (!token) return false;
    const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/api/user/preferences`, { preferredClockType, preferredTheme }, { headers: { Authorization: `Bearer ${token}` } });
    return !!data?.success;
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, requestUpgrade, savePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutes in milliseconds

const AuthContext = createContext(null);

// Verify a token is still valid on the backend
async function verifyToken(token, role) {
  try {
    const endpoint = role === 'super' ? '/super/profile' : '/dealer/profile';
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [dealer, setDealer] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gm-dealer')) || null; } catch { return null; }
  });
  const [superAdmin, setSuperAdmin] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gm-super')) || null; } catch { return null; }
  });
  const [checking, setChecking] = useState(true);

  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef(null);

  // ── Logout functions ─────────────────────────────────────────
  const dealerLogout = useCallback(() => {
    setDealer(null);
    sessionStorage.removeItem('gm-dealer');
  }, []);

  const superLogout = useCallback(() => {
    setSuperAdmin(null);
    sessionStorage.removeItem('gm-super');
  }, []);

  // ── Activity tracker ─────────────────────────────────────────
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Listen for any user activity and reset the inactivity clock
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetActivity));
  }, [resetActivity]);

  // ── Inactivity check (runs every 30 seconds) ─────────────────
  useEffect(() => {
    const isLoggedIn = () => !!(dealer?.token || superAdmin?.token);

    const checkInactivity = () => {
      if (!isLoggedIn()) return;
      const msInactive = Date.now() - lastActivityRef.current;
      if (msInactive >= INACTIVITY_LIMIT) {
        dealerLogout();
        superLogout();
      }
    };

    inactivityTimerRef.current = setInterval(checkInactivity, 30_000);
    return () => clearInterval(inactivityTimerRef.current);
  }, [dealer, superAdmin, dealerLogout, superLogout]);

  // ── Verify stored tokens on app startup ──────────────────────
  useEffect(() => {
    async function check() {
      if (dealer?.token) {
        const valid = await verifyToken(dealer.token, 'dealer');
        if (!valid) {
          setDealer(null);
          sessionStorage.removeItem('gm-dealer');
        }
      }
      if (superAdmin?.token) {
        const valid = await verifyToken(superAdmin.token, 'super');
        if (!valid) {
          setSuperAdmin(null);
          sessionStorage.removeItem('gm-super');
        }
      }
      setChecking(false);
    }
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login functions ──────────────────────────────────────────
  const dealerLogin = (data) => {
    const payload = { ...data.user, token: data.token };
    setDealer(payload);
    sessionStorage.setItem('gm-dealer', JSON.stringify(payload));
    lastActivityRef.current = Date.now();
  };

  const superLogin = (data) => {
    const payload = { ...data.user, token: data.token };
    setSuperAdmin(payload);
    sessionStorage.setItem('gm-super', JSON.stringify(payload));
    lastActivityRef.current = Date.now();
  };

  // Don't render until token verification is complete
  if (checking) return null;

  return (
    <AuthContext.Provider value={{ dealer, superAdmin, dealerLogin, dealerLogout, superLogin, superLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
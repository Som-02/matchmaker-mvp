import { createContext, useContext, useState } from "react";

// Demo credentials for the assignment reviewer.
// In a production build this would be replaced with real auth (JWT / Firebase Auth / etc).
export const DEMO_CREDENTIALS = {
  username: "matchmaker",
  password: "tdc2026",
  displayName: "Anjali Rao",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("tdc_matchmaker_session");
    return stored ? JSON.parse(stored) : null;
  });

  function login(username, password) {
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      const session = { username, displayName: DEMO_CREDENTIALS.displayName };
      sessionStorage.setItem("tdc_matchmaker_session", JSON.stringify(session));
      setUser(session);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem("tdc_matchmaker_session");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

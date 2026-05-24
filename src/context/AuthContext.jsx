import { createContext, useContext, useState, useEffect } from "react";
import { onAuthChange, getUserProfile } from "../firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [profile, setProfile] = useState(null); // Firestore user doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const isAdmin = profile?.role === "admin";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isLoggedIn }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
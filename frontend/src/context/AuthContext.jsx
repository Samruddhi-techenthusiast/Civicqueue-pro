import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.log("Invalid user in localStorage. Clearing...");
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

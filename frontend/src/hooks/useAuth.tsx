import { AuthContext } from "contexts/AuthContext";
import { useContext } from "react";

export const useAuth = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  return { user, isAuthenticated };
};
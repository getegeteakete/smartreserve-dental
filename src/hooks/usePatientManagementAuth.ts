
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdminAuth } from "@/utils/adminAuth";

export const usePatientManagementAuth = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (checkAdminAuth(navigate)) {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login");
  };

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  return {
    loading,
    handleLogout,
    handleBackToAdmin,
  };
};

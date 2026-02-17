import { createContext, useEffect, useState, useCallback } from "react";
import { login as loginApi } from "../services/PostsApi";
import axiosInstance, { registerUser } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Single function to check authentication
  const checkAuth = useCallback(async () => {
    try {
      // console.log(" Checking authentication...");
      
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      
      // console.log("Access token exists:", !!access);
      // console.log("Refresh token exists:", !!refresh);
      
      if (!access || !refresh) {
        console.log("❌ No tokens found");
        setIsLoggedIn(false);
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }
      
      // Try to fetch user to verify token is valid
      try {
        // console.log(" Verifying token by fetching user...");
        const res = await axiosInstance.get("/current_user/");
        // console.log("✅ Token is valid, user:", res.data.username);
        
        setUser(res.data);
        setIsLoggedIn(true);
      } catch (error) {
        // console.log(" Token verification failed:", error.response?.status || error.message);
        
        // If token is invalid, try to refresh it
        if (error.response?.status === 401) {
          console.log("🔄 Attempting token refresh...");
          try {
            const refreshResponse = await axiosInstance.post("/token/refresh/", {
              refresh: refresh
            });
            
            if (refreshResponse.data.access) {
              localStorage.setItem("access", refreshResponse.data.access);
              // console.log("Token refreshed successfully");
              
              // Fetch user with new token
              const userRes = await axiosInstance.get("/current_user/");
              setUser(userRes.data);
              setIsLoggedIn(true);
            }
          } catch (refreshError) {
            // console.log("Token refresh failed, logging out");
            logout();
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      // console.error("Auth check error:", error);
      logout();
    } finally {
      setAuthChecked(true);
      setLoading(false);
      // console.log("✅ Auth check completed");
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchUser = async () => {
    try {
      // console.log("Fetching user data...");
      const res = await axiosInstance.get("/current_user/");
      // console.log("User data fetched:", res.data);
      setUser(res.data);
      setIsLoggedIn(true);
      return res.data;
    } catch (error) {
      // console.error("Failed to fetch user:", error);
      
      if (error.response?.status === 401) {
        try {
          const refresh = localStorage.getItem("refresh");
          if (refresh) {
            const refreshRes = await axiosInstance.post("/token/refresh/", { refresh });
            localStorage.setItem("access", refreshRes.data.access);
            
            const userRes = await axiosInstance.get("/current_user/");
            setUser(userRes.data);
            setIsLoggedIn(true);
            return userRes.data;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        logout();
      }
      throw error;
    }
  };

  // ✅ FIXED: Refresh user data function
  const refreshUser = useCallback(async () => {
    try {
      // console.log(" Refreshing user data...");
      const res = await axiosInstance.get("/current_user/");
      // console.log("✅ User data refreshed:", res.data);
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error(" Failed to refresh user:", error);
      throw error;
    }
  }, []);

  const register = async (formData) => {
    try {
      console.log("Registering user...");
      const data = await registerUser(formData);
      console.log("Registration response:", data);
      
      if (data.access && data.refresh) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        
        console.log("Tokens saved");
        setIsLoggedIn(true);
        
        if (data.user) {
          setUser(data.user);
        } else {
          await fetchUser();
        }
        
        return data;
      } else {
        throw new Error("No tokens received from server");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      // console.log("Logging in...");
      const data = await loginApi(usernameOrEmail, password);
      
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      
      // console.log("Login successful, tokens saved");
      setIsLoggedIn(true);
      await fetchUser();
      
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const res = await axiosInstance.post("/google-login/", {
        token: googleToken,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setIsLoggedIn(true);
      await fetchUser();
    } catch (error) {
      console.error("Google login failed: ", error);
      throw error;
    }
  };

  const delete_account = async (password) => {
    try {
      setLoading(true);
      await axiosInstance.post("/delete-account/", {
        password: password,
      });
      logout();
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setUser(null);
    setAuthChecked(true);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading authentication...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      googleLogin, 
      logout, 
      isLoggedIn, 
      register,
      loading,
      authChecked,
      delete_account,
      refreshUser,  
      fetchUser     
    }}>
      {children}
    </AuthContext.Provider>
  );
};
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  // Create axios instance - will be updated when token changes
  const [api, setApi] = useState(() => {
    const instance = axios.create({
      baseURL: "/api",
    });
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    return instance;
  });

  // Update axios headers whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token, api]);

  // Check if user is logged in on mount and validate token
  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      const storedProfile = localStorage.getItem("selectedProfile");

      if (storedToken && storedUser) {
        try {
          // Set token in headers first
          api.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;

          // Verify token is still valid by checking verify endpoint
          await api.get("/auth/verify");

          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          if (storedProfile) {
            setSelectedProfile(JSON.parse(storedProfile));
          }
        } catch (error) {
          // Token is invalid or expired - clear everything
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          localStorage.removeItem("selectedProfile");
          console.log("Session expired or invalid, cleared auth data");
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const register = async (name, email, password) => {
    try {
      console.log("📝 Attempting to register:", { name, email });
      console.log("Making request to: /api/auth/register (proxied by Vite)");

      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("✓ Registration successful:", response.data);

      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("authToken", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setProfiles([]);

      return { success: true };
    } catch (error) {
      console.error("❌ Registration error:");
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message);
      console.error("Full error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting to login:", { email });

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("✓ Login successful:", response.data);

      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("authToken", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setProfiles(newUser.profiles || []);

      return { success: true };
    } catch (error) {
      console.error("❌ Login error:");
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message);
      console.error("Full error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const createProfile = async (name, avatar) => {
    try {
      const response = await api.post("/profiles", {
        name,
        avatar,
      });

      const newProfile = response.data.profile;
      const updatedProfiles = [...profiles, newProfile];

      setProfiles(updatedProfiles);
      setUser({
        ...user,
        profiles: updatedProfiles,
      });

      return { success: true, profile: newProfile };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create profile",
      };
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      await api.delete(`/profiles/${profileId}`);

      const updatedProfiles = profiles.filter((p) => p._id !== profileId);
      setProfiles(updatedProfiles);
      setUser({
        ...user,
        profiles: updatedProfiles,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete profile",
      };
    }
  };

  const selectProfile = (profile) => {
    setSelectedProfile(profile);
    localStorage.setItem("selectedProfile", JSON.stringify(profile));
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");

    setToken(null);
    setUser(null);
    setProfiles([]);
    setSelectedProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profiles,
        selectedProfile,
        loading,
        token,
        register,
        login,
        logout,
        createProfile,
        deleteProfile,
        selectProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

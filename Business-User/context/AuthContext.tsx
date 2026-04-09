import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { socketService } from "@/api/socket.service";

type Role = "INDIVIDUAL" | "BUSINESS" | "DRIVER" | "ADMIN" | null;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  businessProfile?: { logoUrl?: string } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: Role;
  isBusiness: boolean;
  isIndividual: boolean;
  setAuthData: (token: string, user: AuthUser) => Promise<void>;
  clearAuthData: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  continueAsGuest: () => void;
  isGuest: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  console.log("🔐 Auth state:", { user, isAuthenticated, isLoading, isGuest });


  const continueAsGuest = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setUser(null);
  };

useEffect(() => {
  const loadFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        socketService.connect(parsedUser.id);
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };
  loadFromStorage();
}, []);
  const setAuthData = useCallback(
    async (newToken: string, newUser: AuthUser) => {
      await AsyncStorage.setItem("token", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setToken(newToken);
      setIsAuthenticated(true);
      setUser(newUser);
      socketService.connect(newUser.id)
    },
    [],
  );

  const clearAuthData = useCallback(async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(false);
  }, []);

  // Fetch fresh data from API and sync to storage + state
  const refreshUser = useCallback(async () => {
    try {
      const { UserService } = await import("../api/user.service");
      const freshUser = await UserService.getMe();
      await AsyncStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

 const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
  setUser((prev) => {
    if (!prev) return prev;
    const updated = {
      ...prev,
      ...updates,
      businessProfile: updates.businessProfile
        ? { ...prev.businessProfile, ...updates.businessProfile }
        : prev.businessProfile,
    };
    AsyncStorage.setItem('user', JSON.stringify(updated));
    return updated;
  });
}, []);



  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        role: user?.role ?? null,
        isBusiness: user?.role === "BUSINESS",
        isIndividual: user?.role === "INDIVIDUAL",
        setAuthData,
        clearAuthData,
        refreshUser,
        updateUser,
        continueAsGuest,
        isGuest,
        signOut: clearAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

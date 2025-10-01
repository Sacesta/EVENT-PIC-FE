import { useContext, createContext } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  supplierDetails?: {
    companyName: string;
    categories: string[];
  };
  producerDetails?: {
    companyName: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoadingUser: boolean;
  setUser: (user: User | null) => void;
  setIsLoadingUser: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = AuthContext.Provider;
export type { User };

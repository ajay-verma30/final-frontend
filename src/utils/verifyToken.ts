import { jwtDecode } from "jwt-decode";

// Token ke payload ka structure define karo
interface UserPayload {
  id: number;
  email: string;
  role: string;
  org_id: number;
  exp: number;
}

interface VerificationResult {
  isValid: boolean;
  user: UserPayload | null;
}

export const verifyToken = (token?: string | null): VerificationResult => {
  if (!token || typeof token !== "string") {
    return { isValid: false, user: null };
  }

  try {
    const decoded = jwtDecode<UserPayload>(token);
    const now = Date.now() / 1000;

    if (decoded.exp > now) {
      return { isValid: true, user: decoded }; 
    }
    
    return { isValid: false, user: null }; 
  } catch {
    return { isValid: false, user: null }; 
  }
};
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  // Check if user is authenticated
  const token = localStorage.getItem("authToken");
  const expiry = localStorage.getItem("tokenExpiry");
  
  // Check if token exists and hasn't expired
  const isAuthenticated = token && expiry && Date.now() < parseInt(expiry);
  
  console.log("Auth check:", { token, expiry, isAuthenticated, now: Date.now() });
  
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    // Redirect to login page if not authenticated
    return <Navigate to="/admin/login" replace />;
  }
  
  console.log("Authenticated, rendering children");
  // Render children if authenticated
  return <>{children}</>;
}

export default PrivateRoute;
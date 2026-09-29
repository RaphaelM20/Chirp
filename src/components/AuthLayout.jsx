import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Logo } from "./Icons";

function AuthLayout() {
  const { isGuest } = useAuth();
  const location = useLocation();

  // Once someone logs in or signs up, send them back to where they were.
  if (!isGuest) return <Navigate to={location.state?.from || "/"} replace />;

  return (
    <div className="auth-page">
      <main className="auth-card">
        <Link to="/" className="auth-logo" aria-label="Chirp home">
          <Logo size={44} />
        </Link>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;

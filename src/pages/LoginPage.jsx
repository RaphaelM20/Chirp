import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import PasswordField from "../components/PasswordField";

function LoginPage() {
  useDocumentTitle("Log in");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      // AuthLayout redirects once a member session starts; logging in with
      // the guest account keeps the guest session, so leave manually.
      const kind = await login(username.trim(), password);
      if (kind === "guest") navigate(location.state?.from || "/");
    } catch (err) {
      setError(
        err.status === 401 ? "Incorrect username or password." : err.message,
      );
      setPending(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Log in to Chirp</h1>
      <p className="auth-subtitle">
        Don't have an account?{" "}
        <Link to="/signup" state={location.state}>
          Sign up
        </Link>
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleLogin} className="form" noValidate>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
          />
        </div>
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={pending || !username.trim() || !password}
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="btn btn-outline btn-block btn-lg"
        onClick={() => navigate(location.state?.from || "/")}
      >
        Continue as guest
      </button>
    </>
  );
}

export default LoginPage;

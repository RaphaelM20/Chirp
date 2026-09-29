import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fieldErrors } from "../lib/api";
import { useAuth } from "../lib/auth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import PasswordField from "../components/PasswordField";

const EMPTY = { name: "", email: "", username: "", password: "", confirmPass: "" };

// Mirrors the API's signup validation so most mistakes are caught before a
// round trip.
function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > 50) {
    errors.name = "Keep it under 50 characters.";
  } else if (!/^\p{L}[\p{L} .'-]*$/u.test(name)) {
    errors.name = "Use letters, spaces, hyphens and apostrophes.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  const username = values.username.trim();
  if (!/^[A-Za-z0-9]+$/.test(username)) {
    errors.username = "Use letters and numbers only.";
  } else if (username.length < 4 || username.length > 20) {
    errors.username = "Must be 4 to 20 characters.";
  }
  if (values.password.length < 6 || values.password.length > 20) {
    errors.password = "Must be 6 to 20 characters.";
  }
  if (values.confirmPass !== values.password) {
    errors.confirmPass = "Passwords don't match.";
  }
  return errors;
}

function TextField({ id, label, value, onChange, error, hint, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        required
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function SignupPage() {
  useDocumentTitle("Sign up");
  const { signup } = useAuth();
  const location = useLocation();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const setField = (field) => (value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setPending(true);
    try {
      // AuthLayout redirects once the new session starts.
      await signup({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        username: values.username.trim(),
      });
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) setFormError(err.message);
      setPending(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">
        Already have an account?{" "}
        <Link to="/login" state={location.state}>
          Log in
        </Link>
      </p>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <form onSubmit={handleSignup} className="form" noValidate>
        <TextField
          id="name"
          label="Name"
          value={values.name}
          onChange={setField("name")}
          error={errors.name}
          autoComplete="name"
          autoFocus
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={setField("email")}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="username"
          label="Username"
          value={values.username}
          onChange={setField("username")}
          error={errors.username}
          hint="4–20 letters and numbers. This is your @handle."
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
        />
        <PasswordField
          id="password"
          label="Password"
          value={values.password}
          onChange={setField("password")}
          error={errors.password}
          hint="6–20 characters."
          autoComplete="new-password"
        />
        <PasswordField
          id="confirmPass"
          label="Confirm password"
          value={values.confirmPass}
          onChange={setField("confirmPass")}
          error={errors.confirmPass}
          autoComplete="new-password"
        />
        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={pending}
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </>
  );
}

export default SignupPage;

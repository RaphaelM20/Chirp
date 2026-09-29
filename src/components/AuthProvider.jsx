import { useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../lib/auth";
import { api, getToken, onUnauthorized, storeToken } from "../lib/api";
import { useToast } from "../lib/toast";
import SplashScreen from "./SplashScreen";
import SignupPrompt from "./SignupPrompt";

// Every API read requires a JWT, so anonymous visitors browse through the
// shared guest account. Guests can look around but are asked to sign up
// before any write.
const GUEST_CREDENTIALS = { username: "guest", password: "guest123" };
const SESSION_KIND_KEY = "authSession";

function readStoredSession() {
  const token = getToken();
  if (!token) return { token: null, kind: null, user: null };
  try {
    const { exp } = jwtDecode(token);
    if (exp && exp * 1000 <= Date.now()) throw new Error("expired");
  } catch {
    storeToken(null);
    return { token: null, kind: null, user: null };
  }
  return {
    token,
    kind: localStorage.getItem(SESSION_KIND_KEY) || "user",
    user: null,
  };
}

function persistSession(token, kind) {
  storeToken(token);
  if (kind) {
    localStorage.setItem(SESSION_KIND_KEY, kind);
  } else {
    localStorage.removeItem(SESSION_KIND_KEY);
  }
}

// Older API versions omit the id from /user/me, so fall back to the token.
async function loadSession(token, kind) {
  persistSession(token, kind);
  const me = await api.me();
  return { token, kind, user: { ...me, id: me.id ?? Number(jwtDecode(token).id) } };
}

function AuthProvider({ children }) {
  const toast = useToast();
  const [session, setSession] = useState(readStoredSession);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [promptAction, setPromptAction] = useState(null);

  const { token, kind, user } = session;
  const needsUser = user === null;

  useEffect(() => {
    if (!needsUser) return;
    let cancelled = false;

    const load = token
      ? loadSession(token, kind)
      : api
          .login(GUEST_CREDENTIALS.username, GUEST_CREDENTIALS.password)
          .then((data) => loadSession(data.token, "guest"));

    load
      .then((next) => {
        if (!cancelled) setSession(next);
      })
      .catch((err) => {
        // A 401 on a stored token triggers the unauthorized handler, which
        // clears the session and falls back to a guest session.
        if (!cancelled && (err.status !== 401 || !token)) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [token, kind, needsUser, attempt]);

  const logout = useCallback(() => {
    persistSession(null, null);
    setError(null);
    setSession({ token: null, kind: null, user: null });
  }, []);

  useEffect(
    () =>
      onUnauthorized(() => {
        if (localStorage.getItem(SESSION_KIND_KEY) === "user") {
          toast.info("Your session expired. Please log in again.");
        }
        logout();
      }),
    [logout, toast],
  );

  const signIn = useCallback(async (newToken) => {
    if (!newToken) throw new Error("Login failed. Please try again.");
    const next = await loadSession(newToken, "user");
    if (next.user.username === GUEST_CREDENTIALS.username) {
      next.kind = "guest";
      persistSession(newToken, "guest");
    }
    setSession(next);
    return next.kind;
  }, []);

  const value = useMemo(() => {
    const isGuest =
      kind === "guest" || user?.username === GUEST_CREDENTIALS.username;
    return {
      token,
      user,
      isGuest,
      login: async (username, password) =>
        signIn((await api.login(username, password))?.token),
      signup: async (fields) => signIn((await api.signup(fields))?.token),
      logout,
      // Returns true when the current visitor may perform a write. Guests
      // get the sign-up prompt instead.
      requireAccount: (action) => {
        if (!isGuest) return true;
        setPromptAction(action);
        return false;
      },
      isFollowing: (userId) =>
        Boolean(user?.following?.some((f) => f.followingId === userId)),
      followsYou: (userId) =>
        Boolean(user?.followers?.some((f) => f.followerId === userId)),
      setFollowing: (userId, following) =>
        setSession((s) => {
          const rest = s.user.following.filter((f) => f.followingId !== userId);
          return {
            ...s,
            user: {
              ...s.user,
              following: following ? [...rest, { followingId: userId }] : rest,
            },
          };
        }),
      updateUser: (fields) =>
        setSession((s) => ({ ...s, user: { ...s.user, ...fields } })),
    };
  }, [token, kind, user, logout, signIn]);

  if (!user) {
    return (
      <SplashScreen
        error={error}
        onRetry={() => {
          setError(null);
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {promptAction && (
        <SignupPrompt
          action={promptAction}
          onClose={() => setPromptAction(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

import { useCallback, useEffect, useState } from "react";
import { request } from "../lib/api";
import { useAuth } from "../lib/auth";

// Loads `path` for the current session. Loading state is derived from
// whether the stored result belongs to the current request key, so a new
// path, a new session or a retry shows the loading state again.
function useApi(path) {
  const { token } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, data: undefined, error: null });
  const key = `${token}|${path}|${attempt}`;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    request(path).then(
      (data) => !cancelled && setResult({ key, data, error: null }),
      (error) => !cancelled && setResult({ key, data: undefined, error }),
    );
    return () => {
      cancelled = true;
    };
  }, [key, path]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback(
    (updater) =>
      setResult((r) => ({
        ...r,
        data: typeof updater === "function" ? updater(r.data) : updater,
      })),
    [],
  );

  const current = result.key === key;
  return {
    data: current ? result.data : undefined,
    error: current ? result.error : null,
    loading: !current,
    retry,
    setData,
  };
}

export default useApi;

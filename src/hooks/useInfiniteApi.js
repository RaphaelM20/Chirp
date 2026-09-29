import { useCallback, useEffect, useState } from "react";
import { request } from "../lib/api";
import { useAuth } from "../lib/auth";

const PAGE_SIZE = 20;

function pageUrl(path, cursor) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}limit=${PAGE_SIZE}${cursor ? `&cursor=${cursor}` : ""}`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => !seen.has(item.id) && seen.add(item.id));
}

const EMPTY = {
  key: null,
  items: [],
  nextCursor: null,
  error: null,
  loadingMore: false,
  moreError: null,
};

// Cursor-paginated list for endpoints that return { items, nextCursor }.
// Like useApi, loading is derived from whether the stored result belongs to
// the current request key.
function useInfiniteApi(path) {
  const { token } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(EMPTY);
  const key = `${token}|${path}|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    request(pageUrl(path)).then(
      (page) =>
        !cancelled &&
        setState({ ...EMPTY, key, items: page.items, nextCursor: page.nextCursor }),
      (error) => !cancelled && setState({ ...EMPTY, key, error }),
    );
    return () => {
      cancelled = true;
    };
  }, [key, path]);

  const current = state.key === key;
  const { nextCursor, loadingMore } = state;

  const loadMore = useCallback(() => {
    if (!current || !nextCursor || loadingMore) return;
    setState((s) => ({ ...s, loadingMore: true, moreError: null }));
    // Results for a list that has since been replaced are dropped.
    request(pageUrl(path, nextCursor)).then(
      (page) =>
        setState((s) =>
          s.key !== key
            ? s
            : {
                ...s,
                items: uniqueById([...s.items, ...page.items]),
                nextCursor: page.nextCursor,
                loadingMore: false,
              },
        ),
      (error) =>
        setState((s) =>
          s.key !== key ? s : { ...s, loadingMore: false, moreError: error },
        ),
    );
  }, [current, nextCursor, loadingMore, path, key]);

  // Local edits (likes, new posts, deletions). If the item the cursor points
  // at was removed, continue from the new last item so the next page still
  // resolves.
  const setItems = useCallback(
    (updater) =>
      setState((s) => {
        const items = updater(s.items);
        const cursorGone =
          s.nextCursor && items.length > 0 && !items.some((i) => i.id === s.nextCursor);
        return {
          ...s,
          items,
          nextCursor: cursorGone ? items[items.length - 1].id : s.nextCursor,
        };
      }),
    [],
  );

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    items: current ? state.items : [],
    error: current ? state.error : null,
    loading: !current,
    loadingMore: current && loadingMore,
    moreError: current ? state.moreError : null,
    hasMore: current && Boolean(nextCursor),
    loadMore,
    retry,
    setItems,
  };
}

export default useInfiniteApi;

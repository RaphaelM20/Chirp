import { useEffect, useRef } from "react";
import { Spinner } from "./States";

// Infinite-scroll trigger placed after a list. Loads the next page when it
// comes within ~one screen of the viewport. The observer is recreated after
// each load so a still-visible sentinel keeps loading until the screen fills.
function LoadMore({ hasMore, loadingMore, error, onLoadMore, endMessage }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!hasMore || error || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onLoadMore(),
      { rootMargin: "800px 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasMore, error, loadingMore, onLoadMore]);

  if (error) {
    return (
      <div className="load-more" role="alert">
        <p>{error.message}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={onLoadMore}>
          Try again
        </button>
      </div>
    );
  }

  if (!hasMore) {
    return endMessage ? <p className="list-end">{endMessage}</p> : null;
  }

  return (
    <div ref={ref} className="load-more">
      {loadingMore && <Spinner label="Loading more" />}
    </div>
  );
}

export default LoadMore;

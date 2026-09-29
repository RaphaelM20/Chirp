import { AlertIcon } from "./Icons";

export function PostSkeleton({ count = 4 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="post skeleton-post">
          <span className="skeleton skeleton-circle" />
          <div className="skeleton-lines">
            <span className="skeleton skeleton-line" style={{ width: "40%" }} />
            <span className="skeleton skeleton-line" style={{ width: "92%" }} />
            <span className="skeleton skeleton-line" style={{ width: "68%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserSkeleton({ count = 3 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="user-row">
          <span className="skeleton skeleton-circle" />
          <div className="skeleton-lines">
            <span className="skeleton skeleton-line" style={{ width: "55%" }} />
            <span className="skeleton skeleton-line" style={{ width: "35%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingRegion({ label, children }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="state">
      {icon && <div className="state-icon">{icon}</div>}
      <h2 className="state-title">{title}</h2>
      {message && <p className="state-message">{message}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, compact }) {
  return (
    <div className={compact ? "state state-compact" : "state"} role="alert">
      {!compact && (
        <div className="state-icon state-icon-danger">
          <AlertIcon size={28} />
        </div>
      )}
      <h2 className="state-title">Something went wrong</h2>
      <p className="state-message">
        {error?.message || "We couldn't load this. Please try again."}
      </p>
      {onRetry && (
        <div className="state-action">
          <button type="button" className="btn btn-outline" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export function Spinner({ label = "Loading" }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

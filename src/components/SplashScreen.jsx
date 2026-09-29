import { Logo } from "./Icons";

function SplashScreen({ error, onRetry }) {
  if (!error) {
    return (
      <div className="splash" role="status" aria-label="Loading Chirp">
        <div className="splash-logo">
          <Logo size={56} />
        </div>
      </div>
    );
  }

  return (
    <div className="splash">
      <div className="splash-error" role="alert">
        <Logo size={48} />
        <h1>Chirp can't connect right now</h1>
        <p>{error.message}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  );
}

export default SplashScreen;

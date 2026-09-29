import { useId, useState } from "react";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import Avatar from "./Avatar";

const MAX_POST_LENGTH = 280;
const WARN_AT = 20;
const RING_RADIUS = 9;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function CharacterCounter({ length, describedById }) {
  const remaining = MAX_POST_LENGTH - length;
  const progress = Math.min(length / MAX_POST_LENGTH, 1);
  const tone = remaining < 0 ? "danger" : remaining <= WARN_AT ? "warn" : "";

  return (
    <div className={`counter ${tone}`}>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <circle className="counter-track" cx="12" cy="12" r={RING_RADIUS} />
        <circle
          className="counter-fill"
          cx="12"
          cy="12"
          r={RING_RADIUS}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - progress)}
        />
      </svg>
      {remaining <= WARN_AT && (
        <span className="counter-number" aria-hidden="true">
          {remaining}
        </span>
      )}
      <span id={describedById} className="sr-only">
        {remaining >= 0
          ? `${remaining} characters remaining`
          : `${-remaining} characters over the limit`}
      </span>
    </div>
  );
}

// `onSubmit` receives the trimmed text and should throw on failure; the
// draft is kept so nothing the user typed is lost.
function Composer({ placeholder, submitLabel, onSubmit, autoFocus, label, inputId }) {
  const { user } = useAuth();
  const toast = useToast();
  const counterId = useId();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  const trimmed = value.trim();
  const canSubmit =
    trimmed.length > 0 && value.length <= MAX_POST_LENGTH && !pending;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    try {
      await onSubmit(trimmed);
      setValue("");
    } catch (err) {
      toast.error(err.message || "Couldn't send that. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="composer" onSubmit={submit}>
      <Avatar user={user} />
      <div className="composer-main">
        <textarea
          id={inputId}
          className="composer-input"
          value={value}
          rows={2}
          placeholder={placeholder}
          aria-label={label || placeholder}
          aria-describedby={counterId}
          autoFocus={autoFocus}
          data-autofocus={autoFocus || undefined}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
          }}
        />
        <div className="composer-footer">
          <span className="composer-hint">
            {value.length > 0 && "Ctrl + Enter to send"}
          </span>
          <div className="composer-controls">
            {value.length > 0 && (
              <CharacterCounter
                length={value.length}
                describedById={counterId}
              />
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit}
              aria-busy={pending}
            >
              {pending ? "Sending…" : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Composer;

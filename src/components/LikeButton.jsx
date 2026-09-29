import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { HeartIcon } from "./Icons";

// Optimistic like toggle. `onChange` receives the new likes array; on a
// failed request the previous array is restored.
function LikeButton({ likes, onChange, send, noun = "post", size = 18 }) {
  const { user, requireAccount } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [popKey, setPopKey] = useState(0);

  const liked = likes.some((l) => l.userId === user.id);
  const count = likes.length;

  const toggle = async () => {
    if (pending || !requireAccount("like")) return;
    const next = !liked;
    const previous = likes;
    onChange(
      next
        ? [...likes, { id: `optimistic-${user.id}`, userId: user.id }]
        : likes.filter((l) => l.userId !== user.id),
    );
    if (next) setPopKey((k) => k + 1);
    setPending(true);
    try {
      await send(next);
    } catch {
      onChange(previous);
      toast.error(`Couldn't ${next ? "like" : "unlike"} this ${noun}. Please try again.`);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`action action-like${liked ? " is-active" : ""}`}
      onClick={toggle}
      aria-pressed={liked}
      aria-label={`${liked ? "Unlike" : "Like"} ${noun}. ${count} ${count === 1 ? "like" : "likes"}`}
    >
      <span className="action-icon" key={popKey}>
        <HeartIcon active={liked} size={size} />
      </span>
      <span className="action-count" aria-hidden="true">
        {count > 0 ? count : ""}
      </span>
    </button>
  );
}

export default LikeButton;

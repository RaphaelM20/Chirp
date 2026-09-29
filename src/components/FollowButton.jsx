import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";

// Follow state lives on the current user in AuthContext, so every follow
// button for the same person stays in sync.
function FollowButton({ userId, username, size = "sm" }) {
  const { user, isFollowing, setFollowing, requireAccount } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  if (userId === user.id) return null;
  const following = isFollowing(userId);

  const toggle = async () => {
    if (pending || !requireAccount("follow")) return;
    const next = !following;
    setFollowing(userId, next);
    setPending(true);
    try {
      await api.setFollow(userId, next);
    } catch {
      setFollowing(userId, !next);
      toast.error(`Couldn't ${next ? "follow" : "unfollow"} @${username}. Please try again.`);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-${size} ${following ? "btn-following" : "btn-contrast"}`}
      onClick={toggle}
      aria-pressed={following}
      aria-label={`${following ? "Unfollow" : "Follow"} @${username}`}
    >
      {following ? (
        <>
          <span className="label-rest">Following</span>
          <span className="label-hover" aria-hidden="true">
            Unfollow
          </span>
        </>
      ) : (
        "Follow"
      )}
    </button>
  );
}

export default FollowButton;

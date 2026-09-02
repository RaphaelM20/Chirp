import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function FollowPage({ currentUser }) {
  const [followList, setFollowList] = useState([]);
  const [followedIds, setFollowedIds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/not-following`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFollowList(data);
      });
  }, []);

  const handleFollowLocal = async (followingId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ followingId }),
    });
    setFollowedIds([...followedIds, followingId]);
  };

  const handleUnfollowLocal = async (followingId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/follow`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ followingId }),
    });
    setFollowedIds(followedIds.filter((id) => id !== followingId));
  };

  return (
    <div className="follow-container">
      <h2 className="follow-header">Who to follow</h2>
      {followList &&
        followList.map((user) => {
          const youFollowThem = followedIds.includes(user.id);
          const theyFollowYou = currentUser?.followers.some(
            (f) => f.followerId === user.id,
          );
          return (
            <div key={user.id} className="follow-item">
              <Link to={`/${user.username}`} className="post-picture">
                <img src={user.picture} className="follow-avatar" />
              </Link>
              <div>
                <Link to={`/${user.username}`} className="post-name">
                  <p>{user.name}</p>
                </Link>
                <p>
                  @{user.username}
                  {theyFollowYou && (
                    <span className="follows-you-badge"> · Follows you</span>
                  )}
                </p>
              </div>
              <button
                className={
                  !youFollowThem
                    ? "btn-follow"
                    : hoveredId === user.id
                      ? "btn-unfollow-hover"
                      : "btn-following"
                }
                onClick={() => {
                  if (youFollowThem) {
                    handleUnfollowLocal(user.id);
                  } else {
                    handleFollowLocal(user.id);
                  }
                }}
                onMouseEnter={() => setHoveredId(user.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {!youFollowThem
                  ? "Follow"
                  : hoveredId === user.id
                    ? "Unfollow"
                    : "Following"}
              </button>
            </div>
          );
        })}
    </div>
  );
}

export default FollowPage;

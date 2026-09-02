import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router-dom";

function ProfilePage({ currentUser, setCurrentUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [profile, setProfile] = useState(null);
  const currentUserId = token ? parseInt(jwtDecode(token).id) : null;
  const [editProfile, setEditProfile] = useState(false);
  const [profileTab, setProfileTab] = useState("posts");
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPicture, setEditPicture] = useState("");
  const [editBio, setEditBio] = useState("");
  const [followersList, setFollowersList] = useState(false);
  const [followingList, setFollowingList] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [unfollowedIds, setUnfollowedIds] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/${username}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    }).then((res) =>
      res.json().then((data) => {
        setProfile(data);
      }),
    );
  }, [username]);

  if (!profile) return null;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleFollow = async (followingId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ followingId }),
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/${username}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );
    const data = await response.json();
    setProfile(data);
  };

  const handleUnfollow = async (followingId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/follow`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ followingId }),
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/${username}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );
    const data = await response.json();
    setProfile(data);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const body = {
      name: editName || profile.name || "",
      username: editUsername || profile.username || "",
      picture: editPicture || profile.picture || "",
      bio: editBio || profile.bio || "",
    };
    await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(body),
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    const data = await res.json();
    setCurrentUser(data);

    const profileRes = await fetch(
      `${import.meta.env.VITE_API_URL}/${body.username}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );
    const profileData = await profileRes.json();
    setProfile(profileData);
    setEditProfile(false);
    navigate(`/${body.username}`);
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
    setUnfollowedIds([...unfollowedIds, followingId]);
  };

  const handleFollowLocal = async (followingId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ followingId }),
    });
    setUnfollowedIds(unfollowedIds.filter((id) => id !== followingId));
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-top-row">
          <img className="profile-avatar" src={profile.picture} />
          <div className="profile-actions">
            {profile.id === currentUserId && (
              <button
                className="btn-edit-profile"
                onClick={() => setEditProfile(true)}
              >
                Edit Profile
              </button>
            )}
            {profile.id !== currentUserId &&
              (profile.followers.some((f) => f.followerId === currentUserId) ? (
                <button
                  className="btn-unfollow"
                  onClick={() => handleUnfollow(profile.id)}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="btn-follow"
                  onClick={() => handleFollow(profile.id)}
                >
                  Follow
                </button>
              ))}
          </div>
        </div>

        <div className="profile-info">
          <p className="profile-name">{profile.name}</p>
          <p className="profile-username">@{profile.username}</p>
          <p className="profile-bio">{profile.bio}</p>
          <div className="profile-stats">
            <span onClick={() => setFollowingList(true)}>
              <strong>{profile.following.length}</strong> Following
            </span>
            <span onClick={() => setFollowersList(true)}>
              <strong>{profile.followers.length}</strong> Followers
            </span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          onClick={() => setProfileTab("posts")}
          className={profileTab === "posts" ? "tab-active" : "tab"}
        >
          Posts
        </button>
        <button
          onClick={() => setProfileTab("replies")}
          className={profileTab === "replies" ? "tab-active" : "tab"}
        >
          Replies
        </button>
        <button
          onClick={() => setProfileTab("likes")}
          className={profileTab === "likes" ? "tab-active" : "tab"}
        >
          Likes
        </button>
      </div>

      {profileTab === "posts" && (
        <div className="profile-posts-container">
          {profile.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              currentUser={currentUser}
              onPostsUpdate={() => {
                fetch(`${import.meta.env.VITE_API_URL}/${username}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                  },
                })
                  .then((response) => response.json())
                  .then(setProfile);
              }}
            />
          ))}
        </div>
      )}

      {profileTab === "likes" && (
        <div className="profile-likes-container">
          {profile.likes
            .filter((like) => like.post !== null)
            .map((like) => (
              <PostCard
                key={like.id}
                post={like.post}
                currentUserId={currentUserId}
                currentUser={currentUser}
                onPostsUpdate={() => {
                  fetch(`${import.meta.env.VITE_API_URL}/${username}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                  })
                    .then((response) => response.json())
                    .then(setProfile);
                }}
              />
            ))}
        </div>
      )}

      {profileTab === "replies" && (
        <div className="profile-replies-container">
          {profile.comments.map((comment) => (
            <div key={comment.id} className="reply-item">
              <PostCard
                post={comment.post}
                currentUserId={currentUserId}
                currentUser={currentUser}
                onPostsUpdate={() => {
                  fetch(`${import.meta.env.VITE_API_URL}/${username}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                  })
                    .then((response) => response.json())
                    .then(setProfile);
                }}
              />
              <div className="reply-comment">
                <img className="reply-comment-avatar" src={profile.picture} />
                <div className="reply-comment-body">
                  <div className="reply-comment-header">
                    <span className="post-name">{profile.name}</span>
                    <span className="post-username">@{profile.username}</span>
                    <span className="post-dot">·</span>
                    <span className="post-time">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="reply-comment-content">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editProfile && (
        <div className="edit-profile-modal">
          <div className="edit-modal-form">
            <form onSubmit={handleEdit}>
              <div className="edit-modal-buttons">
                <button type="button" onClick={() => setEditProfile(false)}>
                  X
                </button>
                <button type="submit">Save</button>
              </div>
              <div className="edit-field">
                <label htmlFor="picture-input">Profile Picture URL</label>
                <input
                  id="picture-input"
                  type="text"
                  value={editPicture || profile.picture || ""}
                  onChange={(e) => setEditPicture(e.target.value)}
                />
              </div>
              <div className="edit-field">
                <label htmlFor="name-input">Name</label>
                <input
                  id="name-input"
                  type="text"
                  value={editName || profile.name || ""}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="edit-field">
                <label htmlFor="username-input">Username</label>
                <input
                  id="username-input"
                  type="text"
                  value={editUsername || profile.username || ""}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>
              <div className="edit-field">
                <label htmlFor="bio-input">Bio</label>
                <input
                  id="bio-input"
                  type="text"
                  value={editBio || profile.bio || ""}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {followingList && (
        <div className="following-list-modal">
          <div className="following-list-card">
            <button onClick={() => setFollowingList(false)}>✕</button>
            <h2>Following</h2>
            {profile.following.map((following) => {
              const youFollowThem = !unfollowedIds.includes(
                following.following.id,
              );
              const theyFollowYou = currentUser?.followers?.some(
                (f) => f.followerId === following.following.id,
              );
              return (
                <div key={following.id} className="following-item">
                  <img
                    src={following.following.picture}
                    className="following-avatar"
                  />
                  <div>
                    <p>{following.following.name}</p>
                    <p>
                      @{following.following.username}
                      {theyFollowYou && (
                        <span className="follows-you-badge">
                          {" "}
                          · Follows you
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    className={
                      !youFollowThem
                        ? "btn-follow-back"
                        : hoveredId === following.id
                          ? "btn-unfollow-hover"
                          : "btn-following"
                    }
                    onMouseEnter={() => setHoveredId(following.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (youFollowThem) {
                        handleUnfollowLocal(following.following.id);
                      } else {
                        handleFollowLocal(following.following.id);
                      }
                    }}
                  >
                    {!youFollowThem
                      ? "Follow"
                      : hoveredId === following.id
                        ? "Unfollow"
                        : "Following"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {followersList && (
        <div className="follower-list-modal">
          <div className="folder-list-card">
            <button onClick={() => setFollowersList(false)}>✕</button>
            <h2>Followers</h2>
            {profile.followers.map((follower) => {
              const youFollowThem =
                currentUser?.following?.some(
                  (f) => f.followingId === follower.follower.id,
                ) && !unfollowedIds.includes(follower.follower.id);

              return (
                <div key={follower.id} className="follower-item">
                  <img
                    src={follower.follower.picture}
                    className="follower-avatar"
                  />
                  <div>
                    <p>{follower.follower.name}</p>
                    <p>@{follower.follower.username}</p>
                  </div>
                  <button
                    className={
                      youFollowThem
                        ? hoveredId === follower.id
                          ? "btn-unfollow-hover"
                          : "btn-following"
                        : "btn-follow-back"
                    }
                    onMouseEnter={() => setHoveredId(follower.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (youFollowThem) {
                        handleUnfollowLocal(follower.follower.id);
                      } else {
                        handleFollowLocal(follower.follower.id);
                      }
                    }}
                  >
                    {youFollowThem
                      ? hoveredId === follower.id
                        ? "Unfollow"
                        : "Following"
                      : "Follow Back"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

import { useState } from "react";
import { Link } from "react-router-dom";

function PostCard({ post, currentUserId, currentUser, onPostsUpdate }) {
  const [commentFormPostId, setCommentFormPostId] = useState(null);
  const [commentQuery, setCommentQuery] = useState("");

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

  const handleLike = async (postId, likes) => {
    const alreadyLiked = likes.some((l) => l.userId === currentUserId);
    const method = alreadyLiked ? "DELETE" : "POST";
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/likes`, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    onPostsUpdate();
  };

  const handleComment = async (postId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ content: commentQuery }),
    });
    onPostsUpdate();
    setCommentQuery("");
    setCommentFormPostId(null);
  };

  const handleDelete = async (postId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    onPostsUpdate();
  };

  return (
    <>
      <div className="post-container">
        <Link to={`/${post.user.username}`}>
          <img className="post-picture" src={post.user.picture} />
        </Link>
        <div className="post-body">
          <div className="post-header-row">
            <div className="post-header">
              <Link to={`/${post.user.username}`} className="post-name">
                {post.user.name}
              </Link>
              <span className="post-username">@{post.user.username}</span>
              <span className="post-dot">·</span>
              <span className="post-time">{formatTime(post.createdAt)}</span>
            </div>
            {post.userId === currentUserId && (
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            )}
          </div>
          <Link to={`/${post.user.username}/${post.id}`}>
            <p className="post-content">{post.content}</p>
          </Link>
          <div className="post-actions">
            <button
              className="action-btn"
              onClick={() => setCommentFormPostId(post.id)}
            >
              💬 {post.comments.length}
            </button>
            <button
              className={`action-btn ${post.likes.some((l) => l.userId === currentUserId) ? "liked" : ""}`}
              onClick={() => handleLike(post.id, post.likes)}
            >
              {post.likes.some((l) => l.userId === currentUserId) ? "❤️" : "♡"}{" "}
              {post.likes.length}
            </button>
          </div>
        </div>
      </div>

      {commentFormPostId === post.id && (
        <div className="overlay">
          <div className="reply-modal">
            <button
              className="close-btn"
              onClick={() => setCommentFormPostId(null)}
            >
              ✕
            </button>
            <div className="reply-original-post">
              <img src={post.user.picture} className="reply-avatar" />
              <div>
                <div className="post-header">
                  <span className="post-name">{post.user.name}</span>
                  <span className="post-username">@{post.user.username}</span>
                  <span className="post-dot">·</span>
                  <span className="post-time">
                    {formatTime(post.createdAt)}
                  </span>
                </div>
                <p className="post-content">{post.content}</p>
              </div>
            </div>
            <div className="reply-form-row">
              <img src={currentUser?.picture} className="reply-avatar" />
              <form
                className="reply-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment(post.id);
                }}
              >
                <input
                  type="text"
                  value={commentQuery}
                  onChange={(e) => setCommentQuery(e.target.value)}
                  placeholder="Post your reply"
                  className="reply-input"
                />
                <button type="submit" className="reply-btn">
                  Reply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PostCard;

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

function PostPage({ currentUser }) {
  const [post, setPost] = useState();
  const [yourReply, setYourReply] = useState("");
  const [commentQuery, setCommentQuery] = useState("");
  const [commentFormPostId, setCommentFormPostId] = useState(null);
  const { id } = useParams();
  const token = localStorage.getItem("authToken");
  const currentUserId = token ? jwtDecode(token).id : null;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPost(data));
  }, [id]);

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

  const handleNewComment = async (content) => {
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        content: content,
      }),
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/posts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );

    const data = await response.json();
    setPost(data);
    setYourReply("");
    setCommentQuery("");
    setCommentFormPostId(null);
  };

  const handlePostLike = async (postId, likes) => {
    const alreadyLiked = likes.some(
      (l) => l.userId === parseInt(currentUserId),
    );
    const method = alreadyLiked ? "DELETE" : "POST";
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/likes`, {
      method: method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const post = await fetch(
      `${import.meta.env.VITE_API_URL}/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );

    const data = await post.json();
    setPost(data);
  };

  const handleCommentLike = async (postId, commentId, likes) => {
    const alreadyLiked = likes.some(
      (l) => l.userId === parseInt(currentUserId),
    );
    const method = alreadyLiked ? "DELETE" : "POST";
    await fetch(`${import.meta.env.VITE_API_URL}/comments/${commentId}/likes`, {
      method: method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const post = await fetch(
      `${import.meta.env.VITE_API_URL}/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );
    const data = await post.json();
    setPost(data);
  };

  if (!post) return null;

  return (
    <div className="post-page-container">
      <div className="post-page-header">
        <Link to={`/${post.user.username}`}>
          <img className="post-picture" src={post.user?.picture} />
        </Link>
        <div className="post-page-user">
          <Link to={`/${post.user.username}`}>{post.user.name}</Link>
          <span className="post-username">@{post.user.username}</span>
        </div>
      </div>

      <p className="post-page-content">{post.content}</p>
      <p className="post-page-time">{formatTime(post.createdAt)}</p>

      <div className="post-actions">
        <button
          className={`action-btn`}
          onClick={() => setCommentFormPostId(post.id)}
        >
          💬 {post.comments.length}
        </button>
        <button
          className={`action-btn ${post.likes.some((l) => l.userId === currentUserId) ? "like-btn liked" : "like-btn"}`}
          onClick={() => handlePostLike(post.id, post.likes)}
        >
          {post.likes.some((l) => l.userId === parseInt(currentUserId))
            ? "❤️"
            : "♡"}
          {post.likes.length}
        </button>
      </div>

      <div className="reply-container">
        <img src={currentUser?.picture} />
        <form
          className="reply-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleNewComment(yourReply);
          }}
        >
          <input
            id="new-comment-input"
            type="text"
            value={yourReply}
            onChange={(e) => setYourReply(e.target.value)}
            placeholder="Post your reply"
          />
          <button type="submit">Reply</button>
        </form>
      </div>

      <div className="comment-container">
        {post.comments.map((comment) => (
          <div key={comment.id}>
            <img className="comment-avatar" src={comment.user.picture} />
            <div className="comment-body">
              <div className="comment-header">
                <p className="comment-name">{comment.user.name}</p>
                <p className="comment-username">@{comment.user.username}</p>
                <span className="comment-dot">·</span>
                <span className="comment-time">
                  {formatTime(comment.createdAt)}
                </span>
              </div>
              <p>{comment.content}</p>
              <div className="comment-actions">
                <button
                  className={`action-btn`}
                  onClick={() => setCommentFormPostId(post.id)}
                >
                  💬
                </button>
                <button
                  className={`action-btn ${comment.likes.some((l) => l.userId === currentUserId) ? "liked" : ""}`}
                  onClick={() =>
                    handleCommentLike(post.id, comment.id, comment.likes)
                  }
                >
                  {comment.likes.some(
                    (l) => l.userId === parseInt(currentUserId),
                  )
                    ? "❤️"
                    : "♡"}
                  {comment.likes.length}
                </button>
              </div>
            </div>
          </div>
        ))}
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
              <img src={post.user?.picture} className="reply-avatar" />
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
                  handleNewComment(commentQuery);
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
    </div>
  );
}

export default PostPage;

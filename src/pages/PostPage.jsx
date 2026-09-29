import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api, paths } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { byOldest, formatFullTimestamp } from "../lib/time";
import useApi from "../hooks/useApi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Avatar from "../components/Avatar";
import Composer from "../components/Composer";
import LikeButton from "../components/LikeButton";
import PageHeader from "../components/PageHeader";
import { DeletePostDialog, PostMeta } from "../components/PostCard";
import { ReplyIcon, TrashIcon } from "../components/Icons";
import { ErrorState, LoadingRegion, PostSkeleton } from "../components/States";
import NotFoundPage from "./NotFoundPage";

const REPLY_INPUT_ID = "reply-input";

function truncate(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function ReplyItem({ comment, onLikesChange }) {
  return (
    <article className="post">
      <Link to={`/${comment.user.username}`} className="avatar-link" tabIndex={-1}>
        <Avatar user={comment.user} alt={comment.user.name} />
      </Link>
      <div className="post-body">
        <PostMeta author={comment.user} createdAt={comment.createdAt} />
        <p className="post-text">{comment.content}</p>
        <div className="post-actions">
          <LikeButton
            noun="reply"
            likes={comment.likes}
            onChange={onLikesChange}
            send={(liked) => api.setCommentLike(comment.id, liked)}
          />
        </div>
      </div>
    </article>
  );
}

function PostDetail({ post, setPost }) {
  const { user, isGuest, requireAccount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isOwn = !isGuest && post.user.id === user.id;
  const replies = [...post.comments].sort(byOldest);

  const reply = async (content) => {
    const comment = await api.comment(post.id, content);
    setPost((p) => ({
      ...p,
      comments: [
        ...p.comments,
        {
          ...comment,
          likes: [],
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            picture: user.picture,
          },
        },
      ],
    }));
    toast.success("Your reply was sent.");
  };

  return (
    <>
      <article className="post-detail">
        <div className="post-detail-author">
          <Link to={`/${post.user.username}`} className="avatar-link" tabIndex={-1}>
            <Avatar user={post.user} size="lg" alt={post.user.name} />
          </Link>
          <div className="post-detail-names">
            <Link to={`/${post.user.username}`} className="post-author">
              {post.user.name}
            </Link>
            <span className="handle">@{post.user.username}</span>
          </div>
          {isOwn && (
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Delete post"
              title="Delete"
            >
              <TrashIcon />
            </button>
          )}
        </div>

        <p className="post-detail-text">{post.content}</p>
        <time className="post-detail-time" dateTime={post.createdAt}>
          {formatFullTimestamp(post.createdAt)}
        </time>

        {(post.comments.length > 0 || post.likes.length > 0) && (
          <div className="post-detail-stats">
            <span>
              <strong>{post.comments.length}</strong>{" "}
              {post.comments.length === 1 ? "Reply" : "Replies"}
            </span>
            <span>
              <strong>{post.likes.length}</strong>{" "}
              {post.likes.length === 1 ? "Like" : "Likes"}
            </span>
          </div>
        )}

        <div className="post-actions post-detail-actions">
          <button
            type="button"
            className="action action-reply"
            onClick={() =>
              requireAccount("reply") &&
              document.getElementById(REPLY_INPUT_ID)?.focus()
            }
            aria-label="Reply"
          >
            <span className="action-icon">
              <ReplyIcon size={22} />
            </span>
          </button>
          <LikeButton
            size={22}
            likes={post.likes}
            onChange={(likes) => setPost((p) => ({ ...p, likes }))}
            send={(liked) => api.setPostLike(post.id, liked)}
          />
        </div>
      </article>

      {isGuest ? (
        <div className="inline-cta">
          <p>Want to join the conversation?</p>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Sign up to reply
          </Link>
        </div>
      ) : (
        <div className="composer-card">
          <Composer
            inputId={REPLY_INPUT_ID}
            placeholder="Post your reply"
            submitLabel="Reply"
            onSubmit={reply}
          />
        </div>
      )}

      <section aria-label="Replies">
        {replies.length === 0 ? (
          <p className="list-empty">No replies yet. Start the conversation.</p>
        ) : (
          replies.map((comment) => (
            <ReplyItem
              key={comment.id}
              comment={comment}
              onLikesChange={(likes) =>
                setPost((p) => ({
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === comment.id ? { ...c, likes } : c,
                  ),
                }))
              }
            />
          ))
        )}
      </section>

      {confirmingDelete && (
        <DeletePostDialog
          post={post}
          onClose={() => setConfirmingDelete(false)}
          onDeleted={() => navigate(`/${post.user.username}`, { replace: true })}
        />
      )}
    </>
  );
}

function PostPage() {
  const { username, id } = useParams();
  const validId = /^\d+$/.test(id);
  const { data: post, error, loading, retry, setData } = useApi(
    validId ? paths.post(id) : null,
  );

  // Older API versions answered unknown posts with 200 + null.
  const notFound = !validId || post === null || error?.status === 404;

  useDocumentTitle(
    post
      ? `${post.user.name} on Chirp: "${truncate(post.content, 60)}"`
      : notFound
        ? "Post not found"
        : "Post",
  );

  if (notFound) {
    return (
      <NotFoundPage
        headerTitle="Post"
        documentTitle="Post not found"
        title="This post doesn't exist"
        message="It may have been deleted, or the link may be wrong."
      />
    );
  }

  // Keep URLs canonical if the author changed their username.
  if (post && post.user.username !== username) {
    return <Navigate to={`/${post.user.username}/${post.id}`} replace />;
  }

  return (
    <>
      <PageHeader title="Post" back />
      {loading ? (
        <LoadingRegion label="Loading post">
          <PostSkeleton count={3} />
        </LoadingRegion>
      ) : error ? (
        <ErrorState error={error} onRetry={retry} />
      ) : (
        <PostDetail post={post} setPost={setData} />
      )}
    </>
  );
}

export default PostPage;

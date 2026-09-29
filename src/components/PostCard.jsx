import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { formatFullTimestamp, formatRelativeTime } from "../lib/time";
import Avatar from "./Avatar";
import Composer from "./Composer";
import LikeButton from "./LikeButton";
import Modal from "./Modal";
import { ReplyIcon, TrashIcon } from "./Icons";

export function PostMeta({ author, createdAt, href }) {
  const time = (
    <time dateTime={createdAt} title={formatFullTimestamp(createdAt)}>
      {formatRelativeTime(createdAt)}
    </time>
  );
  return (
    <div className="post-meta">
      <Link to={`/${author.username}`} className="post-author">
        {author.name}
      </Link>
      <span className="handle">@{author.username}</span>
      <span className="meta-dot" aria-hidden="true">
        ·
      </span>
      {href ? (
        <Link to={href} className="post-time">
          {time}
        </Link>
      ) : (
        <span className="post-time">{time}</span>
      )}
    </div>
  );
}

export function DeletePostDialog({ post, onClose, onDeleted }) {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      await api.deletePost(post.id);
      toast.success("Your post was deleted.");
      onDeleted(post.id);
    } catch (err) {
      toast.error(err.message);
      setPending(false);
      onClose();
    }
  };

  return (
    <Modal title="Delete post?" onClose={onClose} size="sm">
      <p className="dialog-text">
        This can't be undone. The post will be removed from your profile and
        from the timeline of anyone who follows you.
      </p>
      <div className="dialog-actions">
        <button
          type="button"
          className="btn btn-danger btn-block btn-lg"
          onClick={confirm}
          disabled={pending}
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-block btn-lg"
          onClick={onClose}
          disabled={pending}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function ReplyDialog({ post, onClose, onReplied }) {
  const { user } = useAuth();
  const toast = useToast();

  const reply = async (content) => {
    const comment = await api.comment(post.id, content);
    onReplied({
      ...comment,
      likes: [],
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        picture: user.picture,
      },
    });
    toast.success("Your reply was sent.");
    onClose();
  };

  return (
    <Modal title="Reply" onClose={onClose} hideTitle>
      <div className="reply-context">
        <div className="thread-gutter">
          <Avatar user={post.user} />
          <span className="thread-line" aria-hidden="true" />
        </div>
        <div className="reply-context-body">
          <PostMeta author={post.user} createdAt={post.createdAt} />
          <p className="post-text">{post.content}</p>
          <p className="replying-to">
            Replying to <span className="accent-text">@{post.user.username}</span>
          </p>
        </div>
      </div>
      <Composer
        placeholder="Post your reply"
        submitLabel="Reply"
        onSubmit={reply}
        autoFocus
      />
    </Modal>
  );
}

function PostCard({ post, onUpdate, onDelete, threaded = false }) {
  const { user, isGuest, requireAccount } = useAuth();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null);
  const href = `/${post.user.username}/${post.id}`;
  const isOwn = !isGuest && post.user.id === user.id;
  const replies = post.comments.length;

  // The whole card opens the post, except for clicks on its own controls
  // or when the user is selecting text. The timestamp is the keyboard path.
  const openPost = (e) => {
    if (e.target.closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    navigate(href);
  };

  return (
    <>
      <article className={`post is-clickable${threaded ? " is-threaded" : ""}`} onClick={openPost}>
        <div className="thread-gutter">
          <Link to={`/${post.user.username}`} className="avatar-link" tabIndex={-1}>
            <Avatar user={post.user} alt={post.user.name} />
          </Link>
          {threaded && <span className="thread-line" aria-hidden="true" />}
        </div>
        <div className="post-body">
          <div className="post-top">
            <PostMeta author={post.user} createdAt={post.createdAt} href={href} />
            {isOwn && onDelete && (
              <button
                type="button"
                className="icon-btn icon-btn-sm icon-btn-danger"
                onClick={() => setDialog("delete")}
                aria-label="Delete post"
                title="Delete"
              >
                <TrashIcon size={18} />
              </button>
            )}
          </div>
          <p className="post-text">{post.content}</p>
          <div className="post-actions">
            <button
              type="button"
              className="action action-reply"
              onClick={() => requireAccount("reply") && setDialog("reply")}
              aria-label={`Reply. ${replies} ${replies === 1 ? "reply" : "replies"}`}
            >
              <span className="action-icon">
                <ReplyIcon size={18} />
              </span>
              <span className="action-count" aria-hidden="true">
                {replies > 0 ? replies : ""}
              </span>
            </button>
            <LikeButton
              likes={post.likes}
              onChange={(likes) => onUpdate(post.id, (p) => ({ ...p, likes }))}
              send={(liked) => api.setPostLike(post.id, liked)}
            />
          </div>
        </div>
      </article>

      {dialog === "reply" && (
        <ReplyDialog
          post={post}
          onClose={() => setDialog(null)}
          onReplied={(comment) =>
            onUpdate(post.id, (p) => ({ ...p, comments: [...p.comments, comment] }))
          }
        />
      )}
      {dialog === "delete" && (
        <DeletePostDialog
          post={post}
          onClose={() => setDialog(null)}
          onDeleted={onDelete}
        />
      )}
    </>
  );
}

export default PostCard;

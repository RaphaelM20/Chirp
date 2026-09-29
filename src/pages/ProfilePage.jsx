import { useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, fieldErrors, paths } from "../lib/api";
import { useAuth } from "../lib/auth";
import { hueFor } from "../lib/color";
import { useToast } from "../lib/toast";
import useApi from "../hooks/useApi";
import useInfiniteApi from "../hooks/useInfiniteApi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";
import LoadMore from "../components/LoadMore";
import LikeButton from "../components/LikeButton";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import PostCard, { PostMeta } from "../components/PostCard";
import Tabs from "../components/Tabs";
import UserRow from "../components/UserRow";
import { EmptyState, ErrorState, LoadingRegion, PostSkeleton } from "../components/States";
import NotFoundPage from "./NotFoundPage";

const TABS = [
  { id: "posts", label: "Posts" },
  { id: "replies", label: "Replies" },
  { id: "likes", label: "Likes" },
];

const BIO_MAX = 160;

function ProfileSkeleton() {
  return (
    <LoadingRegion label="Loading profile">
      <div aria-hidden="true">
        <div className="profile-cover skeleton" />
        <div className="profile-head">
          <div className="profile-avatar-row">
            <span className="skeleton skeleton-avatar-xl" />
          </div>
          <span className="skeleton skeleton-line" style={{ width: "40%", height: 20 }} />
          <span className="skeleton skeleton-line" style={{ width: "25%" }} />
          <span className="skeleton skeleton-line" style={{ width: "70%" }} />
        </div>
      </div>
      <PostSkeleton count={3} />
    </LoadingRegion>
  );
}

function EditProfileDialog({ profile, onClose, onSaved }) {
  const formId = useId();
  const [values, setValues] = useState({
    name: profile.name || "",
    username: profile.username,
    picture: profile.picture || "",
    bio: profile.bio || "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const setField = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = (fields) => {
    const found = {};
    if (!fields.name) found.name = "Name can't be blank.";
    else if (fields.name.length > 50) found.name = "Keep it under 50 characters.";
    if (fields.username !== profile.username) {
      if (!/^[A-Za-z0-9]{4,20}$/.test(fields.username)) {
        found.username = "Use 4–20 letters and numbers.";
      }
    }
    if (fields.picture && !/^https?:\/\/\S+$/i.test(fields.picture)) {
      found.picture = "Enter an image URL starting with http:// or https://";
    }
    if (fields.bio.length > BIO_MAX) found.bio = `Keep it under ${BIO_MAX} characters.`;
    return found;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const fields = {
      name: values.name.trim(),
      username: values.username.trim(),
      picture: values.picture.trim(),
      bio: values.bio.trim(),
    };
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    try {
      await api.updateMe(fields);
      onSaved(fields);
    } catch (err) {
      const serverErrors = fieldErrors(err);
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors);
      } else {
        setFormError(err.message);
      }
      setPending(false);
    }
  };

  const field = (id, label, input, hint) => (
    <div className={`field${errors[id] ? " has-error" : ""}`}>
      <label htmlFor={`${formId}-${id}`}>{label}</label>
      {input}
      {errors[id] ? (
        <p id={`${formId}-${id}-msg`} className="field-error">
          {errors[id]}
        </p>
      ) : (
        hint && (
          <p id={`${formId}-${id}-msg`} className="field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );

  const inputProps = (id) => ({
    id: `${formId}-${id}`,
    value: values[id],
    onChange: setField(id),
    "aria-invalid": Boolean(errors[id]),
    "aria-describedby": `${formId}-${id}-msg`,
  });

  return (
    <Modal
      title="Edit profile"
      onClose={onClose}
      actions={
        <button
          type="submit"
          form={formId}
          className="btn btn-contrast btn-sm"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save"}
        </button>
      }
    >
      <form id={formId} className="form" onSubmit={submit} noValidate>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <div className="edit-preview">
          <Avatar
            user={{ ...profile, name: values.name, picture: values.picture.trim() }}
            size="lg"
            alt="Profile picture preview"
          />
        </div>
        {field(
          "picture",
          "Profile picture URL",
          <input type="url" inputMode="url" placeholder="https://" {...inputProps("picture")} />,
          "Paste a link to an image. Leave empty to use your initials.",
        )}
        {field("name", "Name", <input type="text" autoComplete="name" {...inputProps("name")} />)}
        {field(
          "username",
          "Username",
          <input type="text" autoCapitalize="none" spellCheck={false} {...inputProps("username")} />,
          "Changing it changes your profile link.",
        )}
        {field(
          "bio",
          "Bio",
          <textarea rows={3} {...inputProps("bio")} />,
          `${values.bio.length}/${BIO_MAX}`,
        )}
      </form>
    </Modal>
  );
}

function ConnectionsDialog({ profile, initialTab, onClose }) {
  const [tab, setTab] = useState(initialTab);
  const idPrefix = useId();
  const people =
    tab === "followers"
      ? profile.followers.map((f) => f.follower)
      : profile.following.map((f) => f.following);

  return (
    <Modal title={profile.name} onClose={onClose}>
      <Tabs
        idPrefix={idPrefix}
        label="Connections"
        tabs={[
          { id: "followers", label: "Followers" },
          { id: "following", label: "Following" },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div
        id={`${idPrefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${tab}`}
        className="list-divided"
      >
        {people.length === 0 ? (
          <p className="list-empty">
            {tab === "followers"
              ? `@${profile.username} doesn't have any followers yet.`
              : `@${profile.username} isn't following anyone yet.`}
          </p>
        ) : (
          people.map((person) => (
            <UserRow key={person.id} person={person} onNavigate={onClose} />
          ))
        )}
      </div>
    </Modal>
  );
}

const EMPTY_COPY = {
  posts: (self, who) => ({
    title: self ? "You haven't posted yet" : `${who} hasn't posted yet`,
    message: self ? "Your posts will show up here." : "When they do, their posts will show up here.",
  }),
  replies: (self, who) => ({
    title: self ? "You haven't replied to anyone yet" : `${who} hasn't replied yet`,
    message: "Replies to other posts will show up here.",
  }),
  likes: (self, who) => ({
    title: self ? "You haven't liked any posts yet" : `${who} hasn't liked any posts yet`,
    message: "Liked posts will show up here.",
  }),
};

// One profile tab, paged from /users/:username/:tab. Keyed by tab so each
// tab keeps its own list. Replies and likes wrap the post in `item.post`.
function ProfileTabPanel({ profile, tab, isSelf, onPostDeleted }) {
  const { items, error, loading, loadingMore, moreError, hasMore, loadMore, retry, setItems } =
    useInfiniteApi(paths.profileTab(profile.username, tab));

  const postOf = (item) => (tab === "posts" ? item : item.post);

  const updatePost = (postId, update) =>
    setItems((list) =>
      list.map((item) => {
        if (postOf(item)?.id !== postId) return item;
        return tab === "posts" ? update(item) : { ...item, post: update(item.post) };
      }),
    );

  const removePost = (postId) => {
    setItems((list) => list.filter((item) => postOf(item)?.id !== postId));
    onPostDeleted();
  };

  const updateCommentLikes = (commentId, likes) =>
    setItems((list) => list.map((c) => (c.id === commentId ? { ...c, likes } : c)));

  if (loading) {
    return (
      <LoadingRegion label="Loading">
        <PostSkeleton count={3} />
      </LoadingRegion>
    );
  }
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (items.length === 0) {
    const copy = EMPTY_COPY[tab](isSelf, `@${profile.username}`);
    return (
      <EmptyState
        title={copy.title}
        message={copy.message}
        action={
          isSelf &&
          tab === "posts" && (
            <Link to="/" className="btn btn-primary">
              Write your first post
            </Link>
          )
        }
      />
    );
  }

  return (
    <>
      {items.map((item) =>
        tab === "replies" ? (
          <div key={item.id} className="thread">
            <PostCard post={item.post} onUpdate={updatePost} threaded />
            <article className="post">
              <Link to={`/${profile.username}`} className="avatar-link" tabIndex={-1}>
                <Avatar user={profile} alt={profile.name} />
              </Link>
              <div className="post-body">
                <PostMeta author={profile} createdAt={item.createdAt} />
                <p className="post-text">{item.content}</p>
                <div className="post-actions">
                  <LikeButton
                    noun="reply"
                    likes={item.likes}
                    onChange={(likes) => updateCommentLikes(item.id, likes)}
                    send={(liked) => api.setCommentLike(item.id, liked)}
                  />
                </div>
              </div>
            </article>
          </div>
        ) : (
          <PostCard
            key={item.id}
            post={postOf(item)}
            onUpdate={updatePost}
            onDelete={removePost}
          />
        ),
      )}
      <LoadMore
        hasMore={hasMore}
        loadingMore={loadingMore}
        error={moreError}
        onLoadMore={loadMore}
      />
    </>
  );
}

function Profile({ profile, setProfile }) {
  const { user, isGuest, isFollowing, followsYou, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const tabsId = useId();
  const [tab, setTab] = useState("posts");
  const [dialog, setDialog] = useState(null);

  const isSelf = profile.id === user.id;
  const postCount = profile._count?.posts ?? profile.posts?.length ?? 0;

  // Follow state lives on the current user, so derive counts from it to keep
  // them in sync with optimistic follow toggles.
  const followerCount = isSelf
    ? profile.followers.length
    : profile.followers.filter((f) => f.followerId !== user.id).length +
      (isFollowing(profile.id) ? 1 : 0);
  const followingCount = isSelf ? user.following.length : profile.following.length;

  // Deleting one of your own posts lowers the header count.
  const onPostDeleted = () =>
    setProfile((p) =>
      p._count ? { ...p, _count: { ...p._count, posts: Math.max(0, p._count.posts - 1) } } : p,
    );

  const saveProfile = (fields) => {
    const picture = fields.picture || null;
    updateUser({ ...fields, picture });
    setProfile((p) => ({ ...p, ...fields, picture }));
    setDialog(null);
    toast.success("Your profile was updated.");
    if (fields.username !== profile.username) {
      navigate(`/${fields.username}`, { replace: true });
    }
  };

  return (
    <>
      <PageHeader
        title={profile.name}
        subtitle={`${postCount} ${postCount === 1 ? "post" : "posts"}`}
        back
      />

      <div className="profile-cover" style={{ "--cover-hue": hueFor(profile.username) }} />
      <section className="profile-head" aria-label="Profile">
        <div className="profile-avatar-row">
          <div className="profile-avatar">
            <Avatar user={profile} size="xl" />
          </div>
          <div className="profile-cta">
            {isSelf ? (
              !isGuest && (
                <button type="button" className="btn btn-outline" onClick={() => setDialog("edit")}>
                  Edit profile
                </button>
              )
            ) : (
              <FollowButton userId={profile.id} username={profile.username} size="md" />
            )}
          </div>
        </div>
        <h2 className="profile-name">{profile.name}</h2>
        <div className="profile-handle-row">
          <span className="handle">@{profile.username}</span>
          {!isSelf && followsYou(profile.id) && <span className="badge">Follows you</span>}
        </div>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <div className="profile-stats">
          <button type="button" className="stat" onClick={() => setDialog("following")}>
            <strong>{followingCount}</strong> Following
          </button>
          <button type="button" className="stat" onClick={() => setDialog("followers")}>
            <strong>{followerCount}</strong> {followerCount === 1 ? "Follower" : "Followers"}
          </button>
        </div>
      </section>

      <Tabs idPrefix={tabsId} label="Profile content" tabs={TABS} active={tab} onChange={setTab} />
      <section id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-tab-${tab}`}>
        <ProfileTabPanel
          key={tab}
          profile={profile}
          tab={tab}
          isSelf={isSelf}
          onPostDeleted={onPostDeleted}
        />
      </section>

      {dialog === "edit" && (
        <EditProfileDialog profile={profile} onClose={() => setDialog(null)} onSaved={saveProfile} />
      )}
      {(dialog === "followers" || dialog === "following") && (
        <ConnectionsDialog profile={profile} initialTab={dialog} onClose={() => setDialog(null)} />
      )}
    </>
  );
}

function ProfilePage({ username }) {
  const { data: profile, error, loading, retry, setData } = useApi(paths.profileSummary(username));
  // Older API versions answered unknown usernames with 200 + null.
  const notFound = profile === null || error?.status === 404;

  useDocumentTitle(
    profile
      ? `${profile.name} (@${profile.username})`
      : notFound
        ? "Profile not found"
        : "Profile",
  );

  if (notFound) {
    return (
      <NotFoundPage
        headerTitle="Profile"
        documentTitle="Profile not found"
        title="This account doesn't exist"
        message={`There's no one on Chirp called @${username}. Check the spelling and try again.`}
      />
    );
  }

  if (loading || error) {
    return (
      <>
        <PageHeader title="Profile" back />
        {loading ? <ProfileSkeleton /> : <ErrorState error={error} onRetry={retry} />}
      </>
    );
  }

  return <Profile profile={profile} setProfile={setData} />;
}

// Keyed by username so tabs, dialogs and data reset when switching profiles.
function ProfileRoute() {
  const { username } = useParams();
  return <ProfilePage key={username} username={username} />;
}

export default ProfileRoute;

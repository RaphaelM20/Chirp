import { useId } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, paths } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import useInfiniteApi from "../hooks/useInfiniteApi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Composer from "../components/Composer";
import LoadMore from "../components/LoadMore";
import PageHeader from "../components/PageHeader";
import PostCard from "../components/PostCard";
import Tabs from "../components/Tabs";
import { CompassIcon, Logo } from "../components/Icons";
import {
  EmptyState,
  ErrorState,
  LoadingRegion,
  PostSkeleton,
} from "../components/States";

const FEEDS = [
  { id: "following", label: "Following" },
  { id: "explore", label: "Explore" },
];

function GuestWelcome() {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <Logo size={36} />
      <div>
        <h2 id="welcome-title" className="welcome-title">
          Welcome to Chirp
        </h2>
        <p className="welcome-text">
          You're browsing as a guest. Create an account to post, reply and
          follow people.
        </p>
      </div>
      <Link to="/signup" className="btn btn-primary">
        Sign up
      </Link>
    </section>
  );
}

// Keyed by feed, so switching tabs starts a fresh list.
function Feed({ feed }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();
  const {
    items: posts,
    error,
    loading,
    loadingMore,
    moreError,
    hasMore,
    loadMore,
    retry,
    setItems,
  } = useInfiniteApi(feed === "explore" ? paths.explore : paths.feed);

  const updatePost = (postId, update) =>
    setItems((list) => list.map((p) => (p.id === postId ? update(p) : p)));
  const removePost = (postId) =>
    setItems((list) => list.filter((p) => p.id !== postId));

  const createPost = async (content) => {
    const created = await api.createPost(content);
    const author = {
      id: user.id,
      name: user.name,
      username: user.username,
      picture: user.picture,
    };
    setItems((list) => [
      { ...created, user: author, likes: [], comments: [] },
      ...list,
    ]);
    toast.success("Your post was sent.");
  };

  let list;
  if (loading) {
    list = (
      <LoadingRegion label="Loading posts">
        <PostSkeleton count={5} />
      </LoadingRegion>
    );
  } else if (error) {
    list = <ErrorState error={error} onRetry={retry} />;
  } else if (posts.length === 0) {
    list =
      feed === "explore" ? (
        <EmptyState
          icon={<CompassIcon size={28} />}
          title="Nothing here yet"
          message="Be the first to post something."
        />
      ) : (
        <EmptyState
          icon={<CompassIcon size={28} />}
          title="Your timeline is quiet"
          message="Posts from you and the people you follow show up here. Browse Explore or find a few people to follow."
          action={
            <div className="state-actions">
              <Link to="/?feed=explore" className="btn btn-primary">
                Browse Explore
              </Link>
              <Link to="/connect_people" className="btn btn-outline">
                Find people
              </Link>
            </div>
          }
        />
      );
  } else {
    list = (
      <>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={updatePost}
            onDelete={removePost}
          />
        ))}
        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          error={moreError}
          onLoadMore={loadMore}
          endMessage="You're all caught up."
        />
      </>
    );
  }

  return (
    <>
      {!isGuest && (
        <div className="composer-card">
          <Composer
            placeholder="What's happening?"
            label="Write a new post"
            submitLabel="Post"
            onSubmit={createPost}
          />
        </div>
      )}
      <div aria-busy={loading}>{list}</div>
    </>
  );
}

function HomePage() {
  const { isGuest } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabsId = useId();

  // Guests start on Explore; the guest account follows only a few people.
  const requested = searchParams.get("feed");
  const feed = FEEDS.some((f) => f.id === requested)
    ? requested
    : isGuest
      ? "explore"
      : "following";

  useDocumentTitle(feed === "explore" ? "Explore" : "Home");

  return (
    <>
      <PageHeader title="Home" />
      {isGuest && <GuestWelcome />}
      <Tabs
        idPrefix={tabsId}
        label="Timeline"
        tabs={FEEDS}
        active={feed}
        onChange={(id) => setSearchParams({ feed: id }, { replace: true })}
      />
      <section
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${feed}`}
      >
        <Feed key={feed} feed={feed} />
      </section>
    </>
  );
}

export default HomePage;

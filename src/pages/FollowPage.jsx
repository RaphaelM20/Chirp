import { paths } from "../lib/api";
import useApi from "../hooks/useApi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import PageHeader from "../components/PageHeader";
import UserRow from "../components/UserRow";
import { UsersIcon } from "../components/Icons";
import {
  EmptyState,
  ErrorState,
  LoadingRegion,
  UserSkeleton,
} from "../components/States";

function FollowPage() {
  useDocumentTitle("Who to follow");
  const { data: people, error, loading, retry } = useApi(paths.suggestions);

  let content;
  if (loading) {
    content = (
      <LoadingRegion label="Loading suggestions">
        <UserSkeleton count={8} />
      </LoadingRegion>
    );
  } else if (error) {
    content = <ErrorState error={error} onRetry={retry} />;
  } else if (people.length === 0) {
    content = (
      <EmptyState
        icon={<UsersIcon size={28} />}
        title="You're following everyone"
        message="When new people join Chirp, they'll show up here."
      />
    );
  } else {
    content = (
      <div className="list-divided">
        {people.map((person) => (
          <UserRow key={person.id} person={person} showBio />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Who to follow" subtitle="Suggested for you" back />
      <section aria-label="Suggested accounts" aria-busy={loading}>
        {content}
      </section>
    </>
  );
}

export default FollowPage;

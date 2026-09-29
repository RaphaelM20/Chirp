import { Link } from "react-router-dom";
import useApi from "../hooks/useApi";
import { paths } from "../lib/api";
import { ErrorState, LoadingRegion, UserSkeleton } from "./States";
import UserRow from "./UserRow";

const PREVIEW_COUNT = 3;

function WhoToFollow() {
  const { data, error, loading, retry } = useApi(paths.suggestions);

  let content;
  if (loading) {
    content = (
      <LoadingRegion label="Loading suggestions">
        <UserSkeleton count={PREVIEW_COUNT} />
      </LoadingRegion>
    );
  } else if (error) {
    content = <ErrorState error={error} onRetry={retry} compact />;
  } else if (data.length === 0) {
    content = (
      <p className="card-empty">You're following everyone on Chirp. Nice.</p>
    );
  } else {
    content = (
      <>
        {data.slice(0, PREVIEW_COUNT).map((person) => (
          <UserRow key={person.id} person={person} />
        ))}
        {data.length > PREVIEW_COUNT && (
          <Link to="/connect_people" className="card-more">
            Show more
          </Link>
        )}
      </>
    );
  }

  return (
    <section className="card" aria-labelledby="who-to-follow-title">
      <h2 id="who-to-follow-title" className="card-title">
        Who to follow
      </h2>
      {content}
    </section>
  );
}

export default WhoToFollow;

import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";

function UserRow({ person, showBio = false, onNavigate }) {
  const { followsYou } = useAuth();
  const profilePath = `/${person.username}`;

  return (
    <div className="user-row">
      <Link to={profilePath} className="avatar-link" tabIndex={-1} onClick={onNavigate}>
        <Avatar user={person} />
      </Link>
      <div className="user-row-text">
        <Link to={profilePath} className="user-row-name" onClick={onNavigate}>
          {person.name}
        </Link>
        <div className="user-row-meta">
          <span className="handle">@{person.username}</span>
          {followsYou(person.id) && <span className="badge">Follows you</span>}
        </div>
        {showBio && person.bio && <p className="user-row-bio">{person.bio}</p>}
      </div>
      <FollowButton userId={person.id} username={person.username} />
    </div>
  );
}

export default UserRow;

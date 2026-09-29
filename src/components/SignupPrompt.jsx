import { Link, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { Logo } from "./Icons";

const COPY = {
  post: {
    title: "Share what's happening",
    body: "Create an account to post your first chirp.",
  },
  reply: {
    title: "Join the conversation",
    body: "Create an account to reply to posts.",
  },
  like: {
    title: "Like a post to share the love",
    body: "Create an account to like posts and replies.",
  },
  follow: {
    title: "Follow people you care about",
    body: "Create an account to follow people and build your timeline.",
  },
};

function SignupPrompt({ action, onClose }) {
  const location = useLocation();
  const copy = COPY[action] ?? COPY.post;
  const from = { from: location.pathname };

  return (
    <Modal title={copy.title} onClose={onClose} size="sm" hideTitle>
      <div className="prompt">
        <Logo size={40} />
        <p className="prompt-title" aria-hidden="true">
          {copy.title}
        </p>
        <p className="prompt-body">
          {copy.body} You're currently browsing as a guest.
        </p>
        <div className="prompt-actions">
          <Link
            to="/signup"
            state={from}
            className="btn btn-primary btn-block btn-lg"
            onClick={onClose}
          >
            Create account
          </Link>
          <Link
            to="/login"
            state={from}
            className="btn btn-outline btn-block btn-lg"
            onClick={onClose}
          >
            Log in
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export default SignupPrompt;

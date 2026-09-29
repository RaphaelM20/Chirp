import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import PageHeader from "../components/PageHeader";
import { EmptyState } from "../components/States";
import { CompassIcon } from "../components/Icons";

function NotFoundPage({
  title = "This page doesn't exist",
  message = "The link may be broken, or the page may have been removed.",
  headerTitle = "Not found",
  documentTitle = "Page not found",
}) {
  useDocumentTitle(documentTitle);
  return (
    <>
      <PageHeader title={headerTitle} back />
      <EmptyState
        icon={<CompassIcon size={28} />}
        title={title}
        message={message}
        action={
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      />
    </>
  );
}

export default NotFoundPage;

import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "./Icons";

function PageHeader({ title, subtitle, back = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Direct visits have no in-app history to go back to.
  const goBack = () =>
    location.key === "default" ? navigate("/") : navigate(-1);

  return (
    <header className="page-header">
      {back && (
        <button
          type="button"
          className="icon-btn"
          onClick={goBack}
          aria-label="Back"
        >
          <ArrowLeftIcon />
        </button>
      )}
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}

export default PageHeader;

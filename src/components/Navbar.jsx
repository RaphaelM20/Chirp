import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Navbar({ token, setToken, currentUser }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
  };

  return (
    <>
      {token && (
        <nav className="navbar">
          <Link to="/" className="nav-home">
            Home
          </Link>
          <Link to="/connect_people" className="nav-follow">
            Follow
          </Link>
          <Link to={`/${currentUser?.username}`}>
            <img src={currentUser?.picture} className="nav-avatar" />
          </Link>
          <button
            onClick={() => {
              handleLogout();
              navigate("/login");
            }}
            className="nav-logout"
          >
            Logout
          </button>
        </nav>
      )}
    </>
  );
}

export default Navbar;

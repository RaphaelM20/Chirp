import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import Avatar from "./Avatar";
import WhoToFollow from "./WhoToFollow";
import {
  HomeIcon,
  LoginIcon,
  Logo,
  LogoutIcon,
  UserIcon,
  UsersIcon,
} from "./Icons";

function useNavItems() {
  const { user, isGuest } = useAuth();
  const items = [
    { to: "/", label: "Home", Icon: HomeIcon, end: true },
    { to: "/connect_people", label: "Connect", Icon: UsersIcon },
  ];
  if (!isGuest) {
    items.push({ to: `/${user.username}`, label: "Profile", Icon: UserIcon, end: true });
  }
  return items;
}

function useLogout() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/");
    toast.info("You've been logged out.");
  };
}

function Sidebar() {
  const { user, isGuest } = useAuth();
  const items = useNavItems();
  const handleLogout = useLogout();

  return (
    <header className="sidebar">
      <Link to="/" className="brand" aria-label="Chirp home">
        <Logo />
        <span className="brand-name">Chirp</span>
      </Link>

      <nav className="side-nav" aria-label="Primary">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="side-nav-link" title={label}>
            {({ isActive }) => (
              <>
                <Icon active={isActive} size={26} />
                <span className="nav-label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isGuest ? (
          <div className="sidebar-guest">
            <Link to="/signup" className="btn btn-primary btn-block btn-lg sidebar-cta">
              <span className="nav-label">Create account</span>
              <span className="sidebar-cta-icon" aria-hidden="true">
                <UserIcon size={22} />
              </span>
            </Link>
            <Link to="/login" className="btn btn-outline btn-block btn-lg sidebar-cta" aria-label="Log in">
              <span className="nav-label">Log in</span>
              <span className="sidebar-cta-icon" aria-hidden="true">
                <LoginIcon size={22} />
              </span>
            </Link>
          </div>
        ) : (
          <div className="account">
            <Link to={`/${user.username}`} className="account-link">
              <Avatar user={user} />
              <span className="account-meta">
                <span className="account-name">{user.name}</span>
                <span className="handle">@{user.username}</span>
              </span>
            </Link>
            <button
              type="button"
              className="icon-btn account-logout"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MobileHeader() {
  const { user, isGuest } = useAuth();
  const handleLogout = useLogout();

  return (
    <header className="mobile-header">
      {isGuest ? (
        <span className="mobile-header-spacer" />
      ) : (
        <Link to={`/${user.username}`} className="avatar-link" aria-label="Your profile">
          <Avatar user={user} size="sm" />
        </Link>
      )}
      <Link to="/" className="brand" aria-label="Chirp home">
        <Logo size={28} />
      </Link>
      {isGuest ? (
        <Link to="/login" className="btn btn-outline btn-sm">
          Log in
        </Link>
      ) : (
        <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Log out">
          <LogoutIcon />
        </button>
      )}
    </header>
  );
}

function TabBar() {
  const items = useNavItems();
  return (
    <nav className="tab-bar" aria-label="Primary">
      {items.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="tab-bar-link" aria-label={label}>
          {({ isActive }) => <Icon active={isActive} size={26} />}
        </NavLink>
      ))}
    </nav>
  );
}

function GuestBanner() {
  return (
    <aside className="guest-banner" aria-label="Guest mode">
      <div className="guest-banner-inner">
        <p className="guest-banner-text">
          <strong>You're browsing as a guest</strong>
          <span className="guest-banner-sub"> — Sign up to post, reply and follow.</span>
        </p>
        <div className="guest-banner-actions">
          <Link to="/login" className="btn btn-sm btn-on-accent-outline">
            Log in
          </Link>
          <Link to="/signup" className="btn btn-sm btn-on-accent">
            Sign up
          </Link>
        </div>
      </div>
    </aside>
  );
}

function Layout() {
  const { isGuest } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`app${isGuest ? " has-banner" : ""}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <MobileHeader />
      <div className="shell">
        <Sidebar />
        <main id="main" className="main" tabIndex={-1}>
          <Outlet />
        </main>
        <aside className="rail" aria-label="Suggestions">
          {pathname !== "/connect_people" && <WhoToFollow />}
          <footer className="rail-footer">
            <span>© {new Date().getFullYear()} Chirp</span>
            <span aria-hidden="true">·</span>
            <a href="https://github.com/RaphaelM20/Chirp" target="_blank" rel="noreferrer">
              Source
            </a>
          </footer>
        </aside>
      </div>
      <TabBar />
      {isGuest && <GuestBanner />}
    </div>
  );
}

export default Layout;

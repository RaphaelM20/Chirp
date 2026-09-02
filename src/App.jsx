import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import FollowPage from "./pages/FollowPage";
import PostPage from "./pages/PostPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then((r) => r.json())
        .then(setCurrentUser);
    }
  }, [token]);

  return (
    <>
      <Navbar token={token} setToken={setToken} currentUser={currentUser} />
      <Routes>
        <Route path="/signup" element={<SignupPage setToken={setToken} />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route
          path="/"
          element={token ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/connect_people"
          element={<FollowPage currentUser={currentUser} />}
        />
        <Route
          path="/:username/:id"
          element={<PostPage currentUser={currentUser} />}
        />
        <Route
          path="/:username"
          element={
            <ProfilePage
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;

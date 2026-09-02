import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import PostCard from "../components/PostCard";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("authToken");
  const currentUserId = token ? jwtDecode(token).id : null;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/posts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data));
  }, []);

  const handleNewPost = async (e) => {
    e.preventDefault();
    await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ content: newPost }),
    });
    const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    const data = await response.json();
    setPosts(data);
    setNewPost("");
  };

  return (
    <div className="home-container">
      <div className="new-post-container">
        <img src={currentUser?.picture} />
        <form className="new-post-form" onSubmit={handleNewPost}>
          <input
            id="new-post-input"
            type="text"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's happening?"
          />
          <button type="submit">Post</button>
        </form>
      </div>

      <div className="all-posts-container">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onPostsUpdate={() => {
              fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              })
                .then((response) => response.json())
                .then(setPosts);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;

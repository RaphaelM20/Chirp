const BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "authToken";

let unauthorizedHandler = null;

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Called when an authenticated request comes back 401 (expired or revoked token).
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function describeError(data, status) {
  const first = data?.errors?.[0];
  if (first?.msg || first?.message) return first.msg || first.message;
  if (typeof data?.message === "string") return data.message;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status >= 500) return "Something went wrong on our end. Please try again.";
  return "That didn't work. Please try again.";
}

// Maps an API validation error to { field: message }. Some API errors carry
// no `path`, so fall back to matching the message text.
export function fieldErrors(err) {
  const fields = {};
  for (const item of err.data?.errors ?? []) {
    const message = item.msg || item.message;
    if (item.path) {
      fields[item.path] = message;
    } else if (/email/i.test(message)) {
      fields.email = message;
    } else if (/username/i.test(message)) {
      fields.username = message;
    }
  }
  return fields;
}

export async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Can't reach Chirp right now. Check your connection and try again.",
      0,
    );
  }

  const data = await parseBody(response);
  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedHandler?.();
    throw new ApiError(describeError(data, response.status), response.status, data);
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request("/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    }),
  signup: (fields) =>
    request("/signup", { method: "POST", body: fields, auth: false }),
  me: () => request("/user/me"),
  updateMe: (fields) => request("/user/me", { method: "PUT", body: fields }),
  createPost: (content) =>
    request("/posts", { method: "POST", body: { content } }),
  deletePost: (postId) => request(`/posts/${postId}`, { method: "DELETE" }),
  setPostLike: (postId, liked) =>
    request(`/posts/${postId}/likes`, { method: liked ? "POST" : "DELETE" }),
  setCommentLike: (commentId, liked) =>
    request(`/comments/${commentId}/likes`, {
      method: liked ? "POST" : "DELETE",
    }),
  comment: (postId, content) =>
    request(`/posts/${postId}/comment`, { method: "POST", body: { content } }),
  setFollow: (userId, following) =>
    request("/follow", {
      method: following ? "POST" : "DELETE",
      body: { followingId: userId },
    }),
};

export const paths = {
  feed: "/posts",
  explore: "/explore",
  post: (id) => `/posts/${id}`,
  profileSummary: (username) =>
    `/${encodeURIComponent(username)}?include=summary`,
  profileTab: (username, tab) =>
    `/users/${encodeURIComponent(username)}/${tab}`,
  suggestions: "/not-following",
};

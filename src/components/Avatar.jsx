import { useState } from "react";
import { hueFor } from "../lib/color";

function initialsFor(user) {
  const source = (user?.name || user?.username || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source[0];
  return (letters || "?").toUpperCase();
}

// `alt` should describe the image only when it isn't already labelled by
// adjacent text (e.g. an avatar that is the sole content of a link).
function Avatar({ user, size = "md", alt = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const src = user?.picture;

  if (!src || failedSrc === src) {
    return (
      <span
        className={`avatar avatar-${size} avatar-fallback`}
        style={{ "--avatar-hue": hueFor(user?.username) }}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : "true"}
      >
        {initialsFor(user)}
      </span>
    );
  }

  return (
    <img
      className={`avatar avatar-${size}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
}

export default Avatar;

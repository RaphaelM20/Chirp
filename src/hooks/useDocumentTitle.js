import { useEffect } from "react";

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} / Chirp` : "Chirp";
  }, [title]);
}

export default useDocumentTitle;

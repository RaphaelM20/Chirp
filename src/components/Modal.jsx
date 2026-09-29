import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "./Icons";

// Native <dialog> gives us focus trapping, Escape handling and an inert
// background for free.
function Modal({ title, onClose, children, actions, size = "md", hideTitle }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    // showModal() focuses the first focusable element (the close button);
    // prefer a field that asked for focus.
    dialog.querySelector("[data-autofocus]")?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className={`modal modal-${size}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-panel">
        <header className="modal-header">
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <h2 id={titleId} className={hideTitle ? "sr-only" : "modal-title"}>
            {title}
          </h2>
          {actions && <div className="modal-actions">{actions}</div>}
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
}

export default Modal;

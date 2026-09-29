// Accessible tab list (arrow keys move between tabs). The caller renders the
// panel with id `${idPrefix}-panel`.
function Tabs({ tabs, active, onChange, idPrefix, label }) {
  const onKeyDown = (e) => {
    const index = tabs.findIndex((t) => t.id === active);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    onChange(next.id);
    document.getElementById(`${idPrefix}-tab-${next.id}`)?.focus();
  };

  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`${idPrefix}-tab-${tab.id}`}
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab.id === active}
          aria-controls={`${idPrefix}-panel`}
          tabIndex={tab.id === active ? 0 : -1}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Tabs;

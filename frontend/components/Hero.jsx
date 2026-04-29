// Hero section — editorial headline + search with morphing state
const { useState, useEffect, useRef } = React;

const SAMPLE_DRUGS = ['Metformin', 'Aspirin', 'Ibuprofen', 'Atorvastatin', 'Sildenafil'];

const Hero = ({ onSearch, searching, hasResults }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const submit = (val) => {
    const q = (val ?? query).trim();
    if (!q) return;
    setQuery(q);
    onSearch(q);
  };

  return (
    <section className="hero" data-collapsed={hasResults}>
      <div className="hero-eyebrow">
        <span className="eyebrow-dot" />
        <span>Drug Repurposing Platform · v2.4</span>
      </div>

      <h1 className="hero-title">
        <span className="hero-line">Discover new uses</span>
        <span className="hero-line">
          for <em>existing</em> molecules<span className="hero-period">.</span>
        </span>
      </h1>

      <p className="hero-sub">
        Analyze drug–target interactions, explore molecular pathways, and identify
        repurposing opportunities with confidence scores powered by molecular docking.
      </p>

      <div className={`search-wrap ${focused ? 'is-focused' : ''} ${searching ? 'is-searching' : ''}`}>
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter drug name, compound, or SMILES notation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="analyze-btn" onClick={() => submit()} disabled={searching}>
            {searching ? (
              <span className="dots"><i /><i /><i /></span>
            ) : (
              <>Analyze <span className="arrow">→</span></>
            )}
          </button>
        </div>

        <div className="try-row">
          <span className="try-label">Try</span>
          {SAMPLE_DRUGS.map((d) => (
            <button
              key={d}
              className="chip"
              onClick={() => { setQuery(d); submit(d); }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Hero });

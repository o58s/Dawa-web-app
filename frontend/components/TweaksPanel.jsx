// Tweaks panel — exposes accent color, bg density, and text style variant.
const TweaksPanel = ({ state, setState }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={`tweaks ${open ? 'open' : ''}`}>
      <button className="tweaks-toggle" onClick={() => setOpen(!open)}>
        <span className="dot" /> Tweaks
      </button>
      {open && (
        <div className="tweaks-body">
          <div className="tweak-row">
            <label>Accent</label>
            <div className="swatches">
              {['#c0263a', '#8f1c2b', '#e54862', '#1a1614', '#0f6b5e'].map((c) => (
                <button
                  key={c}
                  className={`sw ${state.accent === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setState({ ...state, accent: c })}
                />
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Node density</label>
            <input
              type="range"
              min={15}
              max={80}
              value={state.density}
              onChange={(e) => setState({ ...state, density: +e.target.value })}
            />
            <span className="val">{state.density}</span>
          </div>

          <div className="tweak-row">
            <label>Headline</label>
            <div className="segments">
              {['serif', 'sans'].map((v) => (
                <button
                  key={v}
                  className={state.headline === v ? 'active' : ''}
                  onClick={() => setState({ ...state, headline: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Background</label>
            <div className="segments">
              {['paper', 'ink'].map((v) => (
                <button
                  key={v}
                  className={state.mode === v ? 'active' : ''}
                  onClick={() => setState({ ...state, mode: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { TweaksPanel });

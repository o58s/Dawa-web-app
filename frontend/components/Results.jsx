// Results panel — shows real predictions from the Dawa backend.
// Receives `predictions` shaped like:
//   [{ disease_id, disease_name, score, raw_score, logit }, ...]
// `score` is normalized 0–1 against the global logit range.

const ConfBar = ({ value }) => (
  <div className="conf">
    <div className="conf-track">
      <div className="conf-fill" style={{ width: `${Math.max(2, value * 100)}%` }} />
    </div>
    <span className="conf-val">{value.toFixed(2)}</span>
  </div>
);

// Bucket scores into 0.0–0.1, 0.1–0.2, … 0.9–1.0
const ScoreHistogram = ({ predictions }) => {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    label: `${(i / 10).toFixed(1)}–${((i + 1) / 10).toFixed(1)}`,
    count: 0,
    lo: i / 10,
    hi: (i + 1) / 10,
  }));

  for (const p of predictions) {
    const idx = Math.min(9, Math.floor(p.score * 10));
    buckets[idx].count += 1;
  }

  const max = Math.max(1, ...buckets.map(b => b.count));

  return (
    <div className="phases">
      {buckets.map((b, i) => {
        const pct = (b.count / max) * 100;
        const tone = b.lo >= 0.7 ? 'crimson' : b.lo >= 0.4 ? 'ink' : 'muted';
        return (
          <div key={b.label} className="phase-row">
            <div className="phase-head">
              <span className={`phase-name tone-${tone}`}>{b.label}</span>
              <span className="phase-count">{b.count.toLocaleString()}</span>
            </div>
            <div className="phase-track">
              <div
                className={`phase-fill tone-${tone}`}
                style={{
                  width: `${pct}%`,
                  transition: 'width .6s ease',
                  transitionDelay: `${i * 40}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Results = ({ query, predictions }) => {
  if (!predictions || predictions.length === 0) {
    return (
      <section className="results">
        <div className="results-head">
          <div>
            <div className="kicker">Results for</div>
            <h2 className="results-title">“{query}”</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">
            <span>No predictions returned</span>
          </div>
          <p style={{ padding: '12px 16px', color: 'var(--ink-soft)' }}>
            The model returned an empty result set for this drug.
          </p>
        </div>
      </section>
    );
  }

  const total = predictions.length;
  const topScore = predictions[0].score;
  const highScoreCount = predictions.filter(p => p.score >= 0.7).length;

  return (
    <section className="results">
      <div className="results-head">
        <div>
          <div className="kicker">Predicted indications for</div>
          <h2 className="results-title">“{query}”</h2>
        </div>
        <div className="results-meta">
          <div className="meta-cell">
            <div className="meta-n">{total}</div>
            <div className="meta-l">Candidates</div>
          </div>
          <div className="meta-cell">
            <div className="meta-n">{topScore.toFixed(2)}</div>
            <div className="meta-l">Top score</div>
          </div>
          <div className="meta-cell">
            <div className="meta-n">{highScoreCount}</div>
            <div className="meta-l">High score (≥ 0.70)</div>
          </div>
        </div>
      </div>

      <div className="phase-grid">
        <div className="panel-title">
          <span>Score Distribution</span>
          <span className="small">{total} predictions</span>
        </div>
        <ScoreHistogram predictions={predictions} />
      </div>

      <div className="split">
        <div className="panel table-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-title">
            <span>Top Disease Candidates</span>
            <span className="small">Sorted by model score</span>
          </div>
          <div className="table-wrap">
            <table className="drug-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Disease</th>
                  <th style={{ width: '180px' }}>Identifier</th>
                  <th style={{ width: '220px' }}>Model Score</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <tr key={p.disease_id} style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="muted">{i + 1}</td>
                    <td className="name-cell">{p.disease_name}</td>
                    <td className="moa-cell">
                      <span className="gene">{p.disease_id}</span>
                    </td>
                    <td><ConfBar value={p.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Results });
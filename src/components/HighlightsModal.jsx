import { Trash2, Highlighter } from 'lucide-react';
import { S, F } from '../theme.js';
import { hap } from '../audio.js';
import { Modal } from './ui/Modal.jsx';

/** Groups a flat highlights array into { topicTitle → { cardTitle → [hl, ...] } }. */
function group(highlights) {
  const g = {};
  for (const hl of highlights) {
    if (!g[hl.topicTitle]) g[hl.topicTitle] = {};
    if (!g[hl.topicTitle][hl.cardTitle]) g[hl.topicTitle][hl.cardTitle] = [];
    g[hl.topicTitle][hl.cardTitle].push(hl);
  }
  return g;
}

export function HighlightsModal({ highlights, onRemove, onClose }) {
  const grouped = group([...highlights].sort((a, b) => b.createdAt - a.createdAt));
  const topics = Object.keys(grouped);

  return (
    <Modal title="My Highlights" onClose={onClose} width={520}>
      {highlights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${S.green}18`, border: `2px solid ${S.green}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Highlighter size={28} color={S.green} />
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: S.white, fontFamily: F, marginBottom: 8 }}>No highlights yet</div>
          <div style={{ fontSize: 13, color: S.subdued, fontFamily: F, lineHeight: 1.6 }}>
            Select any text inside a card while studying<br />and tap <strong style={{ color: S.white }}>Highlight</strong> to save it here.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {topics.map(topicTitle => (
            <div key={topicTitle}>
              {/* Topic header */}
              <div style={{ fontSize: 11, fontWeight: 700, color: S.subdued, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, fontFamily: F }}>
                {topicTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(grouped[topicTitle]).map(([cardTitle, hls]) => (
                  <div key={cardTitle}>
                    {/* Card title */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: S.white, fontFamily: F, marginBottom: 8 }}>
                      {cardTitle}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {hls.map(hl => (
                        <div key={hl.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f59e0b12', border: '1px solid #f59e0b33', borderLeft: '3px solid #f59e0b', borderRadius: 6, padding: '10px 12px' }}>
                          <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: `${S.white}dd`, fontFamily: F }}>
                            {hl.text}
                          </div>
                          <button
                            aria-label="Delete highlight"
                            onClick={() => { hap.light(); onRemove(hl.id); }}
                            style={{ flexShrink: 0, background: 'transparent', border: 'none', color: S.faint, cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = S.danger}
                            onMouseLeave={e => e.currentTarget.style.color = S.faint}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

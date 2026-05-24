import { useState } from 'react';
import { S, F, inpStyle } from '../../theme.js';
import { hap } from '../../audio.js';
import { validateTopicImport, normalizeTopicImport } from '../../lib.js';
import { Modal } from '../ui/Modal.jsx';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';

export function ImportModal({ onClose, onImport }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(null); // { title, count } when JSON is valid

  const handleChange = (raw) => {
    setText(raw);
    setErr(null);
    setPreview(null);
    if (!raw.trim()) return;
    // Live-parse to show a preview as soon as the JSON is syntactically valid
    try {
      const d = JSON.parse(raw);
      const validationErr = validateTopicImport(d);
      if (!validationErr) {
        setPreview({ title: d.title?.trim(), count: Array.isArray(d.cards) ? d.cards.length : 0 });
      }
    } catch {
      // Not valid JSON yet — that's fine while the user is still typing
    }
  };

  const handleImport = () => {
    if (!text.trim()) { setErr('Paste your JSON first.'); hap.error(); return; }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      hap.error();
      setErr('Invalid JSON — check your syntax (missing quote, comma, or bracket?).');
      return;
    }

    const validationErr = validateTopicImport(parsed);
    if (validationErr) {
      hap.error();
      setErr(validationErr);
      return;
    }

    hap.success();
    onImport(normalizeTopicImport(parsed));
    onClose();
  };

  return (
    <Modal title="Import JSON" onClose={onClose}>
      <p style={{ fontSize: 14, color: S.subdued, marginBottom: 4, fontFamily: F, lineHeight: 1.6 }}>
        Paste a topic object. Required fields:
      </p>
      <pre style={{ fontSize: 12, color: S.faint, fontFamily: 'monospace', marginBottom: 14, lineHeight: 1.7,
        background: S.card, borderRadius: 4, padding: '8px 12px', overflowX: 'auto' }}>
{`{
  "title": "Topic name",
  "cards": [
    { "title": "Card title", "body": "Card body" }
  ]
}`}
      </pre>

      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder='{ "title": "...", "cards": [...] }'
        style={{ ...inpStyle(), height: 160, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
        onFocus={e => e.target.style.borderColor = S.white}
        onBlur={e => e.target.style.borderColor = S.border}
      />

      {/* Live preview — shown when JSON is syntactically + structurally valid */}
      {preview && !err && (
        <p style={{ fontSize: 13, color: S.green, margin: '8px 0 0', fontFamily: F }}>
          ✓ Ready to import &quot;{preview.title}&quot; — {preview.count} card{preview.count !== 1 ? 's' : ''}
        </p>
      )}

      {/* Validation / parse error */}
      {err && (
        <p style={{ color: S.danger, fontSize: 13, margin: '8px 0 0', fontFamily: F, lineHeight: 1.5 }}>
          {err}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <SpotifyBtn variant="ghost" onClick={onClose}>Cancel</SpotifyBtn>
        <SpotifyBtn onClick={handleImport}>Import</SpotifyBtn>
      </div>
    </Modal>
  );
}

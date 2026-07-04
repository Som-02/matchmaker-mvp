import { useEffect, useState } from "react";
import { RingMotif } from "../pages/Login";
import { scoreLabel } from "../utils/matching";
import { generateMatchExplanation, generatePersonalizedIntro, isGeminiConfigured } from "../utils/gemini";

export default function MatchCard({ customer, match, onSendMatch }) {
  const [explanation, setExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingExplanation(true);
    generateMatchExplanation(customer, match).then((text) => {
      if (!cancelled) {
        setExplanation(text);
        setLoadingExplanation(false);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id, match.id]);

  const label = scoreLabel(match.matchScore);
  const labelColor = match.matchScore >= 80 ? "var(--sage)" : match.matchScore >= 65 ? "var(--gold)" : "var(--ink-muted)";

  return (
    <div className="card" style={styles.card}>
      <div style={styles.topRow}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.avatar}>{match.photoInitials}</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{match.firstName} {match.lastName}</p>
            <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
              {match.age} yrs · {match.city} · {match.designation}
            </p>
          </div>
        </div>
        <RingMotif size={54} score={match.matchScore} />
      </div>

      <p style={{ fontSize: 11.5, fontWeight: 700, color: labelColor, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 12 }}>
        {label}
      </p>

      <p style={styles.explanation}>
        {loadingExplanation ? "Thinking through compatibility…" : explanation}
      </p>

      <div style={styles.chipRow}>
        {match.matchReasons.slice(0, 3).map((r, i) => (
          <span key={i} className="tag" style={{ background: "var(--surface-warm)", color: "var(--ink-muted)", fontWeight: 500 }}>{r}</span>
        ))}
      </div>

      <div style={styles.footer}>
        <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
          {match.incomeLPA} LPA · {match.heightCm} cm · {match.dietPreference}
        </span>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>Send Match</button>
      </div>

      {showModal && (
        <SendMatchModal
          customer={customer}
          match={match}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            onSendMatch(match);
          }}
        />
      )}
    </div>
  );
}

function SendMatchModal({ customer, match, onClose, onConfirm }) {
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    generatePersonalizedIntro(customer, match).then((text) => {
      if (!cancelled) {
        setIntro(text);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-panel" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p style={styles.modalEyebrow}>Preview email to {customer.firstName}</p>
        <h3 style={{ fontSize: 19, marginBottom: 14 }}>Introducing {match.firstName} {match.lastName}</h3>

        <div style={styles.profileMini}>
          <div style={styles.avatar}>{match.photoInitials}</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{match.firstName} {match.lastName}, {match.age}</p>
            <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{match.designation} · {match.city} · {match.incomeLPA} LPA</p>
          </div>
        </div>

        <div style={styles.introBox}>
          {loading ? (
            <p style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>
              {isGeminiConfigured ? "Generating a personalized intro with Gemini…" : "Preparing intro message…"}
            </p>
          ) : (
            <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{intro}</p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>
            Send to {customer.firstName}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { padding: 18, display: "flex", flexDirection: "column" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: "50%", background: "var(--wine-tint)", color: "var(--wine-dark)",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  explanation: { fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5, marginTop: 6, minHeight: 36 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" },
  modal: { width: 420, padding: 26, maxWidth: "90vw" },
  modalEyebrow: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 700, marginBottom: 6 },
  profileMini: { display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--surface-warm)", borderRadius: 10, marginBottom: 14 },
  introBox: { background: "var(--wine-tint)", padding: 14, borderRadius: 10, minHeight: 60 },
};

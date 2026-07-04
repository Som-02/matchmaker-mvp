import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard");
    } else {
      setError("That username or password doesn't match our records.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.ringDecor} aria-hidden="true">
        <RingMotif size={340} opacity={0.06} />
      </div>

      <div className="card" style={styles.card}>
        <div style={styles.brandRow}>
          <RingMotif size={40} opacity={1} />
          <div>
            <p style={styles.eyebrow}>The Date Crew</p>
            <h1 style={styles.title}>Matchmaker Console</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Username
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="matchmaker"
              autoFocus
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
            Sign in
          </button>
        </form>

        <div style={styles.demoBox}>
          <p style={styles.demoLabel}>Demo credentials</p>
          <p style={styles.demoText}>Username: <strong>{DEMO_CREDENTIALS.username}</strong> &nbsp;·&nbsp; Password: <strong>{DEMO_CREDENTIALS.password}</strong></p>
        </div>
      </div>
    </div>
  );
}

// Signature visual motif: a rangoli-inspired concentric ring, reused (at different
// scales) as the brand mark and as the match-compatibility indicator on match cards.
export function RingMotif({ size = 40, opacity = 1, score }) {
  const petals = 8;
  const center = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.3;
  const dashes = Array.from({ length: petals }, (_, i) => {
    const angle = (i / petals) * Math.PI * 2;
    const x1 = center + Math.cos(angle) * innerR;
    const y1 = center + Math.sin(angle) * innerR;
    const x2 = center + Math.cos(angle) * outerR;
    const y2 = center + Math.sin(angle) * outerR;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={size * 0.045} strokeLinecap="round" />;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity, flexShrink: 0 }}>
      <circle cx={center} cy={center} r={innerR} fill="none" stroke="var(--wine)" strokeWidth={size * 0.03} />
      <g stroke="var(--gold)">{dashes}</g>
      {score !== undefined && (
        <text x={center} y={center + size * 0.06} textAnchor="middle" fontSize={size * 0.28} fontWeight="700" fill="var(--wine-dark)" fontFamily="Fraunces, Georgia, serif">
          {score}
        </text>
      )}
    </svg>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 20% 20%, var(--wine-tint), var(--bg) 60%)",
    position: "relative",
    overflow: "hidden",
    padding: 20,
  },
  ringDecor: { position: "absolute", top: "-60px", right: "-60px" },
  card: { width: 380, padding: "36px 32px", position: "relative", zIndex: 1 },
  brandRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28 },
  eyebrow: { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, margin: 0 },
  title: { fontSize: 22, marginTop: 2 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-muted)" },
  input: {
    padding: "11px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    fontSize: 14,
    fontFamily: "inherit",
    background: "var(--bg)",
    color: "var(--ink)",
  },
  error: { color: "var(--danger)", fontSize: 13, margin: 0 },
  demoBox: { marginTop: 22, padding: 12, borderRadius: 10, background: "var(--surface-warm)", border: "1px dashed var(--border)" },
  demoLabel: { fontSize: 11, fontWeight: 700, color: "var(--wine)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 },
  demoText: { fontSize: 12.5, color: "var(--ink-muted)" },
};

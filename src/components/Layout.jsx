import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RingMotif } from "../pages/Login";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <Link to="/dashboard" style={styles.brand}>
          <RingMotif size={32} />
          <div>
            <p style={styles.brandName}>The Date Crew</p>
            <p style={styles.brandSub}>Matchmaker Console</p>
          </div>
        </Link>

        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navItem}>Customer Dashboard</Link>
        </nav>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{user?.displayName?.[0] ?? "M"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.userName}>{user?.displayName ?? "Matchmaker"}</p>
            <p style={styles.userRole}>Senior Matchmaker</p>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", minHeight: "100vh", background: "var(--bg)" },
  sidebar: {
    width: 240,
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    padding: "24px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandName: { fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 15, color: "var(--wine-dark)", margin: 0 },
  brandSub: { fontSize: 11, color: "var(--ink-muted)", margin: 0 },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: {
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--wine-dark)",
    background: "var(--wine-tint)",
  },
  userBox: { display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderTop: "1px solid var(--border)", paddingTop: 16 },
  avatar: {
    width: 34, height: 34, borderRadius: "50%", background: "var(--wine)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userRole: { fontSize: 11.5, color: "var(--ink-muted)", margin: 0 },
  main: { flex: 1, padding: "32px 40px", minWidth: 0 },
};

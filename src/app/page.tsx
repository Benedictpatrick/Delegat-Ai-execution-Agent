"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DotField from "@/components/DotField";

function DelogatIcon({ size = 28 }: { size?: number }) {
  // Pointy-top hexagon, center (14,14), circumradius 11
  // Vertices (clockwise from top): V0(14,3) V1(23.5,8.5) V2(23.5,19.5) V3(14,25) V4(4.5,19.5) V5(4.5,8.5)
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14,14 L4.5,8.5 L14,3Z"       fill="#4285F4"/>  {/* top-left   — Blue  */}
      <path d="M14,14 L14,3 L23.5,8.5Z"       fill="#EA4335"/>  {/* top-right  — Red   */}
      <path d="M14,14 L23.5,8.5 L23.5,19.5Z"  fill="#FBBC05"/>  {/* right      — Yellow*/}
      <path d="M14,14 L23.5,19.5 L14,25Z"     fill="#34A853"/>  {/* bot-right  — Green */}
      <path d="M14,14 L14,25 L4.5,19.5Z"      fill="#34A853"/>  {/* bot-left   — Green */}
      <path d="M14,14 L4.5,19.5 L4.5,8.5Z"    fill="#4285F4"/>  {/* left       — Blue  */}
    </svg>
  );
}

const LANES = [
  { label: "Must do",     color: "#ef4444", desc: "Non-negotiable. These ship no matter what." },
  { label: "AI executes", color: "#0066cc", desc: "Gemini writes it. You review and ship it." },
  { label: "Human work",  color: "#555",    desc: "You, focused only on what AI cannot touch." },
  { label: "Drop",        color: "#aaa",    desc: "Sacrificed now so the deadline survives." },
];

const ARTIFACTS = ["Presentation outline", "Email draft", "Content brief", "Slide deck structure"];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 44, background: "#000",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <DelogatIcon size={26} />
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Delegat
          </span>
        </div>
        <Link href="/war-room" style={{
          color: "#fff", fontSize: 13, fontWeight: 500, background: "#0066cc",
          padding: "5px 16px", borderRadius: 9999, textDecoration: "none",
        }}>
          Enter War Room
        </Link>
      </nav>

      {/* ── Hero — black ── */}
      <section style={{
        minHeight: "100vh", background: "#000",
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "44px 24px 0",
      }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <DotField
            dotRadius={2}
            dotSpacing={18}
            bulgeStrength={90}
            glowRadius={220}
            sparkle={false}
            waveAmplitude={0}
            gradientFrom="rgba(255,255,255,0.55)"
            gradientTo="rgba(255,255,255,0.28)"
            glowColor="#050505"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 700, position: "relative", zIndex: 1 }}
        >
          <h1 style={{
            color: "#fff",
            fontSize: "clamp(44px, 7vw, 72px)",
            fontWeight: 600, lineHeight: 1.04,
            letterSpacing: "-0.035em", marginBottom: 28,
          }}>
            The impossible<br />deadline has a plan.
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.5)", fontSize: 19, lineHeight: 1.5,
            letterSpacing: "-0.01em", maxWidth: 480, margin: "0 auto 40px",
          }}>
            Describe the crisis. Delegat triages ruthlessly, writes what needs writing
            and rebuilds your schedule in seconds.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <Link href="/war-room" style={{
              display: "inline-block", color: "#fff", fontSize: 17, fontWeight: 500,
              background: "#0066cc", padding: "14px 28px", borderRadius: 9999,
              letterSpacing: "-0.01em", textDecoration: "none",
            }}>
              Enter War Room
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              Google Gemini API Hackathon 2026
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── Triage — light ── */}
      <section style={{ background: "#f5f5f7", padding: "120px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0066cc", marginBottom: 16 }}>
            Triage
          </p>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 600,
            lineHeight: 1.06, letterSpacing: "-0.025em", color: "#1d1d1f", marginBottom: 20,
          }}>
            Ruthless triage,<br />not a todo list.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#6e6e73", maxWidth: 500, marginBottom: 60, letterSpacing: "-0.01em" }}>
            Every task sorted into four lanes instantly. You know what to do,
            what to drop and what AI is already handling.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {LANES.map(lane => (
              <div key={lane.label} style={{
                background: "#fff", borderRadius: 18, padding: 24,
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: lane.color, marginBottom: 16 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em", marginBottom: 6 }}>
                  {lane.label}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "#6e6e73" }}>
                  {lane.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Execution — dark ── */}
      <section style={{ background: "#1d1d1f", padding: "120px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2997ff", marginBottom: 16 }}>
            Execution
          </p>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 600,
            lineHeight: 1.06, letterSpacing: "-0.025em", color: "#fff", marginBottom: 20,
          }}>
            AI doesn't just plan.<br />It executes.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", maxWidth: 520, marginBottom: 48, letterSpacing: "-0.01em" }}>
            Delegat writes the presentation outline, drafts the email and generates the brief
            right inside the War Room. Not suggestions. Actual deliverables ready in seconds.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {ARTIFACTS.map(artifact => (
              <div key={artifact} style={{
                fontSize: 14, color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 16px", borderRadius: 9999, letterSpacing: "-0.01em",
              }}>
                {artifact}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recovery — white ── */}
      <section style={{ background: "#fff", padding: "120px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0066cc", marginBottom: 16 }}>
            Recovery
          </p>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 600,
            lineHeight: 1.06, letterSpacing: "-0.025em", color: "#1d1d1f", marginBottom: 20,
          }}>
            Lost 90 minutes?<br />Recovered.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#6e6e73", maxWidth: 500, marginBottom: 48, letterSpacing: "-0.01em" }}>
            One click. The AI retriages your plan on the spot. It drops what it can,
            compresses the rest and tells you exactly what changed.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            color: "#fff", fontSize: 15, fontWeight: 500,
            background: "#0066cc", padding: "13px 24px", borderRadius: 9999,
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            I lost 90 minutes
          </div>
        </div>
      </section>

      {/* ── CTA — black ── */}
      <section style={{
        background: "#000", padding: "120px 24px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 580 }}>
          <h2 style={{
            color: "#fff", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 600,
            lineHeight: 1.06, letterSpacing: "-0.03em", marginBottom: 20,
          }}>
            Your deadline is closer<br />than you think.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.5, marginBottom: 40, letterSpacing: "-0.01em" }}>
            Open the War Room. Describe the situation. Let Delegat build the plan.
          </p>
          <Link href="/war-room" style={{
            display: "inline-block", color: "#fff", fontSize: 17, fontWeight: 500,
            background: "#0066cc", padding: "14px 32px", borderRadius: 9999,
            letterSpacing: "-0.01em", textDecoration: "none",
          }}>
            Enter War Room
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: "#f5f5f7", padding: "48px 24px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 860, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <DelogatIcon size={24} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                Delegat
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                Google Gemini API Hackathon 2026
              </div>
            </div>
          </div>
          <Link href="/war-room" style={{
            display: "inline-block", color: "#fff", fontSize: 13, fontWeight: 500,
            background: "#0066cc", padding: "8px 20px", borderRadius: 9999,
            textDecoration: "none",
          }}>
            Enter War Room
          </Link>
        </div>
      </footer>
    </div>
  );
}

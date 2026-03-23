/**
 * TikTok — 1080×1920 — 30 secondes @ 30fps = 900 frames
 * Style : cuts ultra-rapides, texte gros, énergie maximale
 *
 * Scènes :
 *   0–3s   (0–90)    : Hook choc — texte explosif
 *   3–10s  (90–300)  : Compteurs DAC7 qui explosent
 *   10–15s (300–450) : Transition "MAIS" — couleur verte
 *   15–25s (450–750) : Dashboard Revendu rapide
 *   25–30s (750–900) : CTA urgent
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { colors, font, radius } from "../components/tokens";
import { Logo } from "../components/Logo";
import { DashboardMock } from "../components/DashboardMock";

// Utility: big chunky text for TikTok
function BigText({ text, color = colors.textPrimary, size = 80, shadow = false, delay = 0 }: {
  text: string; color?: string; size?: number; shadow?: boolean; delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 300 } });
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      fontFamily: font.family,
      fontSize: size,
      fontWeight: 900,
      color,
      textAlign: "center",
      lineHeight: 1.1,
      letterSpacing: "-0.03em",
      textShadow: shadow ? `0 0 40px ${color}80, 0 4px 20px rgba(0,0,0,0.8)` : "0 4px 20px rgba(0,0,0,0.8)",
      WebkitTextStroke: "1px rgba(0,0,0,0.3)",
    }}>
      {text}
    </div>
  );
}

// ─── Scene 1: Hook Choc ───────────────────────────────────────────────────────
function SceneTikTokHook() {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.3) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, #1a0000 0%, ${colors.bg} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: "0 40px",
    }}>
      {/* Red flash overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `rgba(239,68,68,${0.05 + pulse * 0.05})`,
        pointerEvents: "none",
      }} />

      <div style={{ fontSize: 90, filter: `drop-shadow(0 0 30px rgba(239,68,68,0.8))` }}>🚨</div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <BigText text="VINTED" color={colors.textPrimary} size={88} delay={0} />
        <BigText text="TE DÉNONCE" color={colors.red} size={88} shadow delay={5} />
        <BigText text="AU FISC" color={colors.textPrimary} size={88} delay={10} />
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 26,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: 8,
        opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Si tu vends sans tracker ça...
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2: Compteurs ───────────────────────────────────────────────────────
function SceneTikTokCounters() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const txP = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 35 } });
  const txVal = Math.round(interpolate(txP, [0, 1], [0, 30], { extrapolateRight: "clamp" }));

  const rxP = spring({ frame: frame - 25, fps, config: { damping: 15, stiffness: 35 } });
  const rxVal = Math.round(interpolate(rxP, [0, 1], [0, 2000], { extrapolateRight: "clamp" }));

  const txDone = txVal >= 30;
  const rxDone = rxVal >= 2000;

  const bangTx = txDone ? spring({ frame: frame - 140, fps, config: { damping: 10, stiffness: 400 } }) : 0;
  const bangRx = rxDone ? spring({ frame: frame - 145, fps, config: { damping: 10, stiffness: 400 } }) : 0;

  return (
    <AbsoluteFill style={{
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 30,
      padding: "0 50px",
    }}>
      <div style={{
        fontFamily: font.family,
        fontSize: 28,
        fontWeight: 800,
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}>
        RÈGLE DAC7 — 2024
      </div>

      {/* TX counter */}
      <div style={{
        width: "100%",
        background: txDone ? "rgba(239,68,68,0.12)" : colors.bgCard,
        border: `2px solid ${txDone ? colors.red : colors.border}`,
        borderRadius: radius.xl,
        padding: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transform: `scale(${1 + bangTx * 0.04})`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 50 }}>🛍️</span>
          <div>
            <div style={{ fontFamily: font.family, fontSize: 14, color: colors.textMuted, marginBottom: 2 }}>Ventes / an</div>
            <div style={{
              fontFamily: font.family,
              fontSize: 64,
              fontWeight: 900,
              color: txDone ? colors.red : colors.textPrimary,
              lineHeight: 1,
              textShadow: txDone ? `0 0 20px ${colors.red}80` : "none",
            }}>
              {txVal}
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 22,
          fontWeight: 900,
          color: txDone ? colors.red : colors.textMuted,
          textAlign: "right",
        }}>
          {txDone ? "🚨 STOP" : `/ 30`}
        </div>
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 32,
        fontWeight: 900,
        color: colors.textMuted,
      }}>— OU —</div>

      {/* RX counter */}
      <div style={{
        width: "100%",
        background: rxDone ? "rgba(239,68,68,0.12)" : colors.bgCard,
        border: `2px solid ${rxDone ? colors.red : colors.border}`,
        borderRadius: radius.xl,
        padding: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transform: `scale(${1 + bangRx * 0.04})`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 50 }}>💶</span>
          <div>
            <div style={{ fontFamily: font.family, fontSize: 14, color: colors.textMuted, marginBottom: 2 }}>Recettes / an</div>
            <div style={{
              fontFamily: font.family,
              fontSize: 64,
              fontWeight: 900,
              color: rxDone ? colors.red : colors.textPrimary,
              lineHeight: 1,
              textShadow: rxDone ? `0 0 20px ${colors.red}80` : "none",
            }}>
              {rxVal >= 1000 ? `${(rxVal / 1000).toFixed(1)}k` : rxVal}€
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 22,
          fontWeight: 900,
          color: rxDone ? colors.red : colors.textMuted,
        }}>
          {rxDone ? "🚨 STOP" : `/ 2k€`}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 3: Transition "MAIS" ───────────────────────────────────────────────
function SceneTikTokTransition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const s = interpolate(scale, [0, 1], [0.5, 1]);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, ${colors.emeraldDim} 0%, ${colors.bg} 70%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      <div style={{
        transform: `scale(${s})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{ fontSize: 80 }}>💡</div>
        <div style={{
          fontFamily: font.family,
          fontSize: 100,
          fontWeight: 900,
          color: colors.emerald,
          letterSpacing: "-0.04em",
          textShadow: `0 0 50px ${colors.emerald}80`,
        }}>
          MAIS
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 36,
          fontWeight: 700,
          color: colors.textSecondary,
          textAlign: "center",
        }}>
          j'ai trouvé la solution 👇
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 4: Dashboard ───────────────────────────────────────────────────────
function SceneTikTokDashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, ${colors.bg} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 50,
      gap: 20,
    }}>
      <div style={{
        opacity: interpolate(labelIn, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(labelIn, [0, 1], [-16, 0])}px)`,
        textAlign: "center",
        padding: "0 40px",
      }}>
        <div style={{
          fontFamily: font.family,
          fontSize: 20,
          fontWeight: 700,
          color: colors.primary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Revendu
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 34,
          fontWeight: 900,
          color: colors.textPrimary,
          letterSpacing: "-0.02em",
        }}>
          Track tes profits
          <br />
          <span style={{ color: colors.primary }}>+ alerte DAC7</span>
        </div>
      </div>

      <div style={{ transform: "scale(0.84)", transformOrigin: "top center", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DashboardMock delay={5} thresholdPct={34} showStats showChart={false} showAlert />
        </div>
      </div>

      {/* Platform badges */}
      <div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "0 40px",
        opacity: interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        {["Vinted ✓", "Leboncoin ✓", "eBay ✓", "Vestiaire ✓"].map((p) => (
          <span key={p} style={{
            fontFamily: font.family,
            fontSize: 14,
            fontWeight: 600,
            color: colors.emerald,
            background: colors.emeraldDim,
            border: `1px solid ${colors.emerald}40`,
            padding: "5px 12px",
            borderRadius: radius.full,
          }}>{p}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 5: CTA TikTok ─────────────────────────────────────────────────────
function SceneTikTokCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const pulse = Math.sin(frame * 0.2) * 0.06 + 0.94;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, ${colors.bg} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
    }}>
      <div style={{
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1]) * pulse})`,
      }}>
        <Logo size={56} showTagline />
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 90,
        fontWeight: 900,
        color: colors.emerald,
        letterSpacing: "-0.04em",
        textShadow: `0 0 50px ${colors.emerald}60`,
        transform: `scale(${pulse})`,
      }}>
        FREE
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 42,
        fontWeight: 800,
        color: colors.textPrimary,
        background: colors.bgCard,
        border: `2px solid ${colors.primary}60`,
        borderRadius: radius.xl,
        padding: "14px 36px",
        boxShadow: `0 0 40px ${colors.primary}40`,
      }}>
        revendu.fr
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 28,
        color: colors.textMuted,
      }}>
        🔗 LIEN EN BIO
      </div>
    </AbsoluteFill>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TikTok() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Sequence from={0}   durationInFrames={90}> <SceneTikTokHook /></Sequence>
      <Sequence from={90}  durationInFrames={210}><SceneTikTokCounters /></Sequence>
      <Sequence from={300} durationInFrames={150}><SceneTikTokTransition /></Sequence>
      <Sequence from={450} durationInFrames={300}><SceneTikTokDashboard /></Sequence>
      <Sequence from={750} durationInFrames={150}><SceneTikTokCTA /></Sequence>
    </AbsoluteFill>
  );
}

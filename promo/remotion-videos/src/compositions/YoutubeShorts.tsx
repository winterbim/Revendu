/**
 * YouTube Shorts — 1080×1920 — 45 secondes @ 30fps = 1350 frames
 *
 * Scènes :
 *   0–5s   (0–150)    : Hook — "VINTED TRANSMET TES DONNÉES AU FISC"
 *   5–15s  (150–450)  : Problème — compteurs DAC7 qui montent
 *   15–22s (450–660)  : Agitation — alerte rouge pulsante
 *   22–38s (660–1140) : Solution — dashboard Revendu
 *   38–45s (1140–1350): CTA — logo + revendu.fr
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { colors, font, radius } from "../components/tokens";
import { Logo } from "../components/Logo";
import { DashboardMock } from "../components/DashboardMock";
import { AlertBadge } from "../components/PlatformBadge";

// ─── Scene 1: Hook ────────────────────────────────────────────────────────────
function SceneHook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const subtitleIn = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 100 } });

  const titleScale = interpolate(titleIn, [0, 1], [0.7, 1]);
  const subtitleOpacity = interpolate(subtitleIn, [0, 1], [0, 1]);

  // Pulsing red glow
  const pulse = Math.sin(frame * 0.2) * 0.4 + 0.6;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, ${colors.bg} 70%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 60px",
    }}>
      {/* Alarm icon */}
      <div style={{
        fontSize: 80,
        marginBottom: 24,
        transform: `scale(${0.9 + pulse * 0.1})`,
        filter: `drop-shadow(0 0 20px rgba(239,68,68,${pulse}))`,
      }}>
        🚨
      </div>

      {/* Main title */}
      <div style={{
        transform: `scale(${titleScale})`,
        textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{
          fontFamily: font.family,
          fontSize: 64,
          fontWeight: 900,
          color: colors.textPrimary,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
        }}>
          VINTED TRANSMET
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 64,
          fontWeight: 900,
          color: colors.red,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
          textShadow: `0 0 30px ${colors.red}80`,
        }}>
          TES DONNÉES
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 64,
          fontWeight: 900,
          color: colors.textPrimary,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
        }}>
          AU FISC
        </div>
      </div>

      {/* Sub */}
      <div style={{
        opacity: subtitleOpacity,
        fontFamily: font.family,
        fontSize: 26,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 1.4,
      }}>
        Si tu vends sur Vinted ou Leboncoin,{"\n"}écoute bien ce qui suit...
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2: Problème — compteurs DAC7 ──────────────────────────────────────
function SceneProblem() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const titleOpacity = interpolate(titleIn, [0, 1], [0, 1]);
  const titleY = interpolate(titleIn, [0, 1], [-30, 0]);

  // Compteur transactions (monte de 0 à 30)
  const txProgress = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 40 } });
  const txValue = Math.round(interpolate(txProgress, [0, 1], [0, 30], { extrapolateRight: "clamp" }));

  // Compteur euros (monte de 0 à 2000)
  const rxProgress = spring({ frame: frame - 50, fps, config: { damping: 18, stiffness: 40 } });
  const rxValue = Math.round(interpolate(rxProgress, [0, 1], [0, 2000], { extrapolateRight: "clamp" }));

  const txDone = txValue >= 30;
  const rxDone = rxValue >= 2000;

  const flashTx = txDone ? Math.sin(frame * 0.4) * 0.4 + 0.6 : 0;
  const flashRx = rxDone ? Math.sin(frame * 0.4) * 0.4 + 0.6 : 0;

  return (
    <AbsoluteFill style={{
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 60px",
      gap: 40,
    }}>
      {/* Title */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: font.family,
          fontSize: 32,
          fontWeight: 800,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}>
          La règle DAC7 (2024)
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 22,
          color: colors.textMuted,
        }}>
          L'un ou l'autre suffit
        </div>
      </div>

      {/* Two counters */}
      <div style={{ display: "flex", gap: 30, width: "100%" }}>
        {/* Transactions */}
        <div style={{
          flex: 1,
          background: txDone ? `rgba(239,68,68,${0.05 + flashTx * 0.1})` : colors.bgCard,
          border: `2px solid ${txDone ? `rgba(239,68,68,${0.3 + flashTx * 0.4})` : colors.border}`,
          borderRadius: radius.xl,
          padding: "30px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          transition: "none",
        }}>
          <div style={{ fontSize: 44 }}>🛍️</div>
          <div style={{
            fontFamily: font.family,
            fontSize: 72,
            fontWeight: 900,
            color: txDone ? colors.red : colors.textPrimary,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textShadow: txDone ? `0 0 30px ${colors.red}80` : "none",
          }}>
            {txValue}
          </div>
          <div style={{
            fontFamily: font.family,
            fontSize: 18,
            color: colors.textSecondary,
            textAlign: "center",
          }}>
            ventes / an
          </div>
          {txDone && (
            <div style={{
              fontFamily: font.family,
              fontSize: 14,
              fontWeight: 700,
              color: colors.red,
              background: `${colors.red}20`,
              border: `1px solid ${colors.red}40`,
              padding: "4px 12px",
              borderRadius: radius.full,
              opacity: 0.7 + flashTx * 0.3,
            }}>
              🚨 SEUIL ATTEINT
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: font.family,
            fontSize: 28,
            fontWeight: 800,
            color: colors.textMuted,
          }}>OU</div>
        </div>

        {/* Recettes */}
        <div style={{
          flex: 1,
          background: rxDone ? `rgba(239,68,68,${0.05 + flashRx * 0.1})` : colors.bgCard,
          border: `2px solid ${rxDone ? `rgba(239,68,68,${0.3 + flashRx * 0.4})` : colors.border}`,
          borderRadius: radius.xl,
          padding: "30px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}>
          <div style={{ fontSize: 44 }}>💶</div>
          <div style={{
            fontFamily: font.family,
            fontSize: 72,
            fontWeight: 900,
            color: rxDone ? colors.red : colors.textPrimary,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textShadow: rxDone ? `0 0 30px ${colors.red}80` : "none",
          }}>
            {rxValue >= 1000 ? `${(rxValue / 1000).toFixed(1)}k` : rxValue}
          </div>
          <div style={{
            fontFamily: font.family,
            fontSize: 18,
            color: colors.textSecondary,
            textAlign: "center",
          }}>
            € de recettes
          </div>
          {rxDone && (
            <div style={{
              fontFamily: font.family,
              fontSize: 14,
              fontWeight: 700,
              color: colors.red,
              background: `${colors.red}20`,
              border: `1px solid ${colors.red}40`,
              padding: "4px 12px",
              borderRadius: radius.full,
              opacity: 0.7 + flashRx * 0.3,
            }}>
              🚨 SEUIL ATTEINT
            </div>
          )}
        </div>
      </div>

      {/* Arrow + DGFIP */}
      {(txDone || rxDone) && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontSize: 36 }}>⬇️</div>
          <div style={{
            fontFamily: font.family,
            fontSize: 20,
            fontWeight: 700,
            color: colors.red,
            textAlign: "center",
          }}>
            Vinted informe la DGFIP automatiquement
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Scene 3: Agitation ───────────────────────────────────────────────────────
function SceneAgitation() {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.25) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(239,68,68,0.2) 0%, ${colors.bg} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 60px",
      gap: 32,
    }}>
      <div style={{
        fontSize: 100,
        filter: `drop-shadow(0 0 40px rgba(239,68,68,${0.5 + pulse * 0.5}))`,
        transform: `scale(${0.95 + pulse * 0.05})`,
      }}>
        🚨
      </div>

      <AlertBadge level="exceeded" />

      <div style={{
        fontFamily: font.family,
        fontSize: 38,
        fontWeight: 900,
        color: colors.textPrimary,
        textAlign: "center",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      }}>
        Tous tes revenus
        <br />
        <span style={{ color: colors.red }}>peuvent être imposables</span>
        <br />
        depuis le 1er euro
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 22,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 1.5,
        opacity: 0.5 + pulse * 0.3,
      }}>
        La plupart des revendeurs l'apprennent trop tard.
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 4: Solution — Dashboard ───────────────────────────────────────────
function SceneSolution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const titleOpacity = interpolate(titleIn, [0, 1], [0, 1]);
  const titleY = interpolate(titleIn, [0, 1], [-20, 0]);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.15) 0%, ${colors.bg} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 60,
      gap: 24,
    }}>
      {/* Header */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        textAlign: "center",
        padding: "0 60px",
      }}>
        <div style={{
          fontFamily: font.family,
          fontSize: 28,
          fontWeight: 800,
          color: colors.primary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}>
          ✅ La solution
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 42,
          fontWeight: 900,
          color: colors.textPrimary,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}>
          Track tes profits +{"\n"}
          <span style={{ color: colors.primary }}>alerte avant le seuil</span>
        </div>
      </div>

      {/* Dashboard mock — scaled down for 9:16 */}
      <div style={{ transform: "scale(0.88)", transformOrigin: "top center", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DashboardMock
            delay={8}
            thresholdPct={45}
            showStats
            showChart
            showAlert
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 5: CTA ─────────────────────────────────────────────────────────────
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const logoScale = interpolate(logoIn, [0, 1], [0.6, 1]);
  const logoOpacity = interpolate(logoIn, [0, 1], [0, 1]);

  const textIn = spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 100 } });
  const textOpacity = interpolate(textIn, [0, 1], [0, 1]);
  const textY = interpolate(textIn, [0, 1], [20, 0]);

  const pulse = Math.sin(frame * 0.15) * 0.08 + 0.92;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, ${colors.bg} 65%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 36,
    }}>
      {/* Logo */}
      <div style={{
        opacity: logoOpacity,
        transform: `scale(${logoScale * pulse})`,
      }}>
        <Logo size={60} showTagline />
      </div>

      {/* Free badge */}
      <div style={{
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          fontFamily: font.family,
          fontSize: 80,
          fontWeight: 900,
          color: colors.emerald,
          letterSpacing: "-0.04em",
          textShadow: `0 0 40px ${colors.emerald}60`,
        }}>
          GRATUIT
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 32,
          color: colors.textSecondary,
        }}>
          pour commencer
        </div>

        {/* URL */}
        <div style={{
          fontFamily: font.family,
          fontSize: 36,
          fontWeight: 800,
          color: colors.textPrimary,
          background: colors.bgCard,
          border: `2px solid ${colors.primary}60`,
          borderRadius: radius.xl,
          padding: "12px 32px",
          boxShadow: `0 0 30px ${colors.primary}30`,
        }}>
          revendu.fr
        </div>

        <div style={{
          fontFamily: font.family,
          fontSize: 24,
          color: colors.textMuted,
        }}>
          🔗 Lien en bio
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────
export function YoutubeShorts() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Sequence from={0}   durationInFrames={150}><SceneHook /></Sequence>
      <Sequence from={150} durationInFrames={300}><SceneProblem /></Sequence>
      <Sequence from={450} durationInFrames={210}><SceneAgitation /></Sequence>
      <Sequence from={660} durationInFrames={480}><SceneSolution /></Sequence>
      <Sequence from={1140} durationInFrames={210}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
}

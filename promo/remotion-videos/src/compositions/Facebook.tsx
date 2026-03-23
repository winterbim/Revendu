/**
 * Facebook — 1080×1080 (1:1) — 60 secondes @ 30fps = 1800 frames
 * Ton : éducatif, rassurant, audience 25-45 ans
 *
 * Scènes :
 *   0–8s   (0–240)    : Question d'accroche
 *   8–22s  (240–660)  : Explication DAC7
 *   22–45s (660–1350) : Dashboard en action
 *   45–55s (1350–1650): Features list
 *   55–60s (1650–1800): CTA
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { colors, font, radius } from "../components/tokens";
import { Logo } from "../components/Logo";
import { DashboardMock } from "../components/DashboardMock";
import { AlertBadge } from "../components/PlatformBadge";

function FadeIn({ children, delay = 0, dir = "up" as "up" | "right" | "none" }: {
  children: React.ReactNode; delay?: number; dir?: "up" | "right" | "none";
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 100 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const tx = dir === "right" ? interpolate(s, [0, 1], [-24, 0]) : 0;
  const ty = dir === "up" ? interpolate(s, [0, 1], [20, 0]) : 0;
  return (
    <div style={{ opacity, transform: `translate(${tx}px, ${ty}px)` }}>
      {children}
    </div>
  );
}

// ─── Scene 1 ──────────────────────────────────────────────────────────────────
function SceneFBHook() {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, ${colors.bg} 70%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px",
      gap: 28,
    }}>
      <FadeIn delay={0}>
        <div style={{
          fontFamily: font.family,
          fontSize: 20,
          fontWeight: 600,
          color: colors.primary,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}>
          Une question importante
        </div>
      </FadeIn>

      <FadeIn delay={10}>
        <div style={{
          fontFamily: font.family,
          fontSize: 58,
          fontWeight: 900,
          color: colors.textPrimary,
          textAlign: "center",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}>
          Tu vends sur Vinted,{"\n"}
          Leboncoin{"\n"}
          ou eBay ?
        </div>
      </FadeIn>

      <FadeIn delay={25}>
        <div style={{
          fontFamily: font.family,
          fontSize: 24,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 700,
        }}>
          Cette vidéo va peut-être te sauver{"\n"}
          d'une mauvaise surprise avec le fisc.
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

// ─── Scene 2: Explication DAC7 ────────────────────────────────────────────────
function SceneFBDAC7() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 80px",
      gap: 32,
    }}>
      <FadeIn delay={0}>
        <div style={{
          fontFamily: font.family,
          fontSize: 18,
          fontWeight: 700,
          color: colors.primary,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}>
          Depuis janvier 2024 — Règle DAC7
        </div>
      </FadeIn>

      <FadeIn delay={8}>
        <div style={{
          fontFamily: font.family,
          fontSize: 36,
          fontWeight: 800,
          color: colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}>
          Vinted, Leboncoin, eBay sont obligés{"\n"}
          d'informer le fisc automatiquement
        </div>
      </FadeIn>

      {/* Two columns */}
      <div style={{ display: "flex", gap: 24, width: "100%" }}>
        <FadeIn delay={20} dir="right">
          <div style={{
            flex: 1,
            background: "rgba(239,68,68,0.08)",
            border: `1.5px solid ${colors.red}40`,
            borderRadius: radius.xl,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 50 }}>🛍️</span>
            <div style={{
              fontFamily: font.family,
              fontSize: 56,
              fontWeight: 900,
              color: colors.red,
              lineHeight: 1,
            }}>30</div>
            <div style={{
              fontFamily: font.family,
              fontSize: 18,
              color: colors.textSecondary,
              textAlign: "center",
            }}>
              transactions / an
            </div>
          </div>
        </FadeIn>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: font.family, fontSize: 28, fontWeight: 800, color: colors.textMuted }}>
            OU
          </div>
        </div>

        <FadeIn delay={30} dir="right">
          <div style={{
            flex: 1,
            background: "rgba(239,68,68,0.08)",
            border: `1.5px solid ${colors.red}40`,
            borderRadius: radius.xl,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 50 }}>💶</span>
            <div style={{
              fontFamily: font.family,
              fontSize: 56,
              fontWeight: 900,
              color: colors.red,
              lineHeight: 1,
            }}>2k€</div>
            <div style={{
              fontFamily: font.family,
              fontSize: 18,
              color: colors.textSecondary,
              textAlign: "center",
            }}>
              de recettes / an
            </div>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={45}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: font.family,
          fontSize: 18,
          color: colors.textSecondary,
          textAlign: "center",
          background: "rgba(239,68,68,0.06)",
          border: `1px solid ${colors.red}30`,
          borderRadius: radius.lg,
          padding: "12px 20px",
        }}>
          ⬇️ &nbsp; La plateforme transmet vos données à la DGFIP automatiquement
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

// ─── Scene 3: Dashboard ───────────────────────────────────────────────────────
function SceneFBDashboard() {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, ${colors.bg} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      padding: "40px 60px",
    }}>
      <FadeIn delay={0}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: font.family,
            fontSize: 18,
            fontWeight: 700,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}>
            La solution
          </div>
          <div style={{
            fontFamily: font.family,
            fontSize: 42,
            fontWeight: 900,
            color: colors.textPrimary,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}>
            Revendu — ton tableau de bord{"\n"}
            <span style={{ color: colors.primary }}>de revendeur</span>
          </div>
        </div>
      </FadeIn>

      <div style={{ transform: "scale(0.95)", transformOrigin: "top center" }}>
        <DashboardMock delay={8} thresholdPct={45} showStats showChart showAlert />
      </div>

      <FadeIn delay={20}>
        <AlertBadge level="safe" />
      </FadeIn>
    </AbsoluteFill>
  );
}

// ─── Scene 4: Features ────────────────────────────────────────────────────────
function SceneFBFeatures() {
  const features = [
    { icon: "📊", text: "Calcul du bénéfice net automatique", delay: 0 },
    { icon: "🚨", text: "Alertes DAC7 en temps réel", delay: 12 },
    { icon: "📁", text: "Export Excel + PDF pour ta déclaration", delay: 24 },
    { icon: "📧", text: "Sync Gmail — import auto des ventes", delay: 36 },
    { icon: "✅", text: "Vinted · Leboncoin · eBay · Vestiaire", delay: 48 },
  ];

  return (
    <AbsoluteFill style={{
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 80px",
      gap: 20,
    }}>
      <FadeIn delay={0}>
        <div style={{
          fontFamily: font.family,
          fontSize: 36,
          fontWeight: 900,
          color: colors.textPrimary,
          textAlign: "center",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}>
          Ce que fait Revendu
        </div>
      </FadeIn>

      {features.map((f) => (
        <FadeIn key={f.text} delay={f.delay} dir="right">
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            width: 700,
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            padding: "16px 20px",
          }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{f.icon}</span>
            <span style={{
              fontFamily: font.family,
              fontSize: 20,
              fontWeight: 600,
              color: colors.textPrimary,
            }}>
              {f.text}
            </span>
          </div>
        </FadeIn>
      ))}
    </AbsoluteFill>
  );
}

// ─── Scene 5: CTA ─────────────────────────────────────────────────────────────
function SceneFBCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });
  const pulse = Math.sin(frame * 0.12) * 0.05 + 0.95;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, ${colors.bg} 65%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
    }}>
      <div style={{
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `scale(${interpolate(s, [0, 1], [0.7, 1]) * pulse})`,
      }}>
        <Logo size={52} showTagline />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{
          fontFamily: font.family,
          fontSize: 22,
          fontWeight: 700,
          color: colors.emerald,
          background: colors.emeraldDim,
          border: `1.5px solid ${colors.emerald}40`,
          padding: "10px 20px",
          borderRadius: radius.full,
        }}>
          🆓 Gratuit pour commencer
        </div>
        <div style={{
          fontFamily: font.family,
          fontSize: 22,
          fontWeight: 700,
          color: colors.primary,
          background: colors.primaryDim,
          border: `1.5px solid ${colors.primary}40`,
          padding: "10px 20px",
          borderRadius: radius.full,
        }}>
          💼 Version Pro disponible
        </div>
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 48,
        fontWeight: 900,
        color: colors.textPrimary,
        background: colors.bgCard,
        border: `2px solid ${colors.primary}60`,
        borderRadius: radius.xl,
        padding: "16px 40px",
        boxShadow: `0 0 40px ${colors.primary}30`,
        transform: `scale(${pulse})`,
      }}>
        revendu.fr
      </div>
    </AbsoluteFill>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Facebook() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Sequence from={0}    durationInFrames={240}> <SceneFBHook /></Sequence>
      <Sequence from={240}  durationInFrames={420}> <SceneFBDAC7 /></Sequence>
      <Sequence from={660}  durationInFrames={690}> <SceneFBDashboard /></Sequence>
      <Sequence from={1350} durationInFrames={300}> <SceneFBFeatures /></Sequence>
      <Sequence from={1650} durationInFrames={150}> <SceneFBCTA /></Sequence>
    </AbsoluteFill>
  );
}

/**
 * LinkedIn — 1920×1080 (16:9) — 60 secondes @ 30fps = 1800 frames
 * Ton : professionnel, sobre, premium
 *
 * Scènes :
 *   0–8s   (0–240)    : Accroche pro — marché 12M utilisateurs
 *   8–20s  (240–600)  : Contexte réglementaire DAC7
 *   20–42s (600–1260) : Dashboard desktop
 *   42–52s (1260–1560): Stack tech + sécurité
 *   52–60s (1560–1800): CTA professionnel
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { colors, font, radius } from "../components/tokens";
import { Logo } from "../components/Logo";
import { DashboardMock } from "../components/DashboardMock";
import { AlertBadge } from "../components/PlatformBadge";

function SlideIn({ children, delay = 0, from = "bottom" as "bottom" | "left" | "right" }: {
  children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right";
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 110 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const tx = from === "left" ? interpolate(s, [0, 1], [-40, 0]) : from === "right" ? interpolate(s, [0, 1], [40, 0]) : 0;
  const ty = from === "bottom" ? interpolate(s, [0, 1], [30, 0]) : 0;
  return <div style={{ opacity, transform: `translate(${tx}px, ${ty}px)` }}>{children}</div>;
}

// ─── Scene 1: Accroche Marché ─────────────────────────────────────────────────
function SceneLIMarket() {
  const stats = [
    { label: "Utilisateurs Vinted France", value: "23M+", icon: "👗" },
    { label: "Visiteurs Leboncoin / mois", value: "30M+", icon: "🏠" },
    { label: "Français vendant en ligne", value: "12M+", icon: "📦" },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, #0d0d1a 0%, ${colors.bg} 100%)`,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "80px 100px",
      gap: 80,
    }}>
      {/* Left: text */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <SlideIn delay={0} from="left">
          <div style={{
            fontFamily: font.family,
            fontSize: 18,
            fontWeight: 600,
            color: colors.primaryLight,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}>
            Le marché de la revente en ligne
          </div>
        </SlideIn>
        <SlideIn delay={8} from="left">
          <div style={{
            fontFamily: font.family,
            fontSize: 56,
            fontWeight: 900,
            color: colors.textPrimary,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}>
            12 millions de Français{"\n"}
            vendent en ligne.
          </div>
        </SlideIn>
        <SlideIn delay={18} from="left">
          <div style={{
            fontFamily: font.family,
            fontSize: 24,
            color: colors.textSecondary,
            lineHeight: 1.5,
          }}>
            La plupart ignorent leurs{"\n"}
            obligations fiscales DAC7.
          </div>
        </SlideIn>
      </div>

      {/* Right: stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 360 }}>
        {stats.map((s, i) => (
          <SlideIn key={s.label} delay={i * 12 + 5} from="right">
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              <span style={{ fontSize: 36 }}>{s.icon}</span>
              <div>
                <div style={{
                  fontFamily: font.family,
                  fontSize: 36,
                  fontWeight: 900,
                  color: colors.primary,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontFamily: font.family,
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 2,
                }}>
                  {s.label}
                </div>
              </div>
            </div>
          </SlideIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2: Contexte DAC7 ───────────────────────────────────────────────────
function SceneLIDAC7() {
  return (
    <AbsoluteFill style={{
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 100px",
      gap: 40,
    }}>
      <SlideIn delay={0}>
        <div style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{
            fontFamily: font.family,
            fontSize: 16,
            fontWeight: 700,
            color: colors.primaryLight,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}>
            Directive européenne — Janvier 2024
          </div>
          <div style={{
            fontFamily: font.family,
            fontSize: 48,
            fontWeight: 900,
            color: colors.textPrimary,
            letterSpacing: "-0.03em",
          }}>
            La règle DAC7
          </div>
        </div>
      </SlideIn>

      <div style={{ display: "flex", gap: 32, width: "100%" }}>
        <SlideIn delay={12} from="left">
          <div style={{
            flex: 1,
            background: "rgba(239,68,68,0.07)",
            border: `1.5px solid ${colors.red}35`,
            borderRadius: radius.xl,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 48 }}>🛍️</span>
            <div style={{ fontFamily: font.family, fontSize: 64, fontWeight: 900, color: colors.red, lineHeight: 1 }}>30</div>
            <div style={{ fontFamily: font.family, fontSize: 18, color: colors.textSecondary, textAlign: "center" }}>
              transactions / an
            </div>
            <div style={{ fontFamily: font.family, fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
              quel que soit le montant
            </div>
          </div>
        </SlideIn>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8px" }}>
          <div style={{ fontFamily: font.family, fontSize: 24, fontWeight: 800, color: colors.textMuted }}>OU</div>
        </div>

        <SlideIn delay={20} from="right">
          <div style={{
            flex: 1,
            background: "rgba(239,68,68,0.07)",
            border: `1.5px solid ${colors.red}35`,
            borderRadius: radius.xl,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 48 }}>💶</span>
            <div style={{ fontFamily: font.family, fontSize: 64, fontWeight: 900, color: colors.red, lineHeight: 1 }}>2k€</div>
            <div style={{ fontFamily: font.family, fontSize: 18, color: colors.textSecondary, textAlign: "center" }}>
              de recettes / an
            </div>
            <div style={{ fontFamily: font.family, fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
              prix de vente bruts
            </div>
          </div>
        </SlideIn>
      </div>

      <SlideIn delay={30}>
        <div style={{
          fontFamily: font.family,
          fontSize: 22,
          color: colors.textSecondary,
          textAlign: "center",
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          padding: "14px 28px",
          lineHeight: 1.5,
        }}>
          → La plateforme transmet automatiquement nom, prénom et total des ventes à la DGFIP
        </div>
      </SlideIn>
    </AbsoluteFill>
  );
}

// ─── Scene 3: Dashboard Desktop ──────────────────────────────────────────────
function SceneLIDashboard() {
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.12) 0%, ${colors.bg} 60%)`,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "60px 80px",
      gap: 60,
    }}>
      {/* Left side: text */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <SlideIn delay={0} from="left">
          <div>
            <div style={{
              fontFamily: font.family,
              fontSize: 16,
              fontWeight: 700,
              color: colors.primaryLight,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}>
              La solution
            </div>
            <div style={{
              fontFamily: font.family,
              fontSize: 48,
              fontWeight: 900,
              color: colors.textPrimary,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              Revendu
            </div>
            <div style={{
              fontFamily: font.family,
              fontSize: 22,
              color: colors.primary,
              marginTop: 6,
              lineHeight: 1.4,
            }}>
              Tracker de profit &{"\n"}alertes fiscales DAC7
            </div>
          </div>
        </SlideIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "📊 Bénéfice net en temps réel",
            "🚨 Alertes avant les seuils DAC7",
            "📁 Export Excel/PDF déclaration",
            "📧 Sync Gmail automatique",
          ].map((f, i) => (
            <SlideIn key={f} delay={i * 10 + 8} from="left">
              <div style={{
                fontFamily: font.family,
                fontSize: 17,
                color: colors.textSecondary,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                {f}
              </div>
            </SlideIn>
          ))}
        </div>

        <SlideIn delay={45} from="left">
          <AlertBadge level="safe" />
        </SlideIn>
      </div>

      {/* Right side: dashboard */}
      <div style={{ flex: 1.2 }}>
        <SlideIn delay={5} from="right">
          <DashboardMock delay={8} thresholdPct={45} showStats showChart showAlert />
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 4: Stack & Sécurité ────────────────────────────────────────────────
function SceneLIStack() {
  const stack = [
    { category: "Backend", items: ["FastAPI (Python 3.11)", "PostgreSQL 15", "JWT Auth", "Railway"] },
    { category: "Frontend", items: ["Next.js 14 App Router", "TypeScript strict", "Tailwind + shadcn/ui", "Vercel"] },
    { category: "Sécurité", items: ["🔒 Données isolées par user", "🇫🇷 Hébergement Europe", "🔐 Chiffrement bout-en-bout", "✅ Conforme RGPD"] },
  ];

  return (
    <AbsoluteFill style={{
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 100px",
      gap: 32,
    }}>
      <SlideIn delay={0}>
        <div style={{
          fontFamily: font.family,
          fontSize: 40,
          fontWeight: 900,
          color: colors.textPrimary,
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}>
          Stack technique & Sécurité
        </div>
      </SlideIn>

      <div style={{ display: "flex", gap: 24, width: "100%" }}>
        {stack.map((col, i) => (
          <SlideIn key={col.category} delay={i * 12 + 8} from="bottom">
            <div style={{
              flex: 1,
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: "24px 20px",
            }}>
              <div style={{
                fontFamily: font.family,
                fontSize: 14,
                fontWeight: 700,
                color: colors.primaryLight,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}>
                {col.category}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.items.map((item) => (
                  <div key={item} style={{
                    fontFamily: font.family,
                    fontSize: 15,
                    color: colors.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: colors.primary, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </SlideIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 5: CTA Pro ─────────────────────────────────────────────────────────
function SceneLICTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const pulse = Math.sin(frame * 0.1) * 0.04 + 0.96;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, ${colors.bg} 65%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
    }}>
      <div style={{
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `scale(${interpolate(s, [0, 1], [0.8, 1]) * pulse})`,
      }}>
        <Logo size={64} showTagline />
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{
          background: colors.emeraldDim,
          border: `1.5px solid ${colors.emerald}40`,
          borderRadius: radius.full,
          padding: "12px 28px",
          fontFamily: font.family,
          fontSize: 20,
          fontWeight: 700,
          color: colors.emerald,
        }}>
          🆓 Gratuit pour commencer
        </div>
        <div style={{
          background: colors.primaryDim,
          border: `1.5px solid ${colors.primary}40`,
          borderRadius: radius.full,
          padding: "12px 28px",
          fontFamily: font.family,
          fontSize: 20,
          fontWeight: 700,
          color: colors.primary,
        }}>
          💼 Pro — 9,90€ / mois
        </div>
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 56,
        fontWeight: 900,
        color: colors.textPrimary,
        background: colors.bgCard,
        border: `2px solid ${colors.primary}60`,
        borderRadius: radius.xl,
        padding: "16px 50px",
        boxShadow: `0 0 50px ${colors.primary}35`,
        transform: `scale(${pulse})`,
        letterSpacing: "-0.02em",
      }}>
        revendu.fr
      </div>

      <div style={{
        fontFamily: font.family,
        fontSize: 20,
        color: colors.textMuted,
        textAlign: "center",
      }}>
        #SaaS #Startup #DAC7 #Vinted #Fiscalité #IndieHacker
      </div>
    </AbsoluteFill>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LinkedIn() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Sequence from={0}    durationInFrames={240}> <SceneLIMarket /></Sequence>
      <Sequence from={240}  durationInFrames={360}> <SceneLIDAC7 /></Sequence>
      <Sequence from={600}  durationInFrames={660}> <SceneLIDashboard /></Sequence>
      <Sequence from={1260} durationInFrames={300}> <SceneLIStack /></Sequence>
      <Sequence from={1560} durationInFrames={240}> <SceneLICTA /></Sequence>
    </AbsoluteFill>
  );
}

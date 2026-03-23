import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font, radius } from "./tokens";
import { StatsCard } from "./StatsCard";
import { ThresholdGauge } from "./ThresholdGauge";
import { PlatformRow } from "./PlatformBadge";

interface DashboardMockProps {
  delay?: number;
  scale?: number;
  thresholdPct?: number; // 0-120, contrôle la jauge animée
  showStats?: boolean;
  showChart?: boolean;
  showAlert?: boolean;
}

export function DashboardMock({
  delay = 0,
  scale = 1,
  thresholdPct = 45,
  showStats = true,
  showChart = true,
  showAlert = false,
}: DashboardMockProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Full dashboard slide in
  const appear = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 100 } });
  const opacity = interpolate(appear, [0, 1], [0, 1]);
  const translateY = interpolate(appear, [0, 1], [40, 0]);

  const alertPct = thresholdPct >= 85 ? thresholdPct : 34;
  const txPct = Math.min(thresholdPct, 100);
  const rxPct = Math.min(thresholdPct * 0.9, 100);

  return (
    <div style={{
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      transformOrigin: "center top",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.xl,
      overflow: "hidden",
      width: 580,
      fontFamily: font.family,
      boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${colors.border}`,
    }}>
      {/* TopBar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: `1px solid ${colors.border}`,
        background: `${colors.bg}e0`,
        backdropFilter: "blur(10px)",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary, letterSpacing: "-0.02em" }}>
            Tableau de bord
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>Vue d'ensemble 2026</div>
        </div>
        {/* Alert pill */}
        {showAlert && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: txPct >= 85 ? colors.redDim : txPct >= 70 ? colors.amberDim : colors.emeraldDim,
            border: `1px solid ${txPct >= 85 ? `${colors.red}40` : txPct >= 70 ? `${colors.amber}40` : `${colors.emerald}40`}`,
            borderRadius: radius.full,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: txPct >= 85 ? colors.red : txPct >= 70 ? colors.amber : colors.emerald,
          }}>
            <span>{txPct >= 85 ? "🚨" : txPct >= 70 ? "⚠️" : "✅"}</span>
            {txPct >= 85 ? "Danger DAC7" : txPct >= 70 ? "Attention DAC7" : "Sécurisé"}
          </div>
        )}
        {/* Avatar */}
        <div style={{
          width: 30, height: 30,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))",
          border: `1px solid rgba(99,102,241,0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#a5b4fc",
        }}>
          ML
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        {/* Stats cards */}
        {showStats && (
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <StatsCard
              label="Bénéfice net"
              value=""
              sub="Année 2026"
              color={colors.emerald}
              delay={delay + 5}
              animateValue={{
                from: 0,
                to: 312,
                format: (v) => `+${Math.round(v)}€`,
              }}
            />
            <StatsCard
              label="Recettes brutes"
              value=""
              sub="Total DAC7"
              color={colors.primary}
              delay={delay + 10}
              animateValue={{
                from: 0,
                to: 1847,
                format: (v) => `${Math.round(v)}€`,
              }}
            />
            <StatsCard
              label="Ventes"
              value=""
              sub={`${Math.round(txPct * 0.3)} / 30 DAC7`}
              color={colors.amber}
              delay={delay + 15}
              animateValue={{
                from: 0,
                to: Math.round(txPct * 0.3),
                format: (v) => String(Math.round(v)),
              }}
            />
          </div>
        )}

        {/* DAC7 Gauges */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          padding: "14px 16px",
          marginBottom: showChart ? 16 : 0,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: colors.textSecondary,
            marginBottom: 14,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Seuils DAC7
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ThresholdGauge
              label="Transactions"
              current={Math.round(txPct * 0.3)}
              max={30}
              targetPct={txPct}
              delay={delay + 8}
              width={530}
            />
            <ThresholdGauge
              label="Recettes (€)"
              current={Math.round(rxPct * 20)}
              max={2000}
              targetPct={rxPct}
              delay={delay + 12}
              width={530}
            />
          </div>
        </div>

        {/* Platform breakdown */}
        {showChart && (
          <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            padding: "14px 16px",
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: colors.textSecondary,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Profit par plateforme
            </div>
            <PlatformRow platform="vinted"    profit={142} pct={46} delay={delay + 15} />
            <PlatformRow platform="leboncoin" profit={97}  pct={31} delay={delay + 20} />
            <PlatformRow platform="ebay"      profit={73}  pct={23} delay={delay + 25} />
          </div>
        )}
      </div>
    </div>
  );
}

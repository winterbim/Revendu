import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font, radius } from "./tokens";

const PLATFORMS: Record<string, { label: string; color: string; dot: string }> = {
  vinted:     { label: "Vinted",     color: "#09B183", dot: "#09B183" },
  leboncoin:  { label: "Leboncoin",  color: "#f97316", dot: "#f97316" },
  ebay:       { label: "eBay",       color: "#e53e3e", dot: "#e53e3e" },
  vestiaire:  { label: "Vestiaire",  color: "#d69e2e", dot: "#d69e2e" },
};

interface PlatformRowProps {
  platform: string;
  profit: number;
  pct: number;
  delay?: number;
  barWidth?: number;
}

export function PlatformRow({ platform, profit, pct, delay = 0, barWidth = 200 }: PlatformRowProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 100 } });
  const opacity = interpolate(appear, [0, 1], [0, 1]);
  const translateX = interpolate(appear, [0, 1], [-20, 0]);

  const fillProgress = spring({ frame: frame - delay - 5, fps, config: { damping: 22, stiffness: 60 } });
  const fillPct = interpolate(fillProgress, [0, 1], [0, pct], { extrapolateRight: "clamp" });

  const cfg = PLATFORMS[platform] ?? { label: platform, color: colors.primary, dot: colors.primary };

  return (
    <div style={{
      opacity,
      transform: `translateX(${translateX}px)`,
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    }}>
      {/* Dot */}
      <div style={{
        width: 8, height: 8,
        borderRadius: "50%",
        background: cfg.dot,
        boxShadow: `0 0 6px ${cfg.dot}80`,
        flexShrink: 0,
      }} />

      {/* Label */}
      <span style={{
        fontFamily: font.family,
        fontSize: 13,
        color: colors.textSecondary,
        width: 80,
        flexShrink: 0,
      }}>
        {cfg.label}
      </span>

      {/* Bar */}
      <div style={{
        flex: 1,
        height: 6,
        background: "rgba(255,255,255,0.06)",
        borderRadius: radius.full,
        overflow: "hidden",
        width: barWidth,
      }}>
        <div style={{
          height: "100%",
          width: `${fillPct}%`,
          background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
          borderRadius: radius.full,
        }} />
      </div>

      {/* Value */}
      <span style={{
        fontFamily: font.family,
        fontSize: 13,
        fontWeight: 700,
        color: colors.emerald,
        width: 60,
        textAlign: "right",
        flexShrink: 0,
      }}>
        +{profit}€
      </span>
    </div>
  );
}

export function AlertBadge({ level, delay = 0 }: { level: "safe" | "warning" | "danger" | "exceeded"; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 200 } });
  const scale = interpolate(appear, [0, 1], [0.5, 1]);
  const opacity = interpolate(appear, [0, 1], [0, 1]);

  const cfgs = {
    safe:     { icon: "✅", text: "Seuils DAC7 sécurisés", bg: colors.emeraldDim, border: `${colors.emerald}40`, color: colors.emerald },
    warning:  { icon: "⚠️", text: "70% du seuil DAC7 atteint", bg: colors.amberDim, border: `${colors.amber}40`, color: colors.amber },
    danger:   { icon: "🔴", text: "85% du seuil DAC7 — danger", bg: colors.redDim, border: `${colors.red}40`, color: colors.red },
    exceeded: { icon: "🚨", text: "Seuil DAC7 DÉPASSÉ", bg: "rgba(220,38,38,0.2)", border: "rgba(220,38,38,0.5)", color: colors.exceeded },
  };
  const cfg = cfgs[level];

  // Pulse for danger/exceeded
  const pulse = (level === "danger" || level === "exceeded")
    ? Math.sin(frame * 0.12) * 0.15 + 0.85
    : 1;

  return (
    <div style={{
      opacity: opacity * pulse,
      transform: `scale(${scale})`,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: radius.full,
      padding: "8px 16px",
    }}>
      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
      <span style={{
        fontFamily: font.family,
        fontSize: 13,
        fontWeight: 700,
        color: cfg.color,
      }}>
        {cfg.text}
      </span>
    </div>
  );
}

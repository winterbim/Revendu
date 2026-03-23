import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font, radius } from "./tokens";

interface ThresholdGaugeProps {
  label: string;
  current: number;
  max: number;
  targetPct: number; // final percentage to animate to
  delay?: number;
  width?: number;
}

function getColor(pct: number) {
  if (pct >= 100) return colors.exceeded;
  if (pct >= 85) return colors.danger;
  if (pct >= 70) return colors.warning;
  return colors.emerald;
}

function getLabel(pct: number) {
  if (pct >= 100) return { text: "DÉPASSÉ", color: colors.exceeded };
  if (pct >= 85) return { text: "DANGER", color: colors.danger };
  if (pct >= 70) return { text: "ATTENTION", color: colors.warning };
  return { text: "SÉCURISÉ", color: colors.emerald };
}

export function ThresholdGauge({ label, current, max, targetPct, delay = 0, width = 400 }: ThresholdGaugeProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 100 } });
  const opacity = interpolate(appear, [0, 1], [0, 1]);

  const fillProgress = spring({ frame: frame - delay - 8, fps, config: { damping: 22, stiffness: 60 } });
  const pct = interpolate(fillProgress, [0, 1], [0, targetPct], { extrapolateRight: "clamp" });

  const barColor = getColor(targetPct);
  const statusLabel = getLabel(targetPct);
  const barWidth = Math.min(pct, 100);

  // Pulse effect when danger/exceeded
  const pulse = targetPct >= 85 ? Math.sin(frame * 0.15) * 0.3 + 0.7 : 1;

  return (
    <div style={{ opacity, width }}>
      {/* Header row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}>
        <span style={{
          fontFamily: font.family,
          fontSize: 13,
          fontWeight: 600,
          color: colors.textSecondary,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: font.family,
          fontSize: 11,
          fontWeight: 700,
          color: statusLabel.color,
          background: `${statusLabel.color}18`,
          border: `1px solid ${statusLabel.color}40`,
          padding: "2px 8px",
          borderRadius: radius.full,
          opacity: pulse,
        }}>
          {statusLabel.text}
        </span>
      </div>

      {/* Progress bar track */}
      <div style={{
        height: 10,
        background: "rgba(255,255,255,0.06)",
        borderRadius: radius.full,
        overflow: "hidden",
        marginBottom: 6,
        position: "relative",
      }}>
        {/* Threshold markers */}
        <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 1.5, background: "rgba(245,158,11,0.5)", zIndex: 2 }} />
        <div style={{ position: "absolute", left: "85%", top: 0, bottom: 0, width: 1.5, background: "rgba(239,68,68,0.5)", zIndex: 2 }} />

        {/* Fill */}
        <div style={{
          height: "100%",
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${barColor}90, ${barColor})`,
          borderRadius: radius.full,
          transition: "none",
          boxShadow: `0 0 8px ${barColor}60`,
        }} />
      </div>

      {/* Footer row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: font.family,
          fontSize: 12,
          color: barColor,
          fontWeight: 700,
        }}>
          {Math.round(pct)}%
        </span>
        <span style={{
          fontFamily: font.family,
          fontSize: 11,
          color: colors.textMuted,
        }}>
          {current} / {max} {label.includes("€") ? "" : "transactions"}
        </span>
      </div>
    </div>
  );
}

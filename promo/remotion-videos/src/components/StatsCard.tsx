import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font, radius } from "./tokens";

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  delay?: number;
  icon?: React.ReactNode;
  animateValue?: { from: number; to: number; format: (v: number) => string };
}

export function StatsCard({ label, value, sub, color = colors.primary, delay = 0, icon, animateValue }: StatsCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  const opacity = interpolate(appear, [0, 1], [0, 1]);
  const translateY = interpolate(appear, [0, 1], [20, 0]);

  let displayValue = value;
  if (animateValue) {
    const progress = spring({ frame: frame - delay - 10, fps, config: { damping: 20, stiffness: 80 } });
    const v = interpolate(progress, [0, 1], [animateValue.from, animateValue.to], { extrapolateRight: "clamp" });
    displayValue = animateValue.format(v);
  }

  return (
    <div style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: "20px 22px",
      flex: 1,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow top-left */}
      <div style={{
        position: "absolute",
        top: -20,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: `${color}20`,
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      {/* Icon + Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {icon && (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: radius.sm,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {icon}
          </div>
        )}
        <span style={{
          fontFamily: font.family,
          fontSize: 11,
          fontWeight: 600,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {label}
        </span>
      </div>

      {/* Value */}
      <div style={{
        fontFamily: font.family,
        fontSize: 28,
        fontWeight: 800,
        color: displayValue.startsWith("+") ? colors.emerald : displayValue.startsWith("-") ? colors.red : colors.textPrimary,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {displayValue}
      </div>

      {/* Sub */}
      {sub && (
        <div style={{
          fontFamily: font.family,
          fontSize: 11,
          color: colors.textMuted,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

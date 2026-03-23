import React from "react";
import { colors, font } from "./tokens";

export function Logo({ size = 32, showTagline = false }: { size?: number; showTagline?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.3,
      }}>
        {/* Icon */}
        <div style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: `linear-gradient(135deg, ${colors.primary}, #8b5cf6)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 ${size * 0.8}px rgba(99,102,241,0.4)`,
        }}>
          <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
            <path d="M3 17l4-4 4 4 4-6 4 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Wordmark */}
        <span style={{
          fontFamily: font.family,
          fontSize: size * 0.9,
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "-0.03em",
        }}>
          revendu
        </span>
      </div>
      {showTagline && (
        <span style={{
          fontFamily: font.family,
          fontSize: size * 0.38,
          color: colors.textSecondary,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          Tracker de profit · Alertes DAC7
        </span>
      )}
    </div>
  );
}

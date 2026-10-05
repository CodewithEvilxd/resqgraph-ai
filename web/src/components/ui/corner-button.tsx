"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CornerButtonVariant = "primary" | "secondary" | "danger" | "default";

export interface CornerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual theme variant: "primary" (slate-900), "secondary" (white/slate), "danger" (white/amber-red), or "default". */
  variant?: CornerButtonVariant;
  /** Icon rendered to the right of the label. */
  icon?: React.ReactNode;
  /** Show the default icon when no icon is provided. Set to false to hide it. @default true */
  showIcon?: boolean;
  /** Accent colour used for the button background and glow. */
  accentColor?: string;
  /** Custom text color. */
  textColor?: string;
  /** Custom background color for the button itself. */
  buttonBg?: string;
  /** Custom hover background color. */
  hoverBg?: string;
  /** Custom corner dot color. */
  dotColor?: string;
  /** Custom corner line color. */
  lineColor?: string;
  /** Extra classes applied to the outer wrapper div. */
  wrapperClassName?: string;
}

// ─── Default icon ─────────────────────────────────────────────────────────────

const DefaultArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Theme Preset Configurations ──────────────────────────────────────────────

const VARIANT_CONFIGS = {
  primary: {
    accent: "#0f172a",
    accentGlow: "rgba(15, 23, 42, 0.04)",
    buttonBg: "#0f172a",
    buttonHoverBg: "#1e293b",
    textColor: "#f8fafc",
    borderColor: "rgba(255, 255, 255, 0.12)",
    dotColor: "#64748b",
    lineColor: "#475569",
  },
  secondary: {
    accent: "#2563eb",
    accentGlow: "rgba(0, 0, 0, 0.02)",
    buttonBg: "#ffffff",
    buttonHoverBg: "#f8fafc",
    textColor: "#0f172a",
    borderColor: "#e2e8f0",
    dotColor: "#94a3b8",
    lineColor: "#cbd5e1",
  },
  danger: {
    accent: "#dc2626",
    accentGlow: "rgba(0, 0, 0, 0.02)",
    buttonBg: "#ffffff",
    buttonHoverBg: "#f8fafc",
    textColor: "#0f172a",
    borderColor: "#e2e8f0",
    dotColor: "#94a3b8",
    lineColor: "#cbd5e1",
  },
  default: {
    accent: "#0f172a",
    accentGlow: "rgba(15, 23, 42, 0.04)",
    buttonBg: "#0f172a",
    buttonHoverBg: "#1e293b",
    textColor: "#ffffff",
    borderColor: "rgba(255, 255, 255, 0.12)",
    dotColor: "#64748b",
    lineColor: "#475569",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function CornerButton({
  children = "Action",
  variant = "default",
  icon,
  showIcon = false,
  accentColor,
  textColor,
  buttonBg,
  hoverBg,
  dotColor,
  lineColor,
  className,
  wrapperClassName,
  style,
  ...props
}: CornerButtonProps) {
  const config = VARIANT_CONFIGS[variant] ?? VARIANT_CONFIGS.default;

  const resolvedAccent = accentColor ?? config.accent;
  const resolvedAccentGlow = config.accentGlow;
  const resolvedButtonBg = buttonBg ?? (accentColor ? accentColor : config.buttonBg);
  const resolvedButtonHoverBg = hoverBg ?? config.buttonHoverBg;
  const resolvedTextColor = textColor ?? config.textColor;
  const resolvedBorderColor = config.borderColor;
  const resolvedDotColor = dotColor ?? config.dotColor;
  const resolvedLineColor = lineColor ?? config.lineColor;

  const resolvedIcon =
    icon ??
    (showIcon ? (
      <DefaultArrowIcon className="corner-btn-svg" />
    ) : null);

  return (
    <div
      className={cn("corner-btn-wrapper group", wrapperClassName)}
      style={
        {
          "--accent": resolvedAccent,
          "--accent-glow": resolvedAccentGlow,
          "--btn-bg": resolvedButtonBg,
          "--btn-hover-bg": resolvedButtonHoverBg,
          "--btn-text": resolvedTextColor,
          "--btn-border": resolvedBorderColor,
          "--dot-color": resolvedDotColor,
          "--line-color": resolvedLineColor,
          ...style,
        } as React.CSSProperties
      }
    >
      {/* Animated corner lines (CAD / Blueprint precision guidelines) */}
      <div className="corner-line horizontal top" aria-hidden="true" />
      <div className="corner-line vertical right" aria-hidden="true" />
      <div className="corner-line horizontal bottom" aria-hidden="true" />
      <div className="corner-line vertical left" aria-hidden="true" />

      {/* Animated corner dots (Crosshair corner points) */}
      <div className="corner-dot top left" aria-hidden="true" />
      <div className="corner-dot top right" aria-hidden="true" />
      <div className="corner-dot bottom right" aria-hidden="true" />
      <div className="corner-dot bottom left" aria-hidden="true" />

      <button
        className={cn("corner-btn", className)}
        {...props}
      >
        <span className="corner-btn-text">{children}</span>
        {resolvedIcon}
      </button>

      {/* Scoped styles — refined, professional, non-AI aesthetic */}
      <style>{`
        .corner-btn-wrapper {
          --dot-size: 4px;
          --line-weight: 1px;
          --padding: 0.5rem 0.65rem;
          --speed: 0.25s;

          position: relative;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: var(--padding);
          background-color: transparent;
          transition: background-color 0.2s ease-in-out;
          user-select: none;
        }

        /* ── Button ───────────────────────── */
        .corner-btn {
          position: relative;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 1.25rem;
          background-color: var(--btn-bg);
          border: 1px solid var(--btn-border);
          color: var(--btn-text);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          border-radius: 10px;
          cursor: pointer;
          box-shadow:
            0 1px 2px 0 rgba(0, 0, 0, 0.05),
            0 1px 3px 0 rgba(0, 0, 0, 0.03);
          transition:
            background-color 0.15s ease-in-out,
            border-color 0.15s ease-in-out,
            transform 0.15s ease-in-out,
            box-shadow 0.15s ease-in-out;
        }

        .corner-btn:hover {
          background-color: var(--btn-hover-bg);
          transform: translateY(-1px);
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.08),
            0 2px 4px -2px rgba(0, 0, 0, 0.06);
        }

        .corner-btn:active {
          background-color: var(--btn-bg);
          transform: translateY(0);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .corner-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .corner-btn-text {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* ── Icon ─────────────────────────── */
        .corner-btn-svg {
          height: 16px;
          width: 16px;
          flex-shrink: 0;
          stroke: currentColor;
          transition: transform 0.15s ease-in-out;
        }

        /* ── Dots ─────────────────────────── */
        .corner-dot {
          position: absolute;
          width: var(--dot-size);
          aspect-ratio: 1;
          border-radius: 50%;
          background-color: var(--dot-color);
          opacity: 0;
          transition: all 0.25s ease-in-out;
        }

        .corner-btn-wrapper:has(.corner-btn:hover) .corner-dot.top.left {
          top: 0; left: 0;
          opacity: 0.9;
        }
        .corner-btn-wrapper:has(.corner-btn:hover) .corner-dot.top.right {
          top: 0; right: 0;
          opacity: 0.9;
        }
        .corner-btn-wrapper:has(.corner-btn:hover) .corner-dot.bottom.right {
          bottom: 0; right: 0;
          opacity: 0.9;
        }
        .corner-btn-wrapper:has(.corner-btn:hover) .corner-dot.bottom.left {
          bottom: 0; left: 0;
          opacity: 0.9;
        }

        /* ── Lines ────────────────────────── */
        .corner-line {
          position: absolute;
          opacity: 0;
          transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        }
        .corner-line.horizontal {
          height: var(--line-weight);
          width: 100%;
          background-image: repeating-linear-gradient(
            90deg,
            #0000 0 3px,
            var(--line-color) 3px 6px
          );
        }
        .corner-line.vertical {
          width: var(--line-weight);
          height: 100%;
          background-image: repeating-linear-gradient(
            0deg,
            #0000 0 3px,
            var(--line-color) 3px 6px
          );
        }
        .corner-line.top    { top: 0; }
        .corner-line.bottom { bottom: 0; }
        .corner-line.left   { left: 0; }
        .corner-line.right  { right: 0; }

        .corner-btn-wrapper:has(.corner-btn:hover) .corner-line {
          opacity: 0.75;
        }
      `}</style>
    </div>
  );
}

export default CornerButton;

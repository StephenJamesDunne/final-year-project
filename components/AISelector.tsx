"use client";

import { AIType } from "@/lib/ai/aiStrategy";
import { CSS_COLORS as COLORS } from "@/lib/pixi/utils/StyleConstants";

interface AISelectorProps {
  selectedAI: AIType;
  onSelectAI: (type: AIType) => void;
}

export function AISelector({ selectedAI, onSelectAI }: AISelectorProps) {
  return (
    <div style={{ width: "100%", maxWidth: 672, marginTop: 8 }}>
      <h2 style={{
        fontSize: 22,
        fontWeight: 700,
        color: COLORS.text,
        textAlign: "center",
        marginBottom: 16,
        fontFamily: "monospace",
      }}>
        AI Opponent Mode:
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        maxWidth: 672,
        margin: "0 auto",
      }}>
        {/* Rule-Based AI */}
        <button
          onClick={() => onSelectAI("rule-based")}
          style={{
            padding: 16,
            borderRadius: 8,
            border: `3px solid ${selectedAI === "rule-based" ? COLORS.blue : COLORS.border}`,
            background: COLORS.darkBg,
            cursor: "pointer",
            outline: selectedAI === "rule-based" ? `3px solid ${COLORS.gold}` : "none",
            outlineOffset: 2,
            opacity: selectedAI === "rule-based" ? 1 : 0.75,
            transition: "opacity 0.15s, outline 0.15s",
            textAlign: "center",
          }}
        >
          <h3 style={{
            fontSize: 15,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 6,
            fontFamily: "monospace",
          }}>
            Rule-Based AI
          </h3>
          <p style={{
            fontSize: 12,
            color: COLORS.subtext,
            lineHeight: 1.4,
          }}>
            Smart strategic opponent. Plays on curve, makes favorable trades.
          </p>
        </button>

        {/* DQN Agent */}
        <button
          onClick={() => onSelectAI("dqn")}
          style={{
            padding: 16,
            borderRadius: 8,
            border: `3px solid ${selectedAI === "dqn" ? COLORS.blue : COLORS.border}`,
            background: COLORS.darkBg,
            cursor: "pointer",
            outline: selectedAI === "dqn" ? `3px solid ${COLORS.gold}` : "none",
            outlineOffset: 2,
            opacity: selectedAI === "dqn" ? 1 : 0.75,
            transition: "opacity 0.15s, outline 0.15s",
            textAlign: "center",
          }}
        >
          <h3 style={{
            fontSize: 15,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 6,
            fontFamily: "monospace",
          }}>
            DQN Agent
          </h3>
          <p style={{
            fontSize: 12,
            color: COLORS.subtext,
            lineHeight: 1.4,
          }}>
            Neural network opponent. Falls back to rule-based until trained.
          </p>
        </button>
      </div>
    </div>
  );
}
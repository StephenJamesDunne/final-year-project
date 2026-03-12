"use client";

import { AIType } from "@/lib/ai/aiStrategy";

interface AISelectorProps {
  selectedAI: AIType;
  onSelectAI: (type: AIType) => void;
}

export function AISelector({ selectedAI, onSelectAI }: AISelectorProps) {
  return (
    <div className="w-full max-w-4xl mt-6">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        AI Opponent
      </h2>
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <button
          onClick={() => onSelectAI("rule-based")}
          className={`
            p-4 rounded-lg border-2 transition-all
            ${
              selectedAI === "rule-based"
                ? "border-yellow-400 bg-blue-900 ring-2 ring-yellow-400"
                : "border-gray-600 bg-gray-800 hover:bg-gray-700"
            }
          `}
        >
          <h3 className="text-lg font-bold text-white mb-2">Rule-Based AI</h3>
          <p className="text-sm text-gray-300">
            Smart strategic opponent. Plays on curve, makes favorable trades.
          </p>
        </button>

        <button
          onClick={() => onSelectAI("dqn")}
          className={`
            p-4 rounded-lg border-2 transition-all
            ${
              selectedAI === "dqn"
                ? "border-yellow-400 bg-blue-900 ring-2 ring-yellow-400"
                : "border-gray-600 bg-gray-800 hover:bg-gray-700"
            }
          `}
        >
          <h3 className="text-lg font-bold text-white mb-2">DQN Agent</h3>
          <p className="text-sm text-gray-300">
            Neural network opponent. Falls back to rule-based until trained.
          </p>
          {selectedAI === "dqn" && (
            <p className="text-xs text-yellow-400 mt-2">
              No trained model - using heuristic AI for now
            </p>
          )}
        </button>
      </div>
    </div>
  );
}

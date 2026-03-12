"use client";

import { CSS_COLORS as COLORS } from "@/lib/pixi/utils/StyleConstants";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// Shape of the state file written by DQNAgent.save()
interface MatchupStats {
  episodes: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  drawRate: number;
  avgTurns: number;
  avgHealthDifferential: number;
}

interface TrainingState {
  epsilon: number;
  episodeCount: number;
  trainingSteps: number;
  wins: number;
  games: number;
  episodeRewards: number[];
  matchupStats: Record<string, MatchupStats>;
  savedAt: string;
  config: {
    epsilonStart: number;
    epsilonEnd: number;
    epsilonDecay: number;
    batchSize: number;
    targetUpdateFreq: number;
    minExperiences: number;
    replayCapacity: number;
  };
}

// One color per matchup row in the table
const MATCHUP_COLORS = [COLORS.red, COLORS.blue, COLORS.green, COLORS.purple];

// Stat Card
// Displays a single metric with label, large value, and optional subtext.
// Accent prop adds a colored border and glow to highlight important stats.

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: COLORS.darkBg,
        border: `1px solid ${accent ?? COLORS.border}`,
        borderRadius: 8,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: accent ? `0 0 12px ${accent}22` : undefined,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: COLORS.subtext,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: accent ?? COLORS.gold,
          fontFamily: "monospace",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: 12,
            color: COLORS.subtext,
            fontFamily: "monospace",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

// Section Card
// Full-width card with a title header 
// Used for the matchup table and config footer
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: COLORS.darkBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "20px 24px",
        width: "100%",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          fontSize: 13,
          color: COLORS.subtext,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// Main Dashboard
export default function TrainingDashboard() {
  const [data, setData] = useState<TrainingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // pull the latest training state from the API route that reads the DQNAgent's save file
      // this file is updated periodically during training
      // will need to return to this file to add more metrics for showcase in the future
      const res = await fetch("/api/training-stats");
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to fetch training data.");
        setData(null);
      } else {
        const json = await res.json();
        setData(json);
        setError(null);
        setLastFetched(new Date());
      }
    } catch {
      setError("Could not reach the training stats API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const globalWinRate =
    data && data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : "—";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.baseBg,
        position: "relative",
        color: COLORS.text,
        fontFamily: "monospace",
        padding: "40px 48px",
      }}
    >
      <Link
        href="/"
        style={{
          position: "absolute",
          top: 24,
          left: 48,
          background: COLORS.blue,
          color: "white",
          padding: "16px 32px", // py-4 px-8 equivalent
          borderRadius: "4px",
          fontSize: "20px", // text-2xl equivalent
          fontWeight: 700, // font-bold
          textDecoration: "none",
          fontFamily: "monospace",
          cursor: "pointer",
          display: "inline-block",
          transition: "background 0.2s", // smooth hover
        }}
      >
        ← Main Menu
      </Link>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginTop: 60,
          marginBottom: 40,
          borderBottom: `1px solid ${COLORS.border}`,
          paddingBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.gold,
              letterSpacing: "0.04em",
            }}
          >
            Five Realms — DQN Training
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: COLORS.subtext }}>
            {data
              ? `Last saved: ${new Date(data.savedAt).toLocaleString()}`
              : "Waiting for training data..."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastFetched && (
            <span style={{ fontSize: 12, color: COLORS.subtext }}>
              Updated {lastFetched.toLocaleTimeString()}
              {isLoading && " · Fetching..."}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${COLORS.gold}`,
              background: "transparent",
              color: COLORS.gold,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: 12,
              fontFamily: "monospace",
              letterSpacing: "0.05em",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: `${COLORS.red}22`,
            border: `1px solid ${COLORS.red}`,
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 32,
            color: COLORS.red,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* No data yet */}
      {!data && !error && (
        <div
          style={{ textAlign: "center", paddingTop: 80, color: COLORS.subtext }}
        >
          <p style={{ fontSize: 16 }}>No training data found.</p>
          <p style={{ fontSize: 13 }}>
            Run a training session to populate this dashboard.
          </p>
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            <StatCard
              label="Episodes"
              value={data.episodeCount.toLocaleString()}
              accent={COLORS.gold}
            />
            <StatCard
              label="Training Steps"
              value={data.trainingSteps.toLocaleString()}
              accent={COLORS.blue}
            />
            <StatCard
              label="Win Rate"
              value={`${globalWinRate}%`}
              sub={`${data.wins} wins / ${data.games} games`}
              accent={COLORS.green}
            />
            <StatCard
              label="Epsilon"
              value={data.epsilon.toFixed(4)}
              sub={`Start: ${data.config.epsilonStart} → End: ${data.config.epsilonEnd}`}
              accent={COLORS.purple}
            />
            <StatCard
              label="Avg Reward"
              value={
                data.episodeRewards.length > 0
                  ? (
                      data.episodeRewards.reduce((a, b) => a + b, 0) /
                      data.episodeRewards.length
                    ).toFixed(2)
                  : "—"
              }
              accent={COLORS.gold}
            />
            <StatCard
              label="Matchups Tracked"
              value={Object.keys(data.matchupStats).length}
              accent={COLORS.gray}
            />
          </div>

          {/* Matchup detail table */}
          {Object.keys(data.matchupStats).length > 0 && (
            <SectionCard title="Matchup Detail">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Matchup",
                      "Episodes",
                      "Wins",
                      "Losses",
                      "Draws",
                      "Win %",
                      "Draw %",
                      "Avg Turns",
                      "Avg Health Diff",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: COLORS.subtext,
                          fontWeight: 600,
                          borderBottom: `1px solid ${COLORS.border}`,
                          letterSpacing: "0.05em",
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.matchupStats).map(([key, stats], i) => (
                    <tr
                      key={key}
                      style={{
                        background:
                          i % 2 === 0 ? "transparent" : `${COLORS.border}33`,
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          color: MATCHUP_COLORS[i % MATCHUP_COLORS.length],
                          fontWeight: 600,
                        }}
                      >
                        {key.replace(/_vs_/g, " v ")}
                      </td>
                      <td style={{ padding: "10px 12px", color: COLORS.text }}>
                        {stats.episodes}
                      </td>
                      <td style={{ padding: "10px 12px", color: COLORS.green }}>
                        {stats.wins}
                      </td>
                      <td style={{ padding: "10px 12px", color: COLORS.red }}>
                        {stats.losses}
                      </td>
                      <td
                        style={{ padding: "10px 12px", color: COLORS.subtext }}
                      >
                        {stats.draws}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: COLORS.gold,
                          fontWeight: 700,
                        }}
                      >
                        {(stats.winRate * 100).toFixed(1)}%
                      </td>
                      <td
                        style={{ padding: "10px 12px", color: COLORS.subtext }}
                      >
                        {(stats.drawRate * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: "10px 12px", color: COLORS.text }}>
                        {stats.avgTurns.toFixed(1)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color:
                            stats.avgHealthDifferential >= 0
                              ? COLORS.green
                              : COLORS.red,
                          fontWeight: 600,
                        }}
                      >
                        {stats.avgHealthDifferential >= 0 ? "+" : ""}
                        {stats.avgHealthDifferential.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          )}

          {/* Config */}
          <SectionCard title="Config">
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                ["Batch Size", data.config.batchSize],
                [
                  "Replay Capacity",
                  data.config.replayCapacity.toLocaleString(),
                ],
                [
                  "Min Experiences",
                  data.config.minExperiences.toLocaleString(),
                ],
                [
                  "Target Update Freq",
                  data.config.targetUpdateFreq.toLocaleString(),
                ],
                ["Epsilon Decay", data.config.epsilonDecay],
                ["Epsilon Start", data.config.epsilonStart],
                ["Epsilon End", data.config.epsilonEnd],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: COLORS.subtext,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: COLORS.text,
                      fontFamily: "monospace",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

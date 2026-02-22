"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { calcCourseHandicap, matchUsesHandicap, MatchType } from "@/lib/handicap";
import LineupEditor from "./LineupEditor";

type Match = {
  id: string;
  match_no: number;
  title: string;
  match_type: MatchType;
};

type Course = {
  course_name: string;
  tee_name: string;
  slope_rating: number;
  course_rating: number;
  par: number;
};

type MP = {
  side: "A" | "B";
  sort_order: number;
  players: {
    id: string;
    name: string;
    handicap_index: number;
    teams?: { name: string } | null;
  };
};

export default function MatchDetail({ params }: { params: { id: string } }) {
  const matchId = params.id;

  const [match, setMatch] = useState<Match | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [players, setPlayers] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const usesHandicap = useMemo(() => (match ? matchUsesHandicap(match.match_type) : false), [match]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: matchData } = await supabase
        .from("matches")
        .select("id,match_no,title,match_type")
        .eq("id", matchId)
        .single();

      const { data: courseData } = await supabase
        .from("match_course")
        .select("course_name,tee_name,slope_rating,course_rating,par")
        .eq("match_id", matchId)
        .single();

      const { data: mpData } = await supabase
        .from("match_players")
        .select("side,sort_order,players(id,name,handicap_index,teams(name))")
        .eq("match_id", matchId)
        .order("side", { ascending: true })
        .order("sort_order", { ascending: true });

      setMatch((matchData as any) ?? null);
      setCourse((courseData as any) ?? null);
      setPlayers((mpData as any) ?? []);
      setLoading(false);
    })();
  }, [matchId, refreshKey]);

  if (loading) return <div>Loading…</div>;
  if (!match) return <div>Match not found.</div>;

  const sideA = players.filter((p) => p.side === "A");
  const sideB = players.filter((p) => p.side === "B");

  function chForPlayer(hi: number) {
    if (!usesHandicap) return "0";
    if (!course) return "—";
    const ch = calcCourseHandicap({
      handicapIndex: hi,
      slopeRating: Number(course.slope_rating),
      courseRating: Number(course.course_rating),
      par: Number(course.par)
    });
    return String(ch);
  }

  function renderRow(p: MP) {
    const hi = Number(p.players.handicap_index);
    return (
      <tr key={p.players.id}>
        <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
          {p.players.name} <span style={{ color: "#666" }}>({p.players.teams?.name ?? "—"})</span>
        </td>
        <td style={{ borderBottom: "1px solid #eee", padding: 8, textAlign: "right" }}>{hi.toFixed(1)}</td>
        <td style={{ borderBottom: "1px solid #eee", padding: 8, textAlign: "right" }}>{chForPlayer(hi)}</td>
      </tr>
    );
  }

  return (
    <div>
      <h1>
        #{match.match_no} — {match.title}
      </h1>

      {course ? (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
          <div><strong>Course:</strong> {course.course_name}</div>
          <div><strong>Tee:</strong> {course.tee_name}</div>
          <div><strong>Rating/Slope/Par:</strong> {Number(course.course_rating).toFixed(1)} / {course.slope_rating} / {course.par}</div>
        </div>
      ) : (
        <p style={{ color: "#b00" }}>No course/tee row found for this match.</p>
      )}

      <h2>Side A</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Player</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>HI</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
              {usesHandicap ? "Course Hcp" : "Hcp"}
            </th>
          </tr>
        </thead>
        <tbody>{sideA.map(renderRow)}</tbody>
      </table>

      <h2>Side B</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Player</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>HI</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
              {usesHandicap ? "Course Hcp" : "Hcp"}
            </th>
          </tr>
        </thead>
        <tbody>{sideB.map(renderRow)}</tbody>
      </table>

      <LineupEditor
        matchId={matchId}
        matchType={match.match_type}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

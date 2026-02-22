"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PlayerRow = {
  id: string;
  name: string;
  handicap_index: number;
  teams?: { name: string } | null;
};

export default function RosterPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("id,name,handicap_index,teams(name)")
        .order("name");

      if (error) console.error(error);
      setPlayers((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1>Roster</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Player</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Team</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>HI</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{p.name}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{p.teams?.name ?? "—"}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8, textAlign: "right" }}>
                {Number(p.handicap_index).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

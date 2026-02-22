"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type MatchRow = {
  id: string;
  match_no: number;
  title: string;
  match_type: "scramble" | "alt_shot" | "fourball" | "singles";
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select("id,match_no,title,match_type")
        .order("match_no");
      if (error) console.error(error);
      setMatches((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1>Matches</h1>
      <ul style={{ paddingLeft: 18 }}>
        {matches.map((m) => (
          <li key={m.id} style={{ marginBottom: 8 }}>
            <Link href={`/matches/${m.id}`}>
              <strong>#{m.match_no}</strong> — {m.title} <span style={{ color: "#666" }}>({m.match_type})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import supabase from "../../_lib/supabase.js";
import { cors, adminAuth } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: "Date unblocked successfully" });
}

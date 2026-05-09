import supabase from "../db/supabase.js";

export async function getProperties(req, res) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("id");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

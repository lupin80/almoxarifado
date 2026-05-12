import { supabase } from '../config/supabase.js';

export async function listDestinations(req, res) {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createDestination(req, res) {
  const { name } = req.body;
  try {
    const { data, error } = await supabase
      .from('destinations')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import { supabase } from '../config/supabase.js';

export async function listCategories(req, res) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCategory(req, res) {
  const { name } = req.body;
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCategory(req, res) {
  const { name } = req.body;
  try {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Categoria atualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', req.params.id)
      .single();

    if (catError) throw catError;

    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', categoryData.name);

    if (countError) throw countError;

    if (count > 0) {
      return res.status(400).json({ error: 'Categoria em uso por produtos ativos' });
    }

    const { error: delError } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);

    if (delError) throw delError;

    res.json({ message: 'Categoria removida' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

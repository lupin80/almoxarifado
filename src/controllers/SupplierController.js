import { supabase } from '../config/supabase.js';

export async function listSuppliers(req, res) {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createSupplier(req, res) {
  const { name, code, cnpj, city, email, phone, address } = req.body;
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ name, code, cnpj, city, email, phone, address }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSupplier(req, res) {
  const { name, code, cnpj, city, email, phone, address } = req.body;
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({ name, code, cnpj, city, email, phone, address })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Fornecedor atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteSupplier(req, res) {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Fornecedor removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

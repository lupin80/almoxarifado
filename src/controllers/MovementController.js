import { supabase } from '../config/supabase.js';

export async function listMovements(req, res) {
  try {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const mappedData = data.map(m => ({
      ...m,
      productId: m.product_id,
      targetProductId: m.target_product_id,
      createdAt: m.created_at
    }));

    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createMovement(req, res) {
  const { type, productId, targetProductId, quantity, origin, destination, note } = req.body;
  const qty = Number(quantity);
  const now = new Date();
  const date = now.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const time = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false });

  try {
    const { error } = await supabase.rpc('create_movement', {
      p_type: type,
      p_product_id: productId,
      p_target_product_id: targetProductId || null,
      p_quantity: qty,
      p_origin: origin || null,
      p_destination: destination || null,
      p_date: date,
      p_time: time,
      p_note: note || null
    });

    if (error) throw error;
    res.status(200).json({ message: 'Movimentação realizada com sucesso' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

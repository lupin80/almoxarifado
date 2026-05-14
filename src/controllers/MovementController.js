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

export async function deleteMovement(req, res) {
  try {
    const { id } = req.params;
    
    const { data: movement, error: fetchError } = await supabase
      .from('movements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!movement) return res.status(404).json({ error: 'Movimentação não encontrada' });

    // Revert stock
    if (movement.type === 'entry') {
      const { data: prod } = await supabase.from('products').select('stock').eq('id', movement.product_id).single();
      if (prod) {
        await supabase.from('products').update({ stock: prod.stock - movement.quantity }).eq('id', movement.product_id);
      }
    } else if (movement.type === 'exit') {
      const { data: prod } = await supabase.from('products').select('stock').eq('id', movement.product_id).single();
      if (prod) {
        await supabase.from('products').update({ stock: prod.stock + movement.quantity }).eq('id', movement.product_id);
      }
    } else if (movement.type === 'product_transfer') {
      const { data: prod1 } = await supabase.from('products').select('stock').eq('id', movement.product_id).single();
      if (prod1) {
        await supabase.from('products').update({ stock: prod1.stock + movement.quantity }).eq('id', movement.product_id);
      }
      if (movement.target_product_id) {
         const { data: prod2 } = await supabase.from('products').select('stock').eq('id', movement.target_product_id).single();
         if (prod2) {
           await supabase.from('products').update({ stock: prod2.stock - movement.quantity }).eq('id', movement.target_product_id);
         }
      }
    }

    const { error: deleteError } = await supabase
      .from('movements')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Movimentação excluída e estoque revertido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

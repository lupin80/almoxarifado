import { supabase } from '../config/supabase.js';
import AuditController from './AuditController.js';

export async function listProducts(req, res) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('status', 'excluido')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listDeletedProducts(req, res) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'excluido')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Produto não encontrado' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProduct(req, res) {
  const {
    name,
    sku,
    category,
    price,
    stock,
    maxStock: max_stock,
    location,
    ncm,
    icms,
    ipi,
    pis,
    invoiceNumber: invoice_number,
    supplierId: supplier_id,
    image,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name, sku, category, price, stock, max_stock, location, ncm, icms, ipi, pis, 
        invoice_number, supplier_id: supplier_id || null, image: image || null
      }])
      .select()
      .single();

    if (error) throw error;

    await AuditController.log(req.userId, 'CREATE', 'products', data.id, null, data);

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProduct(req, res) {
  const {
    name,
    sku,
    category,
    price,
    stock,
    maxStock: max_stock,
    location,
    ncm,
    icms,
    ipi,
    pis,
    invoiceNumber: invoice_number,
    supplierId: supplier_id,
    image,
    status,
  } = req.body;

  try {
    const { error } = await supabase
      .from('products')
      .update({
        name, sku, category, price, stock, max_stock, location, ncm, icms, ipi, pis,
        invoice_number, supplier_id: supplier_id || null, image: image || null, 
        status: status || 'ativo', updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (error) throw error;

    // In a real app, we'd fetch the old data first for a full audit log.
    // For now, we'll log the action and the new data.
    await AuditController.log(req.userId, 'UPDATE', 'products', req.params.id, null, req.body);

    res.json({ message: 'Produto atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ status: 'excluido' })
      .eq('id', req.params.id);

    if (error) throw error;

    await AuditController.log(req.userId, 'SOFT_DELETE', 'products', req.params.id, null, { status: 'excluido' });

    res.json({ message: 'Produto movido para a lixeira' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const file = req.file;
    const fileName = `product-images/${Date.now()}-${file.originalname}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('vault-assets')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage
      .from('vault-assets')
      .getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

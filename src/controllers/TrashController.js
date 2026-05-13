import { supabase } from '../config/supabase.js';
import AuditController from './AuditController.js';

class TrashController {
  async getDeletedProducts(req, res) {
    try {
      const { data, error } = await supabase
        .from('deleted_products')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getDeletedSuppliers(req, res) {
    try {
      const { data, error } = await supabase
        .from('deleted_suppliers')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async restoreProduct(req, res) {
    const { id } = req.params;
    try {
      const { data: archived, error: fetchError } = await supabase
        .from('deleted_products')
        .select('data')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const originalData = archived.data;
      originalData.status = 'ativo';
      originalData.updated_at = new Date().toISOString();

      const { data, error: insertError } = await supabase
        .from('products')
        .insert([originalData])
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from('deleted_products').delete().eq('id', id);
      await AuditController.log(req.userId, 'RESTORE', 'products', id, null, data);

      return res.json({ message: 'Produto restaurado com sucesso', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async restoreSupplier(req, res) {
    const { id } = req.params;
    try {
      const { data: archived, error: fetchError } = await supabase
        .from('deleted_suppliers')
        .select('data')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error: insertError } = await supabase
        .from('suppliers')
        .insert([archived.data])
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from('deleted_suppliers').delete().eq('id', id);
      await AuditController.log(req.userId, 'RESTORE', 'suppliers', id, null, data);

      return res.json({ message: 'Fornecedor restaurado com sucesso', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async permanentDeleteProduct(req, res) {
    const { id } = req.params;
    try {
      const { data: archived, error: fetchError } = await supabase
        .from('deleted_products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const product = archived.data;
      if (product && product.image) {
        try {
          const urlParts = product.image.split('vault-assets/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('vault-assets').remove([filePath]);
          }
        } catch (e) {
          console.error('Erro ao deletar imagem do storage:', e);
        }
      }

      const { error } = await supabase.from('deleted_products').delete().eq('id', id);
      if (error) throw error;

      await AuditController.log(req.userId, 'PERMANENT_DELETE', 'products', id, archived, null);
      return res.json({ message: 'Produto excluído permanentemente' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async permanentDeleteSupplier(req, res) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('deleted_suppliers').delete().eq('id', id);
      if (error) throw error;

      await AuditController.log(req.userId, 'PERMANENT_DELETE', 'suppliers', id, null, null);
      return res.json({ message: 'Fornecedor excluído permanentemente' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new TrashController();

import { supabase } from '../config/supabase.js';
import AuditController from './AuditController.js';

class TrashController {
  async getDeletedProducts(req, res) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'excluido')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async restoreProduct(req, res) {
    const { id } = req.params;
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('products')
        .update({ status: 'ativo' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await AuditController.log(req.userId, 'RESTORE', 'products', id, product, data);

      return res.json({ message: 'Produto restaurado com sucesso', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async permanentDeleteProduct(req, res) {
    const { id } = req.params;
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await AuditController.log(req.userId, 'PERMANENT_DELETE', 'products', id, product, null);

      return res.json({ message: 'Produto excluído permanentemente' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new TrashController();

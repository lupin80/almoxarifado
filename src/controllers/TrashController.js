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

  async restoreProduct(req, res) {
    const { id } = req.params;
    try {
      // 1. Buscar o registro na lixeira
      const { data: archived, error: fetchError } = await supabase
        .from('deleted_products')
        .select('data')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const originalData = archived.data;
      // Remover campos de controle de lixeira se necessário, 
      // mas aqui vamos reinserir com status ativo
      originalData.status = 'ativo';
      originalData.updated_at = new Date().toISOString();

      // 2. Inserir de volta na tabela principal
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([originalData])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Remover da lixeira
      await supabase.from('deleted_products').delete().eq('id', id);

      await AuditController.log(req.userId, 'RESTORE', 'products', id, null, data);

      return res.json({ message: 'Produto restaurado com sucesso', data });
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

      // Remover imagem se existir (usando os dados salvos na lixeira)
      const product = archived.data;
      if (product && product.image) {
        try {
          const urlParts = product.image.split('vault-assets/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('vault-assets').remove([filePath]);
          }
        } catch (e) {
          console.error('Erro ao deletar imagem do storage na exclusão permanente:', e);
        }
      }

      // Deletar da tabela de lixeira
      const { error } = await supabase
        .from('deleted_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await AuditController.log(req.userId, 'PERMANENT_DELETE', 'products', id, archived, null);

      return res.json({ message: 'Produto excluído permanentemente da lixeira' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new TrashController();

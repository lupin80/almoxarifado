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

      // Se houver imagem, remover do storage
      if (product.image) {
        try {
          // Extrair o caminho do arquivo da URL do Supabase
          // A URL geralmente é: .../storage/v1/object/public/vault-assets/product-images/123-img.jpg
          // Precisamos de: product-images/123-img.jpg
          const urlParts = product.image.split('vault-assets/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            const { error: storageError } = await supabase.storage
              .from('vault-assets')
              .remove([filePath]);
            
            if (storageError) {
              console.error('Erro ao deletar imagem do storage:', storageError);
            }
          }
        } catch (e) {
          console.error('Erro ao processar deleção de imagem:', e);
        }
      }

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

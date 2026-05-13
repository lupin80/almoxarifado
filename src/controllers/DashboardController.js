import { supabase } from '../config/supabase.js';

class DashboardController {
  async getStats(req, res) {
    try {
      // 1. Total products (active)
      const { count: totalActive, error: err1 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      // 2. Out of stock products
      const { count: outOfStock, error: err2 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo')
        .lte('stock', 0);

      // 3. Low stock ( < 10)
      const { count: lowStock, error: err3 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo')
        .gt('stock', 0)
        .lt('stock', 10);

      // 4. Total Stock Value
      const { data: valueData, error: err4 } = await supabase
        .from('products')
        .select('stock, price')
        .eq('status', 'ativo');

      const totalValue = valueData?.reduce((acc, p) => acc + (p.stock * (p.price || 0)), 0) || 0;

      if (err1 || err2 || err3 || err4) throw (err1 || err2 || err3 || err4);

      return res.json({
        totalActive,
        outOfStock,
        lowStock,
        totalValue: totalValue.toFixed(2),
        updatedAt: new Date()
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getRecentMovements(req, res) {
    try {
      const { data, error } = await supabase
        .from('movements')
        .select(`
          *,
          products (name)
        `)
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(10);

      if (error) throw error;
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new DashboardController();

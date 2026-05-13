import { supabase } from '../config/supabase.js';

class AuditController {
  async getLogs(req, res) {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          usuarios (name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Helper for other controllers
  async log(userId, action, tableName, recordId, oldData = null, newData = null) {
    try {
      await supabase
        .from('audit_log')
        .insert([{
          user_id: userId,
          action,
          table_name: tableName,
          record_id: recordId,
          old_data: oldData,
          new_data: newData
        }]);
    } catch (error) {
      console.error('Audit Log Error:', error.message);
    }
  }
}

export default new AuditController();

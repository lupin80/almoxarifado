import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase.js';

export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, name, email, senha, role, image')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const match = await bcrypt.compare(senha, user.senha);

    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { senha: _, ...userSemSenha } = user;
    res.json(userSemSenha);
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

export async function changePassword(req, res) {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Email, senha atual e nova senha são obrigatórios.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, senha')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const match = await bcrypt.compare(currentPassword, user.senha);
    if (!match) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ senha: newHash })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function resetPassword(req, res) {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email e nova senha são obrigatórios.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ senha: newHash })
      .eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

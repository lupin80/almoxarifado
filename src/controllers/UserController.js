import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase.js';

export async function listUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, name, email, role, image, created_at')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUser(req, res) {
  const { name, email, senha, role, image } = req.body;

  if (!name || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 12);
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ name, email, senha: senhaHash, role: role || 'usuario', image: image || null }])
      .select('id, name, email, role, image')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Email já cadastrado.' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
  const { name, email, senha, role, image } = req.body;
  try {
    const updates = { name, email, role, image: image || null };
    if (senha) {
      updates.senha = await bcrypt.hash(senha, 12);
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Usuário atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('image')
      .eq('id', req.params.id)
      .single();

    if (!fetchError && user?.image) {
      const urlParts = user.image.split('vault-assets/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('vault-assets').remove([filePath]);
      }
    }

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Usuário removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadUserImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `user-images/${req.params.id}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('vault-assets')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (storageError) throw storageError;

    // Pequena espera para propagação no Storage
    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: { publicUrl } } = supabase.storage
      .from('vault-assets')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ image: publicUrl })
      .eq('id', req.params.id);

    if (dbError) throw dbError;

    const { data: updatedUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('id, name, email, role, image, created_at')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    res.json({
      user: {
        ...updatedUser,
        image: publicUrl // Garantir que a URL mais recente seja enviada
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

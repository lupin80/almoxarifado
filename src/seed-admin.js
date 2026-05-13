import bcrypt from 'bcrypt';
import { supabase } from './config/supabase.js';

async function seedAdmin() {
  const name = 'Admin';
  const email = 'admin@vault.com';
  const senha = 'admin123';
  const role = 'admin';

  console.log('Seeding admin user...');

  try {
    const senhaHash = await bcrypt.hash(senha, 12);
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ name, email, senha: senhaHash, role }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('Admin user already exists.');
      } else {
        console.error('Error seeding admin:', error.message);
      }
    } else {
      console.log('Admin user created successfully!');
      console.log('Email:', email);
      console.log('Password:', senha);
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

seedAdmin();

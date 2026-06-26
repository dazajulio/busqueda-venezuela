import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qokezfiacxuyoazhmxce.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva2V6ZmlhY3h1eW9hemhteGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTAxNDgsImV4cCI6MjA5Nzk4NjE0OH0.JYkLjI_EwLj-m0ZNS2zl1D4ZMdcMOsBwWvfmagxmMPA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const firstNames = ['María', 'José', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Juan', 'Rosa', 'Pedro', 'Yelitza', 'Miguel', 'Génesis', 'Javier', 'Andrea', 'Diego', 'Camila', 'Alejandro', 'Valentina', 'Jesús', 'Daniela'];
const lastNames = ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'García', 'Sánchez', 'Romero', 'Sosa', 'Álvarez', 'Mendoza', 'Blanco', 'Rojas', 'Silva', 'Medina', 'Rivas', 'Salazar'];
const locations = ['Caracas (Chacao)', 'Caracas (El Hatillo)', 'Maracaibo (Centro)', 'Valencia (San Diego)', 'Mérida (Centro)', 'Barquisimeto (Este)', 'Los Teques', 'Guatire', 'San Cristóbal', 'Puerto La Cruz'];
const photos = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getAgeGroup = () => getRandom(['Infante', 'Niño', 'Adolescente', 'Adulto', 'Adulto Mayor']);
const getGender = () => getRandom(['Masculino', 'Femenino']);

async function seed() {
  console.log('Iniciando poblamiento de base de datos...');
  let successCount = 0;
  let errors = 0;

  for (let i = 0; i < 30; i++) {
    const isMissing = Math.random() > 0.3; // 70% desaparecidos, 30% localizados
    
    const person = {
      full_name: `${getRandom(firstNames)} ${getRandom(lastNames)} ${getRandom(lastNames)}`,
      age_group: getAgeGroup(),
      gender: getGender(),
      distinctive_features: 'Sin detalles específicos.',
      last_known_location: getRandom(locations),
      status: isMissing ? 'missing' : 'found',
      photo_url: Math.random() > 0.2 ? getRandom(photos) : null, // 80% con foto
    };

    const { data, error } = await supabase.from('persons').insert(person);
    
    if (error) {
      console.error('Error insertando registro:', error);
      errors++;
    } else {
      successCount++;
    }
    
    // Pequeña pausa para no saturar
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`Finalizado. ${successCount} registros exitosos, ${errors} errores.`);
}

seed();

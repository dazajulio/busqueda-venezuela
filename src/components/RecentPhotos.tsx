import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface RecentPerson {
  id: string;
  full_name: string;
  photo_url: string;
  status: 'missing' | 'found';
}

export default function RecentPhotos() {
  const [persons, setPersons] = useState<RecentPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('persons')
          .select('id, full_name, photo_url, status')
          .not('photo_url', 'is', null) // Solo traer los que tienen foto
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setPersons(data);
        }
      } catch (err) {
        console.error('Error fetching recent photos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPhotos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (persons.length === 0) {
    return null; // Si no hay fotos, no mostrar la sección
  }

  return (
    <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 px-2">Reportes Recientes</h3>
      
      <div className="overflow-hidden py-2 relative flex group">
        {/* Set 1 */}
        <div className="flex gap-4 min-w-max animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused] pr-4">
          {persons.map((person) => (
            <div 
              key={person.id} 
              className="shrink-0 w-32 h-44 rounded-xl overflow-hidden relative shadow-sm border border-slate-200"
            >
              <img 
                src={person.photo_url} 
                alt={person.full_name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-2">
                <span className="text-xs font-semibold text-white line-clamp-1">
                  {person.full_name}
                </span>
                <span className={`text-[10px] font-bold uppercase mt-1 ${person.status === 'missing' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {person.status === 'missing' ? 'Desaparecido' : 'Localizado'}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Set 2 para loop infinito */}
        <div className="flex gap-4 min-w-max animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused] pr-4" aria-hidden="true">
          {persons.map((person) => (
            <div 
              key={person.id + '-clone'} 
              className="shrink-0 w-32 h-44 rounded-xl overflow-hidden relative shadow-sm border border-slate-200"
            >
              <img 
                src={person.photo_url} 
                alt={person.full_name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-2">
                <span className="text-xs font-semibold text-white line-clamp-1">
                  {person.full_name}
                </span>
                <span className={`text-[10px] font-bold uppercase mt-1 ${person.status === 'missing' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {person.status === 'missing' ? 'Desaparecido' : 'Localizado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
}

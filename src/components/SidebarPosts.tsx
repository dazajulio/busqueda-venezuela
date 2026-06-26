import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserX, UserCheck, Loader2 } from 'lucide-react';

interface SidebarPerson {
  id: string;
  full_name: string;
  photo_url: string;
  status: 'missing' | 'found';
}

interface SidebarPostsProps {
  side: 'left' | 'right';
  onPersonClick?: (id: string) => void;
}

export default function SidebarPosts({ side, onPersonClick }: SidebarPostsProps) {
  const [persons, setPersons] = useState<SidebarPerson[]>([]);
  const [loading, setLoading] = useState(true);

  // El lado izquierdo mostrará 'missing' (Desaparecidos)
  // El lado derecho mostrará 'found' (Localizados)
  const targetStatus = side === 'left' ? 'missing' : 'found';

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const { data, error } = await supabase
          .from('persons')
          .select('id, full_name, photo_url, status')
          .eq('status', targetStatus)
          .not('photo_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          setPersons(data);
        }
      } catch (err) {
        console.error(`Error fetching ${targetStatus} persons:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, [targetStatus]);

  if (loading) {
    return (
      <div className="hidden lg:flex w-72 shrink-0 flex-col items-center justify-center py-8">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="hidden lg:flex w-72 shrink-0 flex-col gap-4 p-4 opacity-50">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-sm">
          No hay registros recientes.
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4 py-4 px-2">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
        {targetStatus === 'missing' ? <UserX size={18} className="text-red-500" /> : <UserCheck size={18} className="text-emerald-500" />}
        {targetStatus === 'missing' ? 'Personas Buscadas' : 'Personas Localizadas'}
      </h3>
      
      {persons.map((person) => (
        <div 
          key={person.id} 
          onClick={() => onPersonClick?.(person.id)}
          className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 group h-64 cursor-pointer"
        >
          <img 
            src={person.photo_url} 
            alt={person.full_name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-4">
            <span className="text-sm font-bold text-white line-clamp-2 leading-tight shadow-sm">
              {person.full_name}
            </span>
            <span className={`text-[10px] font-bold uppercase mt-2 inline-block px-2 py-1 rounded-full w-max ${
              person.status === 'missing' 
                ? 'bg-red-500/20 text-red-300 backdrop-blur-sm border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 backdrop-blur-sm border border-emerald-500/30'
            }`}>
              {person.status === 'missing' ? 'Desaparecido' : 'Localizado'}
            </span>
          </div>
        </div>
      ))}
    </aside>
  );
}

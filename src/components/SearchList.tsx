import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, User, Loader2, ArrowLeft, Image as ImageIcon, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Person {
  id: string;
  full_name: string;
  age_group: string;
  gender: string;
  distinctive_features: string;
  last_known_location: string;
  status: 'missing' | 'found';
  photo_url: string | null;
  created_at: string;
}

interface SearchListProps {
  onBack: () => void;
}

const ITEMS_PER_PAGE = 50;

export default function SearchList({ onBack }: SearchListProps) {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // El query aplicado
  const [persons, setPersons] = useState<Person[]>([]);
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPersons = useCallback(async (currentQuery: string, currentPage: number) => {
    setLoading(true);
    setError('');
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let queryBuilder = supabase
        .from('persons')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (currentQuery.trim() !== '') {
        const searchPattern = `%${currentQuery}%`;
        queryBuilder = queryBuilder.or(`full_name.ilike.${searchPattern},last_known_location.ilike.${searchPattern}`);
      }

      const { data, count, error: fetchError } = await queryBuilder;

      if (fetchError) throw fetchError;
      setPersons(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError('Error al cargar la lista de personas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar o al cambiar de página/query
  useEffect(() => {
    fetchPersons(searchQuery, page);
  }, [searchQuery, page, fetchPersons]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reiniciar a página 1 en nueva búsqueda
    setSearchQuery(query);
  };

  const markAsFound = async (id: string, currentName: string) => {
    const confirmAction = window.confirm(`¿Estás completamente seguro de marcar a ${currentName} como LOCALIZADO/A? Esta acción es irreversible.`);
    if (!confirmAction) return;

    try {
      const { error: updateError } = await supabase
        .from('persons')
        .update({ status: 'found', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;
      
      setPersons(persons.map(p => p.id === id ? { ...p, status: 'found' } : p));
      alert(`Estado de ${currentName} actualizado a Localizado.`);
    } catch (err: any) {
      alert('Hubo un error al actualizar el estado: ' + err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-4 text-white">
        <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold flex-1">Buscar y Listado</h2>
      </div>

      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o ubicación..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="p-6 flex-1 bg-slate-50 flex flex-col">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 flex-1">
            <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
            <p className="font-medium">Cargando registros...</p>
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-20 flex-1">
            <User className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">No se encontraron resultados</h3>
            <p className="text-slate-500 mt-2">Intenta con otros términos de búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
              {persons.map(person => (
                <div key={person.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative h-48 bg-slate-100 flex items-center justify-center border-b border-slate-100">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={48} className="text-slate-300" />
                    )}
                    <div className="absolute top-2 right-2">
                      {person.status === 'missing' ? (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                          <AlertCircle size={14}/> Desaparecido
                        </span>
                      ) : (
                        <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                          <CheckCircle2 size={14}/> Localizado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{person.full_name}</h3>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mb-3">
                      <span>{person.gender}</span> • <span>{person.age_group}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-slate-700 mb-3">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{person.last_known_location}</span>
                    </div>

                    {person.distinctive_features && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                        "{person.distinctive_features}"
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Reportado: {new Date(person.created_at).toLocaleDateString()}
                      </span>
                      
                      {person.status === 'missing' && (
                        <button 
                          onClick={() => markAsFound(person.id, person.full_name)}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 size={16} /> Es reportar localizado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <span className="text-sm text-slate-500">
                  Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, totalCount)} de {totalCount}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-slate-50"
                  >
                    <ChevronLeft size={20} className="text-slate-700" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-slate-50"
                  >
                    <ChevronRight size={20} className="text-slate-700" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

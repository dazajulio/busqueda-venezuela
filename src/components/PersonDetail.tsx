import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Loader2, AlertCircle, CheckCircle2, Calendar, Phone, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PersonDetailProps {
  personId: string;
  onBack: () => void;
}

interface PersonData {
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

interface ReporterData {
  reporter_name: string;
  reporter_phone: string;
  reporter_email: string | null;
}

export default function PersonDetail({ personId, onBack }: PersonDetailProps) {
  const [person, setPerson] = useState<PersonData | null>(null);
  const [reporter, setReporter] = useState<ReporterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch person
        const { data: pData, error: pError } = await supabase
          .from('persons')
          .select('*')
          .eq('id', personId)
          .single();

        if (pError) throw pError;
        setPerson(pData);

        // Fetch reporter (if any, using maybeSingle)
        const { data: rData, error: rError } = await supabase
          .from('reporters')
          .select('reporter_name, reporter_phone, reporter_email')
          .eq('person_id', personId)
          .maybeSingle();

        if (rError && rError.code !== 'PGRST116') {
          console.error("Error fetching reporter:", rError);
        } else {
          setReporter(rData);
        }

      } catch (err: any) {
        setError('Error al cargar los detalles: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [personId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-slate-700 font-medium mb-4">{error || 'No se encontró la persona.'}</p>
        <button onClick={onBack} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">Volver</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-4 text-white">
        <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">Perfil del Reporte</h2>
      </div>

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Columna Izquierda (Foto y Estado) */}
        <div className="md:w-1/3 flex flex-col items-center gap-4">
          <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200 relative">
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon size={64} />
              </div>
            )}
            <div className="absolute top-3 right-3">
              {person.status === 'missing' ? (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <AlertCircle size={14}/> Desaparecido
                </span>
              ) : (
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 size={14}/> Localizado
                </span>
              )}
            </div>
          </div>
          <div className="text-center w-full">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">ID de Reporte</p>
            <p className="text-sm font-mono text-slate-700 bg-slate-100 py-1 rounded">{person.id.split('-')[0].toUpperCase()}</p>
          </div>
        </div>

        {/* Columna Derecha (Detalles) */}
        <div className="md:w-2/3 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{person.full_name}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-slate-600 font-medium">
              <span className="bg-slate-100 px-3 py-1 rounded-full">{person.gender}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">{person.age_group}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <MapPin className="text-slate-400 shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Última ubicación conocida</p>
                <p className="text-slate-800 font-medium">{person.last_known_location}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <User className="text-slate-400 shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Características Distintivas</p>
                <p className="text-slate-800 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  {person.distinctive_features || 'No se proporcionaron detalles adicionales.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <Calendar className="text-slate-400 shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Fecha del Reporte</p>
                <p className="text-slate-800 font-medium">{new Date(person.created_at).toLocaleDateString()} a las {new Date(person.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Información de Contacto del Reportante */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Phone size={18} className="text-blue-500" /> Contacto de quien reporta
            </h3>
            {reporter ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Nombre:</span>
                  <span className="font-semibold text-slate-800">{reporter.reporter_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Teléfono:</span>
                  <span className="font-semibold text-slate-800">{reporter.reporter_phone}</span>
                </div>
                {reporter.reporter_email && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Email:</span>
                    <span className="font-semibold text-slate-800">{reporter.reporter_email}</span>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2 text-center border-t border-slate-200 pt-2">
                  Contacta a esta persona si tienes información valiosa.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-sm font-medium">
                No hay información de contacto disponible para este reporte.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

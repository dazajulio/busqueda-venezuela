import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReportFormProps {
  onBack: () => void;
}

export default function ReportForm({ onBack }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    
    try {
      let photoUrl = null;

      // 1. Upload Photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `missing_persons/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile);

        if (uploadError) throw new Error('Error al subir la fotografía: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);
          
        photoUrl = publicUrlData.publicUrl;
      }

      // 2. Insert Person Data
      const { data: personData, error: personError } = await supabase
        .from('persons')
        .insert({
          full_name: formData.get('fullName'),
          age_group: formData.get('ageGroup'),
          gender: formData.get('gender'),
          distinctive_features: formData.get('features'),
          last_known_location: formData.get('location'),
          status: 'missing',
          photo_url: photoUrl
        })
        .select('id')
        .single();

      if (personError) throw new Error('Error al guardar datos de la persona: ' + personError.message);

      // 3. Insert Reporter Data
      const { error: reporterError } = await supabase
        .from('reporters')
        .insert({
          person_id: personData.id,
          reporter_name: formData.get('reporterName'),
          reporter_phone: formData.get('reporterPhone'),
          reporter_email: formData.get('reporterEmail') || null
        });

      if (reporterError) throw new Error('Error al guardar tus datos de contacto: ' + reporterError.message);

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado al enviar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center max-w-2xl mx-auto mt-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Reporte Registrado</h2>
        <p className="text-slate-600 mb-6">
          La información ha sido guardada exitosamente y ya está visible en la base de datos nacional para ayudar en la búsqueda.
        </p>
        <button 
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-4 text-white">
        <button onClick={onBack} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">Reportar Persona Desaparecida</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Sección: Fotografía */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Fotografía (Opcional pero muy útil)</h3>
          
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <div className="relative inline-block">
                <img src={photoPreview} alt="Vista previa" className="max-h-48 rounded-lg mx-auto shadow-sm" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                  <span className="text-white text-sm font-medium flex items-center gap-2"><Upload size={16}/> Cambiar foto</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Camera size={24} />
                </div>
                <p className="font-medium text-slate-700">Toca para subir o tomar una foto</p>
                <p className="text-xs text-slate-500 mt-1">Formatos soportados: JPG, PNG, WEBP</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoChange}
            />
          </div>
        </section>

        {/* Sección: Datos del Desaparecido */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Datos de la Persona</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium text-slate-700">Nombre completo y apellidos *</label>
              <input required name="fullName" type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej: María de los Ángeles Pérez" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Grupo de edad *</label>
              <select required name="ageGroup" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                <option value="">Seleccione...</option>
                <option value="Infante">Infante (0-5 años)</option>
                <option value="Niño">Niño/a (6-12 años)</option>
                <option value="Adolescente">Adolescente (13-17 años)</option>
                <option value="Adulto">Adulto (18-59 años)</option>
                <option value="Adulto Mayor">Adulto Mayor (60+ años)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Género *</label>
              <select required name="gender" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                <option value="">Seleccione...</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro / No especificado</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium text-slate-700">Última ubicación conocida (Lugar exacto) *</label>
              <input required name="location" type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej: Edificio Los Pinos, Chacao, Caracas" />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium text-slate-700">Características distintivas / Vestimenta</label>
              <textarea name="features" rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Llevaba franela roja, tiene un tatuaje en el brazo derecho, usa lentes..."></textarea>
            </div>
          </div>
        </section>

        {/* Sección: Datos del Reportante */}
        <section className="bg-slate-50 -mx-6 px-6 py-6 border-y border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Tus datos de contacto (Privado)</h3>
          <p className="text-xs text-slate-500 mb-4">Esta información no será pública. Solo las autoridades u otros usuarios coordinados podrán contactarte si encuentran a la persona.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium text-slate-700">Tu nombre completo *</label>
              <input required name="reporterName" type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Teléfono (con código) *</label>
              <input required name="reporterPhone" type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="+58 414 1234567" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
              <input name="reporterEmail" type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={24} /> Registrando alerta...</>
            ) : (
              'Publicar Alerta de Desaparición'
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-4">
            Al enviar, confirmas que la información es veraz a tu leal saber y entender.
          </p>
        </div>

      </form>
    </div>
  );
}

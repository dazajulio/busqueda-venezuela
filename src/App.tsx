import { useState } from 'react';
import { Search, AlertCircle, Phone, Info, ScanSearch } from 'lucide-react';
import ReportForm from './components/ReportForm';
import SearchList from './components/SearchList';
import RecentPhotos from './components/RecentPhotos';
import SidebarPosts from './components/SidebarPosts';

type ViewState = 'home' | 'report' | 'search';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <AlertCircle className="text-red-500" size={24} />
            <h1 className="text-xl font-bold tracking-tight">Ayuda Venezuela</h1>
          </div>
          <nav>
            <button 
              onClick={() => setCurrentView('search')}
              className="px-3 py-2 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Buscar
            </button>
            <button 
              onClick={() => setCurrentView('report')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
            >
              Reportar
            </button>
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 px-4 py-6">
        
        {/* Columna Izquierda (Solo Desktop) */}
        <SidebarPosts side="left" />

        {/* Columna Central (Contenido Principal) */}
        <main className="flex-1 min-w-0 space-y-6">
          {currentView === 'home' && (
            <>
              <section className="bg-white px-6 py-12 rounded-xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
                  <ScanSearch size={14} className="animate-pulse" />
                  <span>Búsqueda Inteligente con IA</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Registro Nacional de Desaparecidos</h2>
                <p className="text-slate-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                  Plataforma centralizada para reportar y localizar personas tras el sismo. Nuestro sistema cruza datos automáticamente con otros portales para acelerar la búsqueda.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => setCurrentView('search')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105"
                  >
                    <Search size={20} />
                    Estoy buscando a alguien
                  </button>
                  <button 
                    onClick={() => setCurrentView('report')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105"
                  >
                    <Info size={20} />
                    Tengo información o reporto
                  </button>
                </div>
              </section>

              {/* Preview Banner */}
              <section className="max-w-xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-center">
                <p className="text-sm font-medium">Si tiene una emergencia médica o estructural en curso, contacte directamente a los números de emergencia oficiales listados abajo.</p>
              </section>

              {/* Slider de fotos recientes */}
              <RecentPhotos />
            </>
          )}

          {currentView === 'report' && (
            <ReportForm onBack={() => setCurrentView('home')} />
          )}

          {currentView === 'search' && (
            <SearchList onBack={() => setCurrentView('home')} />
          )}
        </main>

        {/* Columna Derecha (Solo Desktop) */}
        <SidebarPosts side="right" />
        
      </div>

      <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Phone size={18} />
            Números de Emergencia Oficiales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nacional</div>
              <div className="text-2xl font-bold text-white">911</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Protección Civil</div>
              <div className="text-lg font-bold text-white">0800-PCIVIL1</div>
              <div className="text-sm text-slate-400">0800-7248451</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bomberos locales</div>
              <div className="text-sm text-slate-400">Comuníquese al 911 para derivación inmediata.</div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-500 space-y-2">
            <p>
              <strong>Nota Legal:</strong> Esta es una plataforma colaborativa de ayuda ciudadana. Los datos, imágenes y reportes aquí publicados son ingresados por el público general y son de exclusiva responsabilidad de la persona que los reporta.
            </p>
            <p>
              Powered by <a href="https://dazajulio.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors font-medium">dazajulio.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

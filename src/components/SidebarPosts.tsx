import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Megaphone } from 'lucide-react';

interface ImportantPost {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'info';
}

interface SidebarPostsProps {
  side: 'left' | 'right';
}

export default function SidebarPosts({ side }: SidebarPostsProps) {
  const [posts, setPosts] = useState<ImportantPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('important_posts')
          .select('id, title, content, type')
          .eq('side', side)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPosts(data);
        }
      } catch (err) {
        console.error(`Error fetching ${side} posts:`, err);
      }
    };

    fetchPosts();
  }, [side]);

  if (posts.length === 0) {
    return (
      <div className="hidden lg:flex w-64 md:w-72 shrink-0 flex-col gap-4 p-4 opacity-50">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-sm">
          Espacio reservado para avisos importantes.
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4 py-4 px-2">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
        <Megaphone size={16} /> 
        {side === 'left' ? 'Información Vital' : 'Avisos Recientes'}
      </h3>
      
      {posts.map((post) => (
        <div 
          key={post.id} 
          className={`p-4 rounded-xl shadow-sm border ${
            post.type === 'urgent' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-white border-slate-200'
          }`}
        >
          <h4 className={`font-bold mb-3 flex items-start gap-2 ${
            post.type === 'urgent' ? 'text-red-800' : 'text-slate-800'
          }`}>
            {post.type === 'urgent' && <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
            {post.title}
          </h4>
          
          {/* El contenedor [&_iframe]:w-full hace que cualquier video insertado ocupe el ancho correcto sin desbordar */}
          <div 
            className={`text-sm [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_img]:w-full [&_img]:rounded-lg [&_img]:mt-2 whitespace-pre-wrap break-words ${
              post.type === 'urgent' ? 'text-red-900/90' : 'text-slate-700'
            }`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      ))}
    </aside>
  );
}

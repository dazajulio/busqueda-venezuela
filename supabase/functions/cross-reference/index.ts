import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fullName, ageGroup, gender, features } = await req.json();

    if (!fullName) {
      throw new Error("El nombre completo (fullName) es requerido.");
    }

    // 1. Búsqueda real (Scraping) en venezuelatebusca.com usando Jina AI
    console.log(`Buscando a ${fullName} en venezuelatebusca.com...`);
    
    // Usamos r.jina.ai para extraer el contenido en formato texto/markdown de forma limpia
    const searchUrl = `https://r.jina.ai/https://venezuelatebusca.com/`; // Idealmente sería una URL de búsqueda como /search?q=nombre
    let extractedText = "";
    try {
      const portalResponse = await fetch(searchUrl);
      extractedText = await portalResponse.text();
      // Tomamos solo los primeros 3000 caracteres para no exceder el contexto y ahorrar tokens
      extractedText = extractedText.substring(0, 3000);
    } catch (e) {
      console.error("Error al extraer datos con Jina:", e);
      extractedText = "No se pudo acceder al portal externo.";
    }

    // 2. Llamada real a OpenRouter (LLM)
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    let matchResult = {
      isMatch: false,
      confidenceScore: 0,
      status: "unknown",
      reasoning: "No se pudo realizar el análisis con IA (falta API KEY).",
      url: ""
    };

    if (openRouterApiKey) {
      const prompt = `
        Eres un agente experto en localización de personas en crisis.
        
        Datos proporcionados por el usuario que reporta la desaparición:
        Nombre: ${fullName}
        Edad: ${ageGroup}
        Género: ${gender}
        Características: ${features}

        Texto extraído del portal externo "venezuelatebusca.com":
        """
        ${extractedText}
        """

        Evalúa si la persona descrita en los datos del usuario parece estar mencionada o listada en el texto extraído del portal externo.
        Presta especial atención a nombres similares o coincidencias de rasgos.

        Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura exacta, sin texto adicional ni bloques de código markdown:
        {
          "isMatch": true o false,
          "confidenceScore": número del 0 al 100,
          "status": "localizada", "buscada" o "desconocido",
          "reasoning": "Explicación breve de por qué crees que es la misma persona (o por qué no lo es)",
          "url": "https://venezuelatebusca.com/"
        }
      `;

      try {
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": "https://busquedavenezuela.vercel.app/",
            "X-Title": "Busqueda Venezuela AI Agent"
          },
          body: JSON.stringify({
            // Usamos un modelo rápido y capaz de OpenRouter (puede ser ajustado al modelo preferido)
            model: "meta-llama/llama-3-8b-instruct:free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const rawContent = aiData.choices[0].message.content.trim();
          
          // Limpiar el JSON por si el modelo devuelve markdown (ej. ```json ... ```)
          const jsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
          
          matchResult = JSON.parse(jsonString);
          
          // Asegurar que si hay match, asignemos la url base al menos
          if (matchResult.isMatch && !matchResult.url) {
            matchResult.url = "https://venezuelatebusca.com/";
          }
        } else {
           console.error("Error from OpenRouter API", await aiResponse.text());
        }
      } catch (err) {
        console.error("Failed to parse AI response:", err);
      }
    }

    return new Response(JSON.stringify(matchResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

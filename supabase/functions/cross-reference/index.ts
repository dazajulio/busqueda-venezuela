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

    // 1. Simulación de búsqueda (Scraping/API) en venezuelatebusca.com
    // En un entorno real, aquí se haría un fetch a su API de búsqueda o se usaría un web scraper.
    console.log(`Buscando a ${fullName} en venezuelatebusca.com...`);
    
    // Simulación de datos extraídos (Mock Data)
    // Supongamos que encontramos un perfil que coincide parcialmente.
    const mockExtractedText = `
      Resultados en venezuelatebusca.com:
      - Nombre registrado: ${fullName.split(' ')[0]} ${fullName.split(' ')[1] || ''}
      - Estado: Localizado/a y a salvo en el Hospital Central.
      - Edad aproximada: ${ageGroup || 'Desconocida'}
      - Rasgos: Coincide con la descripción proporcionada.
      - Enlace: https://venezuelatebusca.com/persona/12345
    `;

    // 2. Llamada al LLM para evaluar la coincidencia (Usando OpenAI como ejemplo)
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    let matchResult = {
      isMatch: false,
      confidenceScore: 0,
      status: "unknown",
      reasoning: "No se pudo realizar el análisis con IA (falta API KEY).",
      url: ""
    };

    if (openAiApiKey) {
      const prompt = `
        Eres un agente experto en localización de personas en crisis.
        
        Datos proporcionados por el usuario que reporta la desaparición:
        Nombre: ${fullName}
        Edad: ${ageGroup}
        Género: ${gender}
        Características: ${features}

        Texto extraído del portal externo "venezuelatebusca.com":
        """
        ${mockExtractedText}
        """

        Evalúa si la persona extraída del portal externo es la misma que la reportada.
        Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura:
        {
          "isMatch": boolean,
          "confidenceScore": number (0-100),
          "status": string ("localizada", "buscada", "desconocido"),
          "reasoning": string (explicación breve de la decisión),
          "url": string (enlace si está disponible)
        }
      `;

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        matchResult = JSON.parse(aiData.choices[0].message.content);
      } else {
         console.error("Error from OpenAI API", await aiResponse.text());
      }
    } else {
      // Mock de respuesta si no hay API Key configurada para que el Frontend funcione localmente
      if (Math.random() > 0.3) {
        matchResult = {
          isMatch: true,
          confidenceScore: 92,
          status: "localizada",
          reasoning: `Se encontró un registro muy similar de ${fullName} en el Hospital Central según venezuelatebusca.com.`,
          url: "https://venezuelatebusca.com/persona/12345"
        };
      } else {
        matchResult = {
          isMatch: false,
          confidenceScore: 10,
          status: "desconocido",
          reasoning: "No se encontraron coincidencias significativas en el portal externo.",
          url: ""
        };
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

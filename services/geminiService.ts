
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData, CriteriosAdjudicacion, OfferInputData } from '../types';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generatePrompt = (pcapText: string, pptText: string): string => `
Actúa como un experto consultor especializado en licitaciones públicas de electromedicina en España. Tu tarea es analizar el texto extraído de un Pliego de Cláusulas Administrativas Particulares (PCAP) y un Pliego de Prescripciones Técnicas (PPT).

Extrae únicamente la información verificable presente en los textos proporcionados para rellenar la estructura JSON solicitada. No incluyas explicaciones, introducciones o conclusiones fuera del objeto JSON.

**Análisis de Lotes:**
1.  **Detecta si es por lotes:** Primero, determina si la licitación está explícitamente dividida en lotes. Establece el campo 'esPorLotes' en 'true' si es así, y en 'false' en caso contrario.
2.  **Si es por lotes:** Rellena el array 'lotes'. Para cada lote identificado, extrae: 'nombre', 'centroAsociado', 'descripcion', 'presupuesto' (string numérico sin IVA), y 'requisitosClave'.
3.  **Si NO es por lotes:** El array 'lotes' debe quedar vacío ([]).

**Análisis de Criterios de Adjudicación y Fórmulas Económicas (CRÍTICO):**
Busca exhaustivamente en el PCAP la sección que define los criterios de adjudicación del contrato.
*   'puntuacionEconomica': El número MÁXIMO de puntos que se pueden obtener por el precio.
*   'formulaEconomica': **ANÁLISIS EXHAUSTIVO DE FÓRMULAS MATEMÁTICAS**
    
    **PASO 1 - BÚSQUEDA INTENSIVA:**
    Busca en TODO el documento cualquier mención de:
    - "fórmula", "formula", "cálculo", "calculo", "puntuación económica", "puntuacion economica"
    - "valoración económica", "valoracion economica", "criterio precio", "criterio económico"
    - Expresiones matemáticas con símbolos: +, -, *, /, ^, √, raíz, exponente, potencia
    - Variables como: P, A, B, C, X, Y, Z, Pi, Pe, Pm, Pmax, Pmin, etc.
    - Fracciones, cocientes, divisiones expresadas como "entre", "dividido", "cociente"
    - Raíces expresadas como: "raíz", "raiz", "√", "radical", "potencia de 1/n"
    - Exponentes expresados como: "elevado a", "^", "potencia", "exponente"
    
    **PASO 2 - IDENTIFICACIÓN DE VARIABLES:**
    Identifica qué representa cada variable en el contexto:
    - Variables de precio de oferta: P, Pi, Pe, Precio_oferta, Oferta, O, B
    - Variables de presupuesto: PBL, Presupuesto, A, Licitacion, L, VEC
    - Variables de oferta más baja: Pmin, P_min, Oferta_baja, C, Min
    - Variables de puntuación máxima: Pmax, P_max, Puntos_max, Maxima, U
    
    **PASO 3 - CONVERSIÓN A JAVASCRIPT:**
    Convierte la fórmula encontrada usando estas variables estándar:
    - 'price' = precio de la oferta a evaluar
    - 'tenderBudget' = presupuesto base de licitación
    - 'maxScore' = puntuación económica máxima
    - 'lowestPrice' = precio de la oferta más baja
    
    **EJEMPLOS DE CONVERSIÓN:**
    - "P_max * (P_min / P_i)" → "maxScore * (lowestPrice / price)"
    - "U * raíz cuadrada de (A-B)/(A-C)" → "maxScore * Math.sqrt((tenderBudget - price) / (tenderBudget - lowestPrice))"
    - "Puntos_max * ((PBL-Oferta)/(PBL-Oferta_baja))^0.5" → "maxScore * Math.pow((tenderBudget - price) / (tenderBudget - lowestPrice), 0.5)"
    - "40 * raíz sexta de (A-B)/(A-C)" → "maxScore * Math.pow((tenderBudget - price) / (tenderBudget - lowestPrice), 1/6)"
    - "P_max * (1 - (P_i - P_min)/(PBL - P_min))" → "maxScore * (1 - (price - lowestPrice) / (tenderBudget - lowestPrice))"
    
    **REGLAS DE CONVERSIÓN MATEMÁTICA:**
    - "raíz cuadrada" o "√" → "Math.sqrt()"
    - "raíz cúbica" → "Math.pow(x, 1/3)"
    - "raíz n-ésima" o "raíz a la n" → "Math.pow(x, 1/n)"
    - "elevado a n" o "^n" → "Math.pow(x, n)"
    - "entre", "dividido por", "/" → "/"
    - "por", "multiplicado por", "*" → "*"
    - Paréntesis se mantienen igual
    
    **VALIDACIÓN FINAL:**
    - La fórmula DEBE ser válida en JavaScript
    - DEBE incluir 'maxScore' para escalar el resultado
    - DEBE manejar casos donde price, tenderBudget, lowestPrice > 0
    - Si no encuentras fórmula explícita, usa: "maxScore * (lowestPrice / price)"
    
    **IMPORTANTE:** Extrae la fórmula EXACTA del documento, no inventes ni simplifiques.

*   'umbralBajaTemeraria': Describe las condiciones para que una oferta sea considerada anormalmente baja o temeraria.
*   'criteriosAutomaticos': Array con criterios evaluables por fórmula (descripción y puntuación).
*   'criteriosSubjetivos': Array con criterios de juicio de valor (descripción y puntuación).

**Instrucción clave para el presupuesto GENERAL:** Busca el "Presupuesto Base de Licitación" (PBL) o "Valor Estimado del Contrato" (VEC) **TOTAL**. Extrae su valor numérico **sin IVA** como una cadena de texto.

**Análisis Económico Detallado y Recomendaciones de Costes Estratégicos (MUY IMPORTANTE):**
Tu tarea más crítica es actuar como un estratega de licitaciones. No te limites a estimar los costes, sino que debes **proponer una oferta ganadora**.

1.  **Análisis Estratégico del Precio:**
    *   Revisa la \`formulaEconomica\` y el \`umbralBajaTemeraria\` que has extraído.
    *   Tu objetivo es determinar un precio de oferta total (base imponible) que sea lo más bajo posible para maximizar la \`puntuacionEconomica\`, pero sin caer en baja temeraria.
    *   Considera una oferta competitiva que probablemente supere a la de otros licitadores.

2.  **Generación de la Oferta Detallada (\`costesDetalladosRecomendados\`):**
    *   Una vez que hayas calculado el precio de oferta total estratégico, debes desglosarlo en el objeto \`costesDetalladosRecomendados\`.
    *   La suma de todos los costes que recomiendes, más los porcentajes de gastos generales y beneficio industrial, debe ser igual a tu precio de oferta estratégico.
    *   Basa tu desglose en los requisitos del PCAP y PPT (número de técnicos, equipos, etc.), pero ajústalo para que encaje en el precio ganador que has calculado.
    *   Asegúrate de incluir un **Beneficio Industrial (\`industrialProfitPercent\`)** razonable, por ejemplo, entre 3% y 6%.
    *   El campo \`costePersonal\` debe reflejar el coste de todo el personal requerido en el documento.
    *   Rellena todos los demás campos (\`vehiculos\`, \`materialIncluido\`, etc.) de forma lógica para llegar al total.

**ANÁLISIS CRÍTICO DE COSTES SALARIALES:**
Para el campo \`costesEstimados\` del personal, realiza un análisis detallado y realista:
1. **Identifica el número exacto de trabajadores** requeridos en el documento por cada puesto específico
2. **Calcula salarios anuales realistas** para cada puesto:
   - Técnicos de electromedicina: 25.000-35.000€ anuales
   - Ingenieros biomédicos: 35.000-50.000€ anuales
   - Responsables/coordinadores: 40.000-60.000€ anuales
   - Personal administrativo: 20.000-30.000€ anuales
   - Técnicos especialistas: 28.000-38.000€ anuales
   - Jefes de servicio: 50.000-70.000€ anuales
3. **Incluye cargas sociales** (aproximadamente 30% adicional sobre salario bruto)
4. **Multiplica por el número de trabajadores** de cada categoría
5. **El resultado debe ser un valor numérico realista** (ej: "180000" para 5 trabajadores)

**EJEMPLO DE CÁLCULO:**
- 2 Técnicos: 2 × 30.000€ × 1.30 (cargas) = 78.000€
- 1 Ingeniero: 1 × 45.000€ × 1.30 = 58.500€
- Total anual: 136.500€ → Valor a incluir: "136500"

**DESGLOSE DETALLADO DE PERSONAL:**
Para el campo \`totalTrabajadores\`, proporciona el número total (ej: "5").
Para el campo \`desglosePorPuesto\`, proporciona un desglose detallado y específico como:
"2 Técnicos de Electromedicina, 1 Ingeniero Biomédico Senior, 1 Responsable de Servicio, 1 Técnico Especialista en Equipos de Imagen"

**IMPORTANTE:** El desglose debe ser específico y detallado, mencionando:
- El número exacto para cada puesto
- El nombre completo y específico del puesto (no genérico)
- Las especialidades cuando sea relevante
- Los niveles de experiencia (junior, senior, etc.) si se especifican en el documento
**En resumen, para \`costesDetalladosRecomendados\`, no me des una estimación de los costes reales, sino el desglose de una oferta económica optimizada y estratégica que nos recomiendas presentar.**

Regla general: Si un dato no se encuentra, usa "No especificado en los documentos" para strings y arrays vacíos para listas. Para los costes recomendados, omite los campos que no puedas estimar.

--- TEXTO PCAP ---
${pcapText}
--- FIN TEXTO PCAP ---

--- TEXTO PPT ---
${pptText}
--- FIN TEXTO PPT ---
`;

const criterioDetalladoSchema = {
    type: Type.OBJECT,
    properties: {
        descripcion: { type: Type.STRING, description: "La descripción del criterio." },
        puntuacionMaxima: { type: Type.NUMBER, description: "La puntuación máxima para este criterio." }
    },
    required: ["descripcion", "puntuacionMaxima"]
};

const offerInputDataSchema = {
    type: Type.OBJECT,
    description: "Recomendaciones de costes para la oferta. Todos los valores son strings numéricos.",
    properties: {
        costePersonal: { type: Type.STRING },
        vacaciones: { type: Type.STRING },
        edesEquipoRespuestaRapida: { type: Type.STRING },
        materialIncluido: { type: Type.STRING },
        renovacionTecnologica: { type: Type.STRING },
        bolsaMateriales: { type: Type.STRING },
        dotacionTaller: { type: Type.STRING },
        equiposIT: { type: Type.STRING },
        equiposSustitucion: { type: Type.STRING },
        comprobadores: { type: Type.STRING },
        subcontratacion1: { type: Type.STRING },
        horasExtra: { type: Type.STRING },
        guardias: { type: Type.STRING },
        inventarioViajes: { type: Type.STRING },
        pisosSedes: { type: Type.STRING },
        vehiculos: { type: Type.STRING },
        combustibleAutopista: { type: Type.STRING },
        generalExpensesPercent: { type: Type.STRING, description: "Valor recomendado para gastos generales, ej: '13'" },
        industrialProfitPercent: { type: Type.STRING, description: "Valor recomendado para beneficio industrial, ej: '6'" },
    },
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
      esPorLotes: {
        type: Type.BOOLEAN,
        description: "Indica si la licitación está dividida en lotes. True si lo está, false si no."
      },
      lotes: {
        type: Type.ARRAY,
        description: "Una lista de los lotes si la licitación es por lotes. Estará vacío si no lo es.",
        items: {
          type: Type.OBJECT,
          properties: {
            nombre: { type: Type.STRING, description: "Nombre o número del lote." },
            centroAsociado: { type: Type.STRING, description: "Hospital o centro asociado al lote." },
            descripcion: { type: Type.STRING, description: "Descripción específica del lote." },
            presupuesto: { type: Type.STRING, description: "Presupuesto del lote sin IVA." },
            requisitosClave: { type: Type.STRING, description: "Requisitos técnicos clave para el lote." }
          },
          required: ["nombre", "centroAsociado", "descripcion", "presupuesto", "requisitosClave"]
        }
      },
      objetoLicitacion: {
        type: Type.OBJECT,
        properties: {
          descripcion: { type: Type.STRING },
          cpv: { type: Type.STRING },
          entidad: { type: Type.STRING },
        },
        required: ["descripcion", "cpv", "entidad"]
      },
      alcanceContrato: {
        type: Type.OBJECT,
        properties: {
          geografico: { type: Type.STRING },
          serviciosProductos: { type: Type.STRING },
          requisitosTecnicos: { type: Type.STRING },
          exclusiones: { type: Type.STRING },
        },
        required: ["geografico", "serviciosProductos", "requisitosTecnicos", "exclusiones"]
      },
      marcoTemporal: {
        type: Type.OBJECT,
        properties: {
          duracionBase: { type: Type.STRING },
          inicioPrevisto: { type: Type.STRING },
          finEstimado: { type: Type.STRING },
        },
        required: ["duracionBase", "inicioPrevisto", "finEstimado"]
      },
      regimenProrrogas: {
        type: Type.OBJECT,
        properties: {
          numeroMaximo: { type: Type.STRING },
          duracion: { type: Type.STRING },
          condiciones: { type: Type.STRING },
          procedimiento: { type: Type.STRING },
        },
        required: ["numeroMaximo", "duracion", "condiciones", "procedimiento"]
      },
      modificacionesContractuales: {
        type: Type.OBJECT,
        properties: {
          supuestos: { type: Type.STRING },
          porcentajeMaximo: { type: Type.STRING },
          procedimiento: { type: Type.STRING },
          documentacion: { type: Type.STRING },
        },
        required: ["supuestos", "porcentajeMaximo", "procedimiento", "documentacion"]
      },
      cronogramaProceso: {
        type: Type.OBJECT,
        properties: {
          limitePresentacion: { type: Type.STRING },
          aperturaSobres: { type: Type.STRING },
          plazoAdjudicacion: { type: Type.STRING },
          inicioEjecucion: { type: Type.STRING },
        },
        required: ["limitePresentacion", "aperturaSobres", "plazoAdjudicacion", "inicioEjecucion"]
      },
      analisisEconomico: {
        type: Type.OBJECT,
        properties: {
          presupuestoBaseLicitacion: { 
            type: Type.STRING,
            description: "El Presupuesto Base de Licitación (PBL) TOTAL sin IVA, como un string numérico. Ej: '125000.50'"
          },
          costesDetalladosRecomendados: offerInputDataSchema,
          personal: {
            type: Type.OBJECT,
            properties: {
              totalTrabajadores: { type: Type.STRING, description: "Número total de trabajadores requeridos (ej: '5')." },
              desglosePorPuesto: { type: Type.STRING, description: "Desglose de trabajadores por puesto (ej: '2 Ingenieros, 3 Técnicos')." },
              perfilesRequeridos: { type: Type.STRING, description: "Titulaciones o certificaciones necesarias." },
              dedicacion: { type: Type.STRING, description: "Dedicación estimada (jornada completa, etc.)." },
              costesEstimados: { type: Type.STRING, description: "Costes salariales estimados anuales (12 meses) basados en el documento, como un string numérico (ej: '120000.50')." },
            },
            required: ["totalTrabajadores", "desglosePorPuesto", "perfilesRequeridos", "dedicacion", "costesEstimados"]
          },
          compras: {
            type: Type.OBJECT,
            properties: {
              equipamiento: { type: Type.STRING },
              consumibles: { type: Type.STRING },
              repuestos: { type: Type.STRING },
            },
            required: ["equipamiento", "consumibles", "repuestos"]
          },
          subcontrataciones: {
            type: Type.OBJECT,
            properties: {
              servicios: { type: Type.STRING },
              limites: { type: Type.STRING },
              costes: { type: Type.STRING },
            },
            required: ["servicios", "limites", "costes"]
          },
          otrosGastos: {
            type: Type.OBJECT,
            properties: {
              seguros: { type: Type.STRING },
              generales: { type: Type.STRING },
              indirectos: { type: Type.STRING },
            },
            required: ["seguros", "generales", "indirectos"]
          },
        },
        required: ["presupuestoBaseLicitacion", "personal", "compras", "subcontrataciones", "otrosGastos"]
      },
      criteriosAdjudicacion: {
        type: Type.OBJECT,
        properties: {
            puntuacionEconomica: { 
                type: Type.NUMBER,
                description: "Puntuación máxima para la oferta económica."
            },
            formulaEconomica: {
                type: Type.STRING,
                description: "La fórmula matemática para la puntuación económica como un string de JavaScript."
            },
            umbralBajaTemeraria: {
                type: Type.STRING,
                description: "Descripción de las condiciones de baja temeraria."
            },
            criteriosAutomaticos: {
                type: Type.ARRAY,
                description: "Lista de criterios de adjudicación automáticos.",
                items: criterioDetalladoSchema
            },
            criteriosSubjetivos: {
                type: Type.ARRAY,
                description: "Lista de criterios de adjudicación por juicio de valor.",
                items: criterioDetalladoSchema
            }
        },
        required: ["puntuacionEconomica", "formulaEconomica", "umbralBajaTemeraria", "criteriosAutomaticos", "criteriosSubjetivos"]
      },
    },
    required: ["esPorLotes", "lotes", "objetoLicitacion", "alcanceContrato", "marcoTemporal", "regimenProrrogas", "modificacionesContractuales", "cronogramaProceso", "analisisEconomico", "criteriosAdjudicacion"]
};


export const analyzeDocuments = async (pcapText: string, pptText: string): Promise<ReportData> => {
  const prompt = generatePrompt(pcapText, pptText);
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-preview-06-17',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.1
        }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    return parsedData as ReportData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Error al analizar los documentos con la IA: ${error.message}`);
    }
    throw new Error("Error desconocido al analizar los documentos con la IA.");
  }
};

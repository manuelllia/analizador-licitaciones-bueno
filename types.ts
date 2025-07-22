
export interface LotData {
  nombre: string;
  centroAsociado: string;
  descripcion: string;
  presupuesto: string;
  requisitosClave: string;
}

export interface CriterioDetallado {
  descripcion: string;
  puntuacionMaxima: number;
}

export interface CriteriosAdjudicacion {
  puntuacionEconomica: number;
  formulaEconomica?: string;
  umbralBajaTemeraria?: string;
  criteriosAutomaticos: CriterioDetallado[];
  criteriosSubjetivos: CriterioDetallado[];
}

export interface ReportData {
  esPorLotes: boolean;
  lotes?: LotData[];
  objetoLicitacion: {
    descripcion: string;
    cpv: string;
    entidad: string;
  };
  alcanceContrato: {
    geografico: string;
    serviciosProductos: string;
    requisitosTecnicos: string;
    exclusiones: string;
  };
  marcoTemporal: {
    duracionBase: string;
    inicioPrevisto: string;
    finEstimado: string;
  };
  regimenProrrogas: {
    numeroMaximo: string;
    duracion: string;
    condiciones: string;
    procedimiento: string;
  };
  modificacionesContractuales: {
    supuestos: string;
    porcentajeMaximo: string;
    procedimiento: string;
    documentacion: string;
  };
  cronogramaProceso: {
    limitePresentacion: string;
    aperturaSobres: string;
    plazoAdjudicacion: string;
    inicioEjecucion: string;
  };
  analisisEconomico: {
    presupuestoBaseLicitacion: string;
    costesDetalladosRecomendados?: Partial<OfferInputData>;
    personal: {
      totalTrabajadores: string;
      desglosePorPuesto: string;
      perfilesRequeridos: string;
      dedicacion: string;
      costesEstimados: string;
    };
    compras: {
      equipamiento: string;
      consumibles: string;
      repuestos: string;
    };
    subcontrataciones: {
      servicios: string;
      limites: string;
      costes: string;
    };
    otrosGastos: {
      seguros: string;
      generales: string;
      indirectos: string;
    };
  };
  criteriosAdjudicacion: CriteriosAdjudicacion;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface OfferInputData {
  // Personnel
  costePersonal: string;
  vacaciones: string;
  edesEquipoRespuestaRapida: string;
  personalOtros1: string;
  personalOtros2: string;
  personalOtros3: string;

  // Materials & Equipment
  materialIncluido: string; // Compras
  materialExcluidoVentas: string;
  renovacionTecnologica: string;
  bolsaMateriales: string;
  dotacionTaller: string;
  equiposIT: string;
  equiposSustitucion: string;
  comprobadores: string;
  materialInventarioRfid: string;
  comprasOtros1: string;
  comprasOtros2: string;
  
  // Subcontracting
  subcontratacion1: string;
  subcontratacion2: string;
  subcontratacion3: string;
  subcontratacion4: string;
  subcontratacion5: string;
  subcontratacion6: string;
  subcontratacion7: string;
  subcontratacion8: string;

  // Other Direct Costs
  horasExtra: string;
  guardias: string;
  inventarioViajes: string; // viajes, dietas, hotel
  pisosSedes: string;
  vehiculos: string;
  combustibleAutopista: string;
  kilometrajeAdicional: string;
  consumos: string;
  atencionesViajesDietas: string;
  publicidad: string;
  otrosGastos1: string;
  otrosGastos2: string;

  // Global percentages & score
  generalExpensesPercent: string;
  industrialProfitPercent: string;
  technicalScore: string;
}

export interface CompetitionSettings {
    tenderBudget: string;
    maxEconomicScore: string;
    vatPercent: string;
}

export interface AutomaticCriterion {
  id: number;
  label: string;
  points: number;
  achieved: boolean;
}

export interface SubjectiveCriterion {
  id: number;
  label: string;
  maxPoints: number;
  scoredPoints: string; // Use string to handle input field value
}
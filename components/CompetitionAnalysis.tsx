
import React, { useState, useMemo, useEffect } from 'react';
import { OfferInputData, CompetitionSettings, CriteriosAdjudicacion } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface CompetitionAnalysisProps {
    tenderBudgetFromReport?: string;
    scoringCriteria?: CriteriosAdjudicacion;
    recommendedCosts?: Partial<OfferInputData>;
}

const initialOfferState: OfferInputData = {
  // Personnel
  costePersonal: '',
  vacaciones: '',
  edesEquipoRespuestaRapida: '',
  personalOtros1: '',
  personalOtros2: '',
  personalOtros3: '',

  // Materials & Equipment
  materialIncluido: '',
  materialExcluidoVentas: '',
  renovacionTecnologica: '',
  bolsaMateriales: '',
  dotacionTaller: '',
  equiposIT: '',
  equiposSustitucion: '',
  comprobadores: '',
  materialInventarioRfid: '',
  comprasOtros1: '',
  comprasOtros2: '',
  
  // Subcontracting
  subcontratacion1: '',
  subcontratacion2: '',
  subcontratacion3: '',
  subcontratacion4: '',
  subcontratacion5: '',
  subcontratacion6: '',
  subcontratacion7: '',
  subcontratacion8: '',

  // Other Direct Costs
  horasExtra: '',
  guardias: '',
  inventarioViajes: '',
  pisosSedes: '',
  vehiculos: '',
  combustibleAutopista: '',
  kilometrajeAdicional: '',
  consumos: '',
  atencionesViajesDietas: '',
  publicidad: '',
  otrosGastos1: '',
  otrosGastos2: '',

  // Global percentages & score
  generalExpensesPercent: '13',
  industrialProfitPercent: '6',
  technicalScore: '',
};


const initialSettings: CompetitionSettings = {
    tenderBudget: '',
    maxEconomicScore: '40',
    vatPercent: '21',
}

const InputGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200/80 h-full">
      <h3 className="text-lg font-bold text-teal-800 mb-4 border-b border-teal-100 pb-2">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
);
  
const NumberInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    placeholder?: string;
    unit?: string;
}> = ({ label, value, onChange, name, placeholder, unit = '€' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "0"}
          className="w-full pl-4 pr-12 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        />
        {unit && <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm text-slate-500">{unit}</span>}
      </div>
    </div>
);

const InfoDisplay: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className={`w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-800 font-semibold ${className}`}>
        {value}
      </div>
    </div>
);

const parseCurrencyString = (value: string | undefined): string => {
    if (!value || typeof value !== 'string') return '';
    const cleaned = value
        .replace(/€|\$|EUR|euros/gi, '')
        .replace(/\./g, '') 
        .replace(/,/g, '.') 
        .trim();
    const numericValue = parseFloat(cleaned);
    return isNaN(numericValue) ? '' : String(numericValue);
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
  
    return (
      <div className="border border-slate-200 rounded-lg">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
          aria-expanded={isOpen}
        >
          <span className="font-semibold text-slate-700">{title}</span>
          <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="p-4 space-y-4 border-t border-slate-200">
            {children}
          </div>
        )}
      </div>
    );
};

const OfferForm: React.FC<{
    offer: OfferInputData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ offer, onChange }) => {
    return (
      <div className="space-y-3">
        <CollapsibleSection title="Costes de Personal" defaultOpen={true}>
            <NumberInput label="Coste Personal" name="costePersonal" value={offer.costePersonal} onChange={onChange} />
            <NumberInput label="Vacaciones" name="vacaciones" value={offer.vacaciones} onChange={onChange} />
            <NumberInput label="EDE's / Equipo Resp. Rápida" name="edesEquipoRespuestaRapida" value={offer.edesEquipoRespuestaRapida} onChange={onChange} />
            <NumberInput label="Otros 1" name="personalOtros1" value={offer.personalOtros1} onChange={onChange} />
            <NumberInput label="Otros 2" name="personalOtros2" value={offer.personalOtros2} onChange={onChange} />
            <NumberInput label="Otros 3" name="personalOtros3" value={offer.personalOtros3} onChange={onChange} />
        </CollapsibleSection>
  
        <CollapsibleSection title="Costes de Compras y Material">
            <NumberInput label="Material Incluido (Compras)" name="materialIncluido" value={offer.materialIncluido} onChange={onChange} />
            <NumberInput label="Material Excluido (Ventas)" name="materialExcluidoVentas" value={offer.materialExcluidoVentas} onChange={onChange} />
            <NumberInput label="Renovación Tecnológica" name="renovacionTecnologica" value={offer.renovacionTecnologica} onChange={onChange} />
            <NumberInput label="Bolsa de Materiales" name="bolsaMateriales" value={offer.bolsaMateriales} onChange={onChange} />
            <NumberInput label="Dotación Taller y Técnicos" name="dotacionTaller" value={offer.dotacionTaller} onChange={onChange} />
            <NumberInput label="Equipos IT y Comunicaciones" name="equiposIT" value={offer.equiposIT} onChange={onChange} />
            <NumberInput label="Equipos de Sustitución" name="equiposSustitucion" value={offer.equiposSustitucion} onChange={onChange} />
            <NumberInput label="Comprobadores" name="comprobadores" value={offer.comprobadores} onChange={onChange} />
            <NumberInput label="Material Inventario (RFID, etc.)" name="materialInventarioRfid" value={offer.materialInventarioRfid} onChange={onChange} />
            <NumberInput label="Otros 1" name="comprasOtros1" value={offer.comprasOtros1} onChange={onChange} />
            <NumberInput label="Otros 2" name="comprasOtros2" value={offer.comprasOtros2} onChange={onChange} />
        </CollapsibleSection>
  
        <CollapsibleSection title="Costes de Subcontratación">
          {[...Array(8)].map((_, i) => (
            <NumberInput 
              key={i}
              label={`Subcontratación ${i + 1}`} 
              name={`subcontratacion${i + 1}`} 
              value={offer[`subcontratacion${i + 1}` as keyof OfferInputData]} 
              onChange={onChange} 
            />
          ))}
        </CollapsibleSection>
  
        <CollapsibleSection title="Otros Costes Directos">
          <NumberInput label="Horas Extra" name="horasExtra" value={offer.horasExtra} onChange={onChange} />
          <NumberInput label="Guardias" name="guardias" value={offer.guardias} onChange={onChange} />
          <NumberInput label="Inventario (Viajes, Dietas, Hotel)" name="inventarioViajes" value={offer.inventarioViajes} onChange={onChange} />
          <NumberInput label="Pisos y Sedes" name="pisosSedes" value={offer.pisosSedes} onChange={onChange} />
          <NumberInput label="Vehículos" name="vehiculos" value={offer.vehiculos} onChange={onChange} />
          <NumberInput label="Combustible y Autopistas" name="combustibleAutopista" value={offer.combustibleAutopista} onChange={onChange} />
          <NumberInput label="Kilometraje Adicional (No Vehículo Empresa)" name="kilometrajeAdicional" value={offer.kilometrajeAdicional} onChange={onChange} />
          <NumberInput label="Consumos" name="consumos" value={offer.consumos} onChange={onChange} />
          <NumberInput label="Atenciones, Viajes y Dietas" name="atencionesViajesDietas" value={offer.atencionesViajesDietas} onChange={onChange} />
          <NumberInput label="Gastos de Publicidad" name="publicidad" value={offer.publicidad} onChange={onChange} />
          <NumberInput label="Otros 1" name="otrosGastos1" value={offer.otrosGastos1} onChange={onChange} />
          <NumberInput label="Otros 2" name="otrosGastos2" value={offer.otrosGastos2} onChange={onChange} />
        </CollapsibleSection>
        
        <div className="pt-4 border-t mt-4 space-y-4">
            <h4 className="font-semibold text-md text-slate-700">Cálculo Global y Puntuación</h4>
            <NumberInput label="Gastos Generales" name="generalExpensesPercent" value={offer.generalExpensesPercent} onChange={onChange} unit="%" />
            <NumberInput label="Beneficio Industrial" name="industrialProfitPercent" value={offer.industrialProfitPercent} onChange={onChange} unit="%" />
            <NumberInput label="Puntuación Técnica Obtenida" name="technicalScore" value={offer.technicalScore} onChange={onChange} unit="puntos" placeholder="Ej: 50" />
        </div>
      </div>
    );
};

const ResultsSummaryTable: React.FC<{
    title: string;
    discountAmount: number;
    discountPercent: number;
    offerAmount: number;
    economicScore: number;
    tenderBudget: number;
    priceDifference: number;
    diffLabel: string;
    estimatedMarginAmount: number;
    estimatedMarginPercent: number;
    formatCurrency: (value: number) => string;
}> = ({ title, discountAmount, discountPercent, offerAmount, economicScore, tenderBudget, priceDifference, diffLabel, estimatedMarginAmount, estimatedMarginPercent, formatCurrency }) => {
    const diffColor = priceDifference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const diffText = priceDifference >= 0 ? `+${formatCurrency(priceDifference)}` : `${formatCurrency(priceDifference)}`;

    return(
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <div className="bg-[#a54a00] text-white text-center py-2 font-bold text-sm tracking-wider uppercase">
                {title}
            </div>
            <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-300">
                    <tr>
                        <td className="p-3 bg-[#d9662b] text-white font-bold w-1/3">BAJADA AÑO</td>
                        <td className="p-3 text-right font-semibold bg-[#f8cbad] text-gray-800">{formatCurrency(discountAmount)}</td>
                        <td className={`p-3 text-right font-bold text-gray-800 bg-yellow-200 w-1/4`}>{`${discountPercent.toFixed(2)}%`}</td>
                    </tr>
                    <tr>
                        <td className="p-3 bg-[#d9662b] text-white font-bold">OFERTA AÑO</td>
                        <td className="p-3 text-right font-semibold bg-[#f8cbad] text-gray-800">{formatCurrency(offerAmount)}</td>
                        <td className="p-3 text-right font-bold bg-orange-200 text-gray-800">{`${economicScore.toFixed(2)} pts`}</td>
                    </tr>
                    <tr>
                        <td className="p-3 bg-[#d9662b] text-white font-bold">OFERTA LICIT. AÑO</td>
                        <td className="p-3 text-right font-semibold bg-[#f8cbad] text-gray-800">{formatCurrency(tenderBudget)}</td>
                        <td className={`p-3 text-center font-bold text-xs ${diffColor}`}>
                            <div>{diffLabel}</div>
                            <div className="text-sm">{diffText}</div>
                        </td>
                    </tr>
                    <tr className="border-t-2 border-gray-400">
                        <td className="p-3 bg-[#d9662b] text-white font-bold">MARGEN</td>
                        <td className="p-3 text-right font-semibold bg-[#f8cbad] text-gray-800">{formatCurrency(estimatedMarginAmount)}</td>
                        <td className={`p-3 text-right font-bold bg-orange-200 ${estimatedMarginPercent < 0 ? 'text-red-600' : 'text-green-800'}`}>{`${estimatedMarginPercent.toFixed(2)}%`}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const calculateEconomicScore = (price: number, tenderBudget: number, maxScore: number, lowestPrice: number, formula: string | undefined): number => {
    // Enhanced validation
    if (price <= 0 || tenderBudget <= 0 || maxScore <= 0) {
        return 0;
    }

    // Use fallback formula if no custom formula provided
    if (!formula || formula.trim() === '') {
        return lowestPrice > 0 ? Math.min(maxScore, (lowestPrice / price) * maxScore) : 0;
    }

    try {
        let sanitizedFormula = formula.trim();
        
        console.log('Original formula:', formula);
        
        // Enhanced formula preprocessing
        // Handle mathematical expressions in Spanish/common formats
        sanitizedFormula = sanitizedFormula
            // Handle roots first (most specific to least specific)
            .replace(/raíz\s+sexta\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/6)')
            .replace(/raíz\s+quinta\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/5)')
            .replace(/raíz\s+cuarta\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/4)')
            .replace(/raíz\s+cúbica\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/3)')
            .replace(/raíz\s+cuadrada\s+de\s*\(([^)]+)\)/gi, 'Math.sqrt($1)')
            .replace(/raíz\s+a\s+la\s+(\d+)\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($2), 1/$1)')
            .replace(/raiz\s+sexta\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/6)')
            .replace(/raiz\s+quinta\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/5)')
            .replace(/raiz\s+cuarta\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/4)')
            .replace(/raiz\s+cubica\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($1), 1/3)')
            .replace(/raiz\s+cuadrada\s+de\s*\(([^)]+)\)/gi, 'Math.sqrt($1)')
            .replace(/raiz\s+a\s+la\s+(\d+)\s+de\s*\(([^)]+)\)/gi, 'Math.pow(($2), 1/$1)')
            .replace(/√\s*\(([^)]+)\)/gi, 'Math.sqrt($1)')
            
            // Handle exponents
            .replace(/elevado\s+a\s+(\d+(?:\.\d+)?)/gi, '**$1')
            .replace(/\^(\d+(?:\.\d+)?)/g, '**$1')
            .replace(/\*\*(\d+(?:\.\d+)?)/g, (match, exp) => `**${exp}`)
            
            // Handle division expressions
            .replace(/\s+entre\s+/gi, ' / ')
            .replace(/\s+dividido\s+por\s+/gi, ' / ')
            .replace(/\s+dividido\s+entre\s+/gi, ' / ')
            
            // Handle multiplication expressions
            .replace(/\s+por\s+/gi, ' * ')
            .replace(/\s+multiplicado\s+por\s+/gi, ' * ')
            
            // Clean up extra spaces
            .replace(/\s+/g, ' ');

        console.log('After math preprocessing:', sanitizedFormula);
        
        // Enhanced variable replacement - more comprehensive mapping
        sanitizedFormula = sanitizedFormula
            // Tender budget variations (most specific first)
            .replace(/\b(presupuesto_base_licitacion|presupuesto_licitacion|presupuesto_base|PBL|VEC|valor_estimado_contrato|P_lic|LICITACION|presupuesto|budget)\b/gi, 'tenderBudget')
            
            // Price/offer variations
            .replace(/\b(precio_oferta|oferta_evaluar|oferta_valorar|OFERTA_A_VALORAR|precio_i|P_i|Pi|Pe|oferta|precio)\b/gi, 'price')
            
            // Lowest price variations
            .replace(/\b(precio_minimo|oferta_minima|oferta_baja|precio_mas_bajo|P_min|P_minimo|O_baja|P_baja|OFERTA_BAJA|O_min|minimo|min_price)\b/gi, 'lowestPrice')
            
            // Max score variations
            .replace(/\b(puntuacion_maxima|puntos_maximos|puntuacion_max|P_max|P_maxima|U_max|PUNTOS_MAXIMOS|puntos_max|maxima|max_puntos)\b/gi, 'maxScore')
            
            // Handle single letter variables (be very careful with order)
            // Replace in reverse alphabetical order to avoid conflicts
            .replace(/\bZ\b/g, 'lowestPrice')  // Sometimes Z is used for minimum
            .replace(/\bY\b/g, 'price')        // Sometimes Y is used for offer
            .replace(/\bX\b/g, 'tenderBudget') // Sometimes X is used for budget
            .replace(/\bU\b/g, 'maxScore')     // U often represents max score
            .replace(/\bL\b/g, 'tenderBudget') // L for "Licitación"
            .replace(/\bO\b/g, 'price')        // O for "Oferta"
            .replace(/\bP\b(?!rice|_)/g, 'price') // P for "Precio" but not "Price" or "P_"
            
            // Handle A, B, C pattern (most common)
            // C = lowest price, B = current price, A = tender budget
        sanitizedFormula = sanitizedFormula
            .replace(/\bC\b/g, 'lowestPrice')
            .replace(/\bB\b/g, 'price')
            .replace(/\bA\b/g, 'tenderBudget')
            
            // Clean up any remaining underscores and normalize
            .replace(/_/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        console.log('After variable replacement:', sanitizedFormula);

        // Enhanced sandboxed evaluation with better error handling
        const evaluationFunction = new Function(
            'price', 
            'tenderBudget', 
            'maxScore', 
            'lowestPrice', 
            'Math',
            `
            try {
                const result = ${sanitizedFormula};
                if (typeof result !== 'number' || !isFinite(result)) {
                    throw new Error('Formula result is not a valid number');
                }
                return result;
            } catch (e) {
                console.error('Formula evaluation error:', e);
                throw e;
            }
            `
        );
        
        const score = evaluationFunction(price, tenderBudget, maxScore, lowestPrice, Math);
        
        console.log('Calculated score:', score);
        
        if (typeof score !== 'number' || !isFinite(score) || score < 0) {
            throw new Error('Invalid score result');
        }
        
        return Math.max(0, Math.min(score, maxScore));

    } catch (error) {
        console.error("Error evaluating economic formula:", error, "Formula:", formula);
        // Enhanced fallback logic
        return lowestPrice > 0 && price <= tenderBudget 
            ? Math.min(maxScore, (lowestPrice / price) * maxScore) 
            : 0;
    }
};


const CompetitionAnalysis: React.FC<CompetitionAnalysisProps> = ({ tenderBudgetFromReport, scoringCriteria, recommendedCosts }) => {
    const [ourOffer, setOurOffer] = useState<OfferInputData>(initialOfferState);
    const [settings, setSettings] = useState<CompetitionSettings>(initialSettings);
    const [competitorDiscount, setCompetitorDiscount] = useState('15');
    const [competitorTechnicalScore, setCompetitorTechnicalScore] = useState('45');

    useEffect(() => {
        // Set settings from the main report
        const budgetValue = parseCurrencyString(tenderBudgetFromReport);
        if (budgetValue) {
            setSettings(prev => ({...prev, tenderBudget: budgetValue}));
        }
        if (scoringCriteria) {
            setSettings(prev => ({...prev, maxEconomicScore: String(scoringCriteria.puntuacionEconomica)}));
        }

        // Pre-fill offer with AI recommendations on new analysis
        const newOffer = { ...initialOfferState };
        if (recommendedCosts) {
            // Merge recommended costs into the clean initial state
            Object.assign(newOffer, recommendedCosts);
        }
        setOurOffer(newOffer);

    }, [tenderBudgetFromReport, scoringCriteria, recommendedCosts]);

    const handleOurOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOurOffer({ ...ourOffer, [e.target.name]: e.target.value });
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const formatCurrency = (value: number) => {
        if (isNaN(value)) return '0,00 €';
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    }
    
    const p = (v: string | undefined) => parseFloat(String(v)) || 0;
    
    const ourResults = useMemo(() => {
        const personnelCosts = p(ourOffer.costePersonal) + p(ourOffer.vacaciones) + p(ourOffer.edesEquipoRespuestaRapida) + p(ourOffer.personalOtros1) + p(ourOffer.personalOtros2) + p(ourOffer.personalOtros3);
        const materialCosts = p(ourOffer.materialIncluido) + p(ourOffer.materialExcluidoVentas) + p(ourOffer.renovacionTecnologica) + p(ourOffer.bolsaMateriales) + p(ourOffer.dotacionTaller) + p(ourOffer.equiposIT) + p(ourOffer.equiposSustitucion) + p(ourOffer.comprobadores) + p(ourOffer.materialInventarioRfid) + p(ourOffer.comprasOtros1) + p(ourOffer.comprasOtros2);
        const subcontractingCosts = p(ourOffer.subcontratacion1) + p(ourOffer.subcontratacion2) + p(ourOffer.subcontratacion3) + p(ourOffer.subcontratacion4) + p(ourOffer.subcontratacion5) + p(ourOffer.subcontratacion6) + p(ourOffer.subcontratacion7) + p(ourOffer.subcontratacion8);
        const otherDirectCosts = p(ourOffer.horasExtra) + p(ourOffer.guardias) + p(ourOffer.inventarioViajes) + p(ourOffer.pisosSedes) + p(ourOffer.vehiculos) + p(ourOffer.combustibleAutopista) + p(ourOffer.kilometrajeAdicional) + p(ourOffer.consumos) + p(ourOffer.atencionesViajesDietas) + p(ourOffer.publicidad) + p(ourOffer.otrosGastos1) + p(ourOffer.otrosGastos2);
    
        const totalDirectCost = personnelCosts + materialCosts + subcontractingCosts + otherDirectCosts;
        const generalExpensesAmount = totalDirectCost * (p(ourOffer.generalExpensesPercent) / 100);
        const subtotal = totalDirectCost + generalExpensesAmount;
        const profitAmount = subtotal * (p(ourOffer.industrialProfitPercent) / 100);
        const taxableBase = subtotal + profitAmount;
        const vatAmount = taxableBase * (p(settings.vatPercent) / 100);
        const totalOfferPrice = taxableBase + vatAmount;
        const profitMargin = taxableBase > 0 ? (profitAmount / taxableBase) * 100 : 0;
        
        return { totalDirectCost, generalExpensesAmount, subtotal, profitAmount, taxableBase, vatAmount, totalOfferPrice, profitMargin };
    }, [ourOffer, settings.vatPercent]);

    const tenderBudgetNum = p(settings.tenderBudget);
    const competitorTaxableBase = tenderBudgetNum > 0 ? tenderBudgetNum * (1 - (p(competitorDiscount) / 100)) : 0;

    const { ourEconomicScore, competitorEconomicScore } = useMemo(() => {
        const maxScore = p(settings.maxEconomicScore);
        const ourPrice = ourResults.taxableBase;
        
        if (maxScore <= 0 || tenderBudgetNum <= 0) {
            return { ourEconomicScore: 0, competitorEconomicScore: 0 };
        }
    
        const validPrices = [ourPrice, competitorTaxableBase].filter(price => price > 0 && price <= tenderBudgetNum);
        const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
        
        const formula = scoringCriteria?.formulaEconomica;

        return {
            ourEconomicScore: calculateEconomicScore(ourPrice, tenderBudgetNum, maxScore, lowestPrice, formula),
            competitorEconomicScore: calculateEconomicScore(competitorTaxableBase, tenderBudgetNum, maxScore, lowestPrice, formula)
        };

    }, [ourResults.taxableBase, competitorTaxableBase, settings.maxEconomicScore, tenderBudgetNum, scoringCriteria]);
    
    const competitorCostSubtotal = ourResults.subtotal; // Assumption: competitor has similar costs
    const competitorProfit = competitorTaxableBase - competitorCostSubtotal;
    const competitorMarginPercent = competitorTaxableBase > 0 ? (competitorProfit / competitorTaxableBase) * 100 : 0;

    const ourTotalScore = p(ourOffer.technicalScore) + ourEconomicScore;
    const competitorTotalScore = p(competitorTechnicalScore) + competitorEconomicScore;

    const winner = ourTotalScore > 0 || competitorTotalScore > 0 
        ? (ourTotalScore >= competitorTotalScore ? 'our' : 'competitor') 
        : 'none';


    return (
        <div className="space-y-8">
             <div className="text-center px-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Análisis de Costes</h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">Introduzca los datos de su oferta, simule un competidor y analice los costes y márgenes para determinar su oferta económica.</p>
            </div>
            
            <InputGroup title="Parámetros de la Licitación">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                     <NumberInput label="Presupuesto Base (sin IVA)" name="tenderBudget" value={settings.tenderBudget} onChange={handleSettingsChange} placeholder="Ej: 100000" />
                     <NumberInput label="Puntuación Económica Máx." name="maxEconomicScore" value={settings.maxEconomicScore} onChange={handleSettingsChange} unit="puntos" />
                     <NumberInput label="Tipo de IVA" name="vatPercent" value={settings.vatPercent} onChange={handleSettingsChange} unit="%" />
                </div>
                 {scoringCriteria?.formulaEconomica && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <h4 className="font-semibold text-blue-800">Fórmula de Puntuación Económica Aplicada:</h4>
                        <p className="text-sm text-blue-700 font-mono mt-2 bg-white p-2 rounded shadow-inner">{scoringCriteria.formulaEconomica}</p>
                    </div>
                )}
                 {scoringCriteria?.umbralBajaTemeraria && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                        <h4 className="font-semibold text-amber-800">Umbral de Baja Temeraria:</h4>
                        <p className="text-sm text-amber-700 mt-1">{scoringCriteria.umbralBajaTemeraria}</p>
                    </div>
                )}
            </InputGroup>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                <InputGroup title="Nuestra Oferta">
                    <OfferForm offer={ourOffer} onChange={handleOurOfferChange} />
                </InputGroup>
                
                <InputGroup title="Análisis de Competidor Hipotético">
                    <p className="text-xs sm:text-sm text-slate-600 -mt-2">Simule la oferta de un competidor basándose en un porcentaje de bajada sobre el presupuesto.</p>
                    
                    <NumberInput 
                        label="Porcentaje de Bajada"
                        name="competitorDiscount"
                        value={competitorDiscount}
                        onChange={(e) => setCompetitorDiscount(e.target.value)}
                        unit="%"
                        placeholder="Ej: 15"
                    />

                    {tenderBudgetNum > 0 && (
                        <div className="space-y-3 pt-3 border-t mt-4">
                            <InfoDisplay 
                                label="Importe de la Bajada (calculado)" 
                                value={formatCurrency(tenderBudgetNum * (p(competitorDiscount) / 100))} 
                            />
                            <InfoDisplay 
                                label="Oferta Año Competidor (calculada)" 
                                value={formatCurrency(competitorTaxableBase)} 
                            />
                            <InfoDisplay 
                                label="Oferta Licitación (Presupuesto Base)" 
                                value={formatCurrency(tenderBudgetNum)} 
                            />
                            <InfoDisplay 
                                label="Margen de Ganancia Estimado Competidor" 
                                value={`${formatCurrency(competitorProfit)} (${competitorMarginPercent.toFixed(2)}%)`}
                                className={competitorMarginPercent < 0 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}
                            />
                        </div>
                    )}
                    
                    <div className="pt-3 border-t mt-4">
                        <NumberInput 
                            label="Puntuación Técnica Estimada"
                            name="competitorTechnicalScore"
                            value={competitorTechnicalScore}
                            onChange={(e) => setCompetitorTechnicalScore(e.target.value)}
                            unit="puntos"
                            placeholder="Ej: 45"
                        />
                    </div>
                </InputGroup>
            </div>
            
            <div className="bg-slate-50 p-4 sm:p-6 rounded-xl shadow-inner border">
                 <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4 sm:mb-6">Resultados del Análisis</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3">
                         <ResultsSummaryTable
                            title="Nuestra Oferta"
                            discountAmount={tenderBudgetNum > 0 && ourResults.taxableBase > 0 ? tenderBudgetNum - ourResults.taxableBase : 0}
                            discountPercent={tenderBudgetNum > 0 && ourResults.taxableBase > 0 ? ((tenderBudgetNum - ourResults.taxableBase) / tenderBudgetNum) * 100 : 0}
                            offerAmount={ourResults.taxableBase}
                            economicScore={ourEconomicScore}
                            tenderBudget={tenderBudgetNum}
                            priceDifference={ourResults.taxableBase - tenderBudgetNum}
                            diffLabel='DIF. vs PRESUPUESTO'
                            estimatedMarginAmount={ourResults.profitAmount}
                            estimatedMarginPercent={ourResults.profitMargin}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                     <div className="space-y-3">
                        <ResultsSummaryTable
                            title="Competidor Hipotético"
                            discountAmount={tenderBudgetNum * (p(competitorDiscount) / 100)}
                            discountPercent={p(competitorDiscount)}
                            offerAmount={competitorTaxableBase}
                            economicScore={competitorEconomicScore}
                            tenderBudget={tenderBudgetNum}
                            priceDifference={ourResults.taxableBase - competitorTaxableBase}
                            diffLabel='DIF. vs NUESTRA OFERTA'
                            estimatedMarginAmount={competitorProfit}
                            estimatedMarginPercent={competitorMarginPercent}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                 </div>

                 <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-5 rounded-lg shadow-md border max-w-3xl mx-auto">
                    <h4 className="font-bold text-lg sm:text-xl text-teal-800 text-center mb-4">Tabla Comparativa de Puntuaciones</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-center text-sm sm:text-base">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2 sm:p-3 font-semibold text-slate-700 text-left text-xs sm:text-sm">Concepto</th>
                                    <th className="p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Nuestra Oferta</th>
                                    <th className="p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Competidor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">Puntuación Técnica</td>
                                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{p(ourOffer.technicalScore).toFixed(2)}</td>
                                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{p(competitorTechnicalScore).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">Puntuación Económica</td>
                                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{ourEconomicScore.toFixed(2)}</td>
                                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{competitorEconomicScore.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="p-2 sm:p-3 text-left font-bold text-teal-800 text-xs sm:text-sm">PUNTUACIÓN TOTAL</td>
                                    <td className={`p-2 sm:p-3 font-bold text-lg sm:text-xl text-teal-700 ${winner === 'our' ? 'bg-teal-100' : ''}`}>{ourTotalScore.toFixed(2)}</td>
                                    <td className={`p-2 sm:p-3 font-bold text-lg sm:text-xl text-teal-700 ${winner === 'competitor' ? 'bg-teal-100' : ''}`}>{competitorTotalScore.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 sm:mt-6 text-center">
                        <h4 className="font-bold text-base sm:text-lg text-teal-800">Veredicto</h4>
                        <p className="text-slate-600 mt-1 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base">
                            {winner === 'our' && <> <TrophyIcon className="w-6 h-6 text-yellow-500"/> <span>Con los datos actuales, <strong>nuestra oferta ganaría</strong>.</span></>}
                            {winner === 'competitor' && 'La oferta simulada de la competencia parece más fuerte y probablemente ganaría la licitación.'}
                            {winner === 'none' && 'Introduzca los datos para ver un veredicto.'}
                        </p>
                    </div>
                     <div className={`mt-3 text-center text-sm sm:text-base md:text-lg font-semibold rounded-lg p-2 ${ourResults.profitMargin >= 3 ? 'text-green-700 bg-green-100' : 'text-orange-700 bg-orange-100'}`}>
                        Margen de beneficio de nuestra oferta: {ourResults.profitMargin.toFixed(2)}%
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default CompetitionAnalysis;

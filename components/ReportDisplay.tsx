
import React, { useState } from 'react';
import { ReportData } from '../types';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
}

const formatAsEuros = (value: string | undefined) => {
    if (!value || isNaN(parseFloat(value))) return value || 'No especificado';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(parseFloat(value));
};

const ReportSection: React.FC<ReportSectionProps> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80 mb-8">
    <h3 className="text-xl font-bold text-teal-700 mb-5 border-b-2 border-teal-100 pb-3">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

interface DataRowProps {
    label: string;
    value?: string | React.ReactNode;
}

const DataRow: React.FC<DataRowProps> = ({ label, value }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 py-3 border-b border-slate-100 last:border-b-0">
        <p className="text-sm font-semibold text-slate-600 md:col-span-1">{label}</p>
        <div className="md:col-span-2">
            { value ? (typeof value === 'string' ? <p className="text-base text-slate-800">{value}</p> : value) : <p className="text-base text-slate-400 italic">No especificado</p> }
        </div>
    </div>
);

const EconomicDataRow: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        { value ? <p className="text-sm text-slate-800">{value}</p> : <p className="text-sm text-slate-400 italic">No especificado</p> }
    </div>
);

const GeneralReportSections: React.FC<{ report: ReportData }> = ({ report }) => {
    const { 
        alcanceContrato, 
        marcoTemporal, 
        regimenProrrogas, 
        modificacionesContractuales, 
        cronogramaProceso, 
        analisisEconomico 
    } = report;
    
    return (
        <>
            <ReportSection title="Alcance del Contrato">
                <DataRow label="Ámbito Geográfico" value={alcanceContrato?.geografico} />
                <DataRow label="Servicios/Productos Incluidos" value={alcanceContrato?.serviciosProductos} />
                <DataRow label="Requisitos Técnicos Fundamentales" value={alcanceContrato?.requisitosTecnicos} />
                <DataRow label="Exclusiones Específicas" value={alcanceContrato?.exclusiones} />
            </ReportSection>
            
            <ReportSection title="Marco Temporal">
                <DataRow label="Duración Base del Contrato" value={marcoTemporal?.duracionBase} />
                <DataRow label="Fecha de Inicio Prevista" value={marcoTemporal?.inicioPrevisto} />
                <DataRow label="Fecha de Finalización Estimada" value={marcoTemporal?.finEstimado} />
            </ReportSection>

            <ReportSection title="Régimen de Prórrogas">
                <DataRow label="Número Máximo de Prórrogas" value={regimenProrrogas?.numeroMaximo} />
                <DataRow label="Duración de Cada Prórroga" value={regimenProrrogas?.duracion} />
                <DataRow label="Condiciones para Aplicación" value={regimenProrrogas?.condiciones} />
                <DataRow label="Procedimiento de Solicitud" value={regimenProrrogas?.procedimiento} />
            </ReportSection>

            <ReportSection title="Modificaciones Contractuales">
                <DataRow label="Supuestos Permitidos" value={modificacionesContractuales?.supuestos} />
                <DataRow label="Porcentaje Máximo de Modificación" value={modificacionesContractuales?.porcentajeMaximo} />
                <DataRow label="Procedimiento Formal" value={modificacionesContractuales?.procedimiento} />
                <DataRow label="Documentación Requerida" value={modificacionesContractuales?.documentacion} />
            </ReportSection>

            <ReportSection title="Cronograma del Proceso">
                <DataRow label="Fecha Límite de Presentación" value={cronogramaProceso?.limitePresentacion} />
                <DataRow label="Fecha Apertura de Sobres" value={cronogramaProceso?.aperturaSobres} />
                <DataRow label="Plazo Estimado de Adjudicación" value={cronogramaProceso?.plazoAdjudicacion} />
                <DataRow label="Fecha Prevista de Inicio de Ejecución" value={cronogramaProceso?.inicioEjecucion} />
            </ReportSection>
            
            <ReportSection title="Análisis Económico Detallado">
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 mb-8 text-center shadow-inner">
                    <p className="text-sm font-semibold text-teal-800 uppercase tracking-wider">Presupuesto Base de Licitación (sin IVA)</p>
                    <p className="text-4xl font-extrabold text-teal-700 mt-2">
                        {formatAsEuros(analisisEconomico?.presupuestoBaseLicitacion)}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-5 border rounded-lg bg-slate-50/70 space-y-3 flex flex-col h-full">
                        <h4 className="font-bold text-md text-teal-800 border-b pb-2 mb-3">Personal</h4>
                        <div className="flex-grow space-y-3">
                            <EconomicDataRow label="Número Total de Trabajadores" value={analisisEconomico?.personal?.totalTrabajadores} />
                            <EconomicDataRow label="Desglose por Puesto" value={analisisEconomico?.personal?.desglosePorPuesto} />
                            <EconomicDataRow label="Perfiles Requeridos (Titulaciones)" value={analisisEconomico?.personal?.perfilesRequeridos} />
                            <EconomicDataRow label="Dedicación Estimada" value={analisisEconomico?.personal?.dedicacion} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-200">
                            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">Costes Salariales Estimados (Anual)</p>
                            <p className="text-2xl font-bold text-teal-600 mt-1">
                                {formatAsEuros(analisisEconomico?.personal?.costesEstimados)}
                            </p>
                        </div>
                    </div>
                    <div className="p-5 border rounded-lg bg-slate-50/70 space-y-3 h-full">
                        <h4 className="font-bold text-md text-teal-800 border-b pb-2 mb-3">Compras</h4>
                        <EconomicDataRow label="Equipamiento Necesario" value={analisisEconomico?.compras?.equipamiento} />
                        <EconomicDataRow label="Consumibles" value={analisisEconomico?.compras?.consumibles} />
                        <EconomicDataRow label="Repuestos" value={analisisEconomico?.compras?.repuestos} />
                    </div>
                    <div className="p-5 border rounded-lg bg-slate-50/70 space-y-3 h-full">
                        <h4 className="font-bold text-md text-teal-800 border-b pb-2 mb-3">Subcontrataciones</h4>
                        <EconomicDataRow label="Servicios Externalizables" value={analisisEconomico?.subcontrataciones?.servicios} />
                        <EconomicDataRow label="Límites de Subcontratación" value={analisisEconomico?.subcontrataciones?.limites} />
                        <EconomicDataRow label="Costes Estimados" value={analisisEconomico?.subcontrataciones?.costes} />
                    </div>
                    <div className="p-5 border rounded-lg bg-slate-50/70 space-y-3 h-full">
                        <h4 className="font-bold text-md text-teal-800 border-b pb-2 mb-3">Otros Gastos</h4>
                        <EconomicDataRow label="Seguros" value={analisisEconomico?.otrosGastos?.seguros} />
                        <EconomicDataRow label="Gastos Generales" value={analisisEconomico?.otrosGastos?.generales} />
                        <EconomicDataRow label="Costes Indirectos" value={analisisEconomico?.otrosGastos?.indirectos} />
                    </div>
                </div>
            </ReportSection>
        </>
    );
};


const ReportDisplay: React.FC<{ report: ReportData }> = ({ report }) => {
  const [activeLotIndex, setActiveLotIndex] = useState(0);

  const { esPorLotes, lotes, objetoLicitacion } = report;

  // --- Lot-based Tender View ---
  if (esPorLotes && lotes && lotes.length > 0) {
    const activeLot = lotes[activeLotIndex];
    return (
        <div className="space-y-6">
            <ReportSection title="Objeto General de la Licitación">
                <DataRow label="Descripción General" value={objetoLicitacion?.descripcion} />
                <DataRow label="Entidad Contratante" value={objetoLicitacion?.entidad} />
                <DataRow label="Clasificación CPV" value={objetoLicitacion?.cpv} />
            </ReportSection>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80 mb-8">
                <h3 className="text-xl font-bold text-teal-700 mb-5 border-b-2 border-teal-100 pb-3">Detalle por Lote</h3>
                <div className="flex flex-wrap justify-center gap-3">
                    {lotes.map((lot, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveLotIndex(index)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border-2 ${
                        activeLotIndex === index
                            ? 'bg-teal-500 text-white border-teal-500 shadow'
                            : 'bg-white text-slate-700 hover:bg-teal-50 hover:border-teal-400 border-slate-300'
                        }`}
                        aria-current={activeLotIndex === index}
                    >
                        {lot.nombre} - {lot.centroAsociado}
                    </button>
                    ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-lg font-bold text-teal-800 mb-4">{activeLot.nombre}: {activeLot.centroAsociado}</h4>
                  <div className="space-y-1">
                    <DataRow label="Descripción del Lote" value={activeLot.descripcion} />
                    <DataRow label="Presupuesto del Lote" value={formatAsEuros(activeLot.presupuesto)} />
                    <DataRow label="Requisitos Clave" value={activeLot.requisitosClave} />
                  </div>
                </div>
            </div>
            
            {/* Render all general sections for lot-based tenders as well */}
            <GeneralReportSections report={report} />
        </div>
    );
  }

  // --- Single Tender View (Default) ---
  return (
    <div className="space-y-6">
      <ReportSection title="Objeto de la Licitación">
        <DataRow label="Descripción" value={objetoLicitacion?.descripcion} />
        <DataRow label="Clasificación CPV" value={objetoLicitacion?.cpv} />
        <DataRow label="Entidad Contratante" value={objetoLicitacion?.entidad} />
      </ReportSection>

      <GeneralReportSections report={report} />
    </div>
  );
};

export default ReportDisplay;

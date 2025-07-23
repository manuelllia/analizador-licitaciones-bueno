
import React, { useState, useMemo, useEffect } from 'react';
import { AutomaticCriterion, SubjectiveCriterion, CriteriosAdjudicacion } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface ScoringAnalysisProps {
    scoringCriteria?: CriteriosAdjudicacion;
  contexto?: string;
  requisitos?: string;
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
    max?: number;
}> = ({ label, value, onChange, name, placeholder, unit = 'puntos', max }) => (
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
          min="0"
          max={max}
          className="w-full pl-4 pr-16 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        />
        {unit && <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm text-slate-500">{unit}</span>}
      </div>
    </div>
);

const ScoringAnalysis: React.FC<ScoringAnalysisProps> = ({ scoringCriteria }) => {
    const [economicScore, setEconomicScore] = useState('');
    const [automaticCriteria, setAutomaticCriteria] = useState<AutomaticCriterion[]>([]);
    const [subjectiveCriteria, setSubjectiveCriteria] = useState<SubjectiveCriterion[]>([]);

    useEffect(() => {
        if (scoringCriteria) {
            const newAuto = scoringCriteria.criteriosAutomaticos.map((c, index) => ({
                id: index + 1,
                label: c.descripcion,
                points: c.puntuacionMaxima,
                achieved: false,
                contexto: c.contexto,
                requisitos: c.requisitos
            }));
            const newSubj = scoringCriteria.criteriosSubjetivos.map((c, index) => ({
                id: index + 1,
                label: c.descripcion,
                maxPoints: c.puntuacionMaxima,
                scoredPoints: ''
            }));
            setAutomaticCriteria(newAuto);
            setSubjectiveCriteria(newSubj);
        }
    }, [scoringCriteria]);

    const handleAutomaticChange = (id: number) => {
        setAutomaticCriteria(prev => 
            prev.map(c => c.id === id ? { ...c, achieved: !c.achieved } : c)
        );
    };

    const handleSubjectiveChange = (id: number, value: string) => {
        const criterion = subjectiveCriteria.find(c => c.id === id);
        if (!criterion) return;

        const numValue = parseFloat(value);
        const scoredPoints = !isNaN(numValue) 
            ? Math.max(0, Math.min(criterion.maxPoints, numValue))
            : '';
        
        setSubjectiveCriteria(prev => 
            prev.map(c => c.id === id ? { ...c, scoredPoints: String(scoredPoints) } : c)
        );
    };

    const p = (v: string | undefined) => parseFloat(String(v)) || 0;

    const { autoScore, subjectiveScore, totalScore } = useMemo(() => {
        const autoScore = automaticCriteria.reduce((sum, c) => sum + (c.achieved ? c.points : 0), 0);
        const subjectiveScore = subjectiveCriteria.reduce((sum, c) => sum + p(c.scoredPoints), 0);
        const totalScore = p(economicScore) + autoScore + subjectiveScore;
        return { autoScore, subjectiveScore, totalScore };
    }, [economicScore, automaticCriteria, subjectiveCriteria]);

    return (
        <div className="space-y-8">
            <div className="text-center px-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Análisis de Puntuación</h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">Calcule la puntuación total de su oferta desglosando los criterios económicos, automáticos y subjetivos extraídos del documento.</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-teal-200/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-4">Resumen de Puntuación</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Económica</p>
                        <p className="text-xl sm:text-2xl font-bold text-teal-600">{p(economicScore).toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Automática</p>
                        <p className="text-xl sm:text-2xl font-bold text-teal-600">{autoScore.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Subjetiva</p>
                        <p className="text-xl sm:text-2xl font-bold text-teal-600">{subjectiveScore.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 lg:col-span-1 bg-teal-50 border-2 border-teal-500 rounded-lg py-2">
                        <p className="text-xs sm:text-sm font-bold text-teal-800 uppercase tracking-wider">Total</p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-teal-700">{totalScore.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                <div className="space-y-4 sm:space-y-6">
                    <InputGroup title="Puntuación Económica">
                        <NumberInput 
                            label="Puntos obtenidos por oferta económica"
                            name="economicScore"
                            value={economicScore}
                            onChange={(e) => setEconomicScore(e.target.value)}
                            placeholder="Introducir puntuación"
                        />
                         <p className="text-xs sm:text-sm text-slate-500 text-center pt-2">
                            Puede obtener este valor de la pestaña "Análisis de Costes".
                        </p>
                    </InputGroup>

                    <InputGroup title="Criterios Automáticos (Sí/No)">
                        <div className="space-y-3">
                            {automaticCriteria.length > 0 ? (
                                automaticCriteria.map(c => (
                                    <div key={c.id} className="bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
                                        <label htmlFor={`auto-${c.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 cursor-pointer gap-2 sm:gap-0">
                                            <div className="flex-1">
                                                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{c.label}</span>
                                                {automaticCriteria.find(ac => ac.id === c.id)?.contexto && (
                                                    <p className="text-xs text-slate-600 mt-1">{automaticCriteria.find(ac => ac.id === c.id)?.contexto}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end space-x-3">
                                                <span className={`font-bold text-xs sm:text-sm ${c.achieved ? 'text-teal-600' : 'text-slate-500'}`}>
                                                    {c.achieved ? `+${c.points}` : '0'} pts
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    id={`auto-${c.id}`}
                                                    checked={c.achieved}
                                                    onChange={() => handleAutomaticChange(c.id)}
                                                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                />
                                            </div>
                                        </label>
                                        {automaticCriteria.find(ac => ac.id === c.id)?.requisitos && (
                                            <div className="px-3 pb-3 border-t border-slate-200 pt-2 mt-2">
                                                <p className="text-xs text-slate-600">
                                                    <span className="font-semibold">Requisitos:</span> {automaticCriteria.find(ac => ac.id === c.id)?.requisitos}
                                                </p>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs sm:text-sm text-slate-500 text-center py-4">No se encontraron criterios automáticos en el documento.</p>
                            )}
                        </div>
                    </InputGroup>
                </div>

                <InputGroup title="Criterios por Juicio de Valor">
                    {subjectiveCriteria.length > 0 ? (
                        subjectiveCriteria.map(c => (
                            <NumberInput 
                                key={c.id}
                                label={`${c.label} (Máx: ${c.maxPoints} pts)`}
                                name={`subjective-${c.id}`}
                                value={c.scoredPoints}
                                onChange={(e) => handleSubjectiveChange(c.id, e.target.value)}
                                max={c.maxPoints}
                            />
                        ))
                    ) : (
                        <p className="text-xs sm:text-sm text-slate-500 text-center py-4">No se encontraron criterios por juicio de valor en el documento.</p>
                    )}
                </InputGroup>
            </div>
        </div>
    );
};

export default ScoringAnalysis;


import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ReportData, ChatMessage, CriteriosAdjudicacion, OfferInputData } from './types';
import { analyzeDocuments } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import CompetitionAnalysis from './components/CompetitionAnalysis';
import ScoringAnalysis from './components/ScoringAnalysis';
import Loader from './components/Loader';
import ChatButton from './components/ChatButton';
import Chatbot from './components/Chatbot';
import { logoPath } from './components/logo';
import { GoogleGenAI, Chat } from '@google/genai';
import DocumentIcon from './components/icons/DocumentIcon';
import CalculatorIcon from './components/icons/CalculatorIcon';
import ClipboardCheckIcon from './components/icons/ClipboardCheckIcon';

// Set workerSrc once when the module is loaded with the correct worker script.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

type ActiveTab = 'report' | 'competition' | 'scoring';

const App: React.FC = () => {
  const [pcapFile, setPcapFile] = useState<File | null>(null);
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [pcapText, setPcapText] = useState<string>('');
  const [pptText, setPptText] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('report');

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const chatInstance = useRef<Chat | null>(null);

  // Economic score sharing between tabs
  const [sharedEconomicScore, setSharedEconomicScore] = useState<number>(0);

  // Error popup state
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isChatOpen && !hasWelcomed && chatHistory.length === 0) {
      setChatHistory([{ role: 'model', text: 'Hola, soy tu asistente experto en licitaciones de electromedicina. Puedes hacerme preguntas generales o cargar los documentos de una licitación para un análisis detallado.' }]);
      setHasWelcomed(true);
    }
  }, [isChatOpen, hasWelcomed, chatHistory]);

  const extractText = useCallback(async (file: File): Promise<string> => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          return reject(new Error("Error al leer el archivo."));
        }
        try {
          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((s: any) => s.str).join(' ');
            fullText += pageText + '\n\n';
          }
          resolve(fullText);
        } catch (error) {
          console.error('Error procesando PDF:', error);
          reject(new Error('No se pudo procesar el archivo PDF.'));
        }
      };
      fileReader.onerror = () => {
        reject(new Error("Error al leer el archivo."));
      };
      fileReader.readAsArrayBuffer(file);
    });
  }, []);

  const handlePcapSelect = (file: File) => {
    setError(null);
    setPcapFile(file);
  };
  
  const handlePptSelect = (file: File) => {
    setError(null);
    setPptFile(file);
  };

  const handleAnalyze = useCallback(async () => {
    if (!pcapText || !pptText) {
      setError('Ambos documentos (PCAP y PPT) son necesarios para el análisis.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setReport(null);
    // Reset chat on new analysis
    setChatHistory([]);
    chatInstance.current = null;

    try {
      const result = await analyzeDocuments(pcapText, pptText);
      setReport(result);
      setActiveTab('report');
      // Pre-populate chat with a welcome message
      setChatHistory([{ role: 'model', text: '¡Análisis completo! Ahora puedes hacerme preguntas específicas sobre los documentos que has cargado o usar la pestaña de "Análisis de Competencia".' }]);
      setHasWelcomed(true);
    } catch (err: any) {
      const errorMsg = err.message || 'Ocurrió un error inesperado durante el análisis.';
      
      // Check for rate limit or quota exceeded errors
      if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('RATE_LIMIT_EXCEEDED')) {
        setErrorMessage('Has alcanzado el límite de uso de la API. Por favor, inténtalo de nuevo en unos minutos.');
        setShowErrorPopup(true);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pcapText, pptText]);

  useEffect(() => {
    if (pcapFile) {
      extractText(pcapFile).then(setPcapText).catch(e => setError('Error al procesar el PCAP. Verifique el archivo y la consola.'));
    } else {
      setPcapText('');
    }
  }, [pcapFile, extractText]);

  useEffect(() => {
    if (pptFile) {
      extractText(pptFile).then(setPptText).catch(e => setError('Error al procesar el PPT. Verifique el archivo y la consola.'));
    } else {
      setPptText('');
    }
  }, [pptFile, extractText]);

  const handleReset = () => {
    setPcapFile(null);
    setPptFile(null);
    setPcapText('');
    setPptText('');
    setReport(null);
    setError(null);
    setIsLoading(false);
    setActiveTab('report');
    // Reset chat
    setChatHistory([]);
    chatInstance.current = null;
    setIsChatOpen(false);
    setHasWelcomed(false);
  };
  
  const handleSendMessage = async (message: string) => {
    setChatHistory(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);

    try {
      if (!chatInstance.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const baseInstruction = `Eres un asistente de IA para la aplicación "Analizador de Licitaciones de Electromedicina". Tu propósito es ayudar a los usuarios a entender la aplicación y analizar documentos de licitaciones.
Si un usuario pregunta sobre el funcionamiento de la aplicación, explica el proceso: 
1. El usuario debe cargar dos documentos PDF: el Pliego Administrativo (PCAP) y el Pliego Técnico (PPT).
2. Al hacer clic en "Analizar Documentos", la IA procesa los textos para generar un informe estructurado.
3. Una vez generado el informe, el usuario puede consultarlo en la pestaña 'Informe de Licitación', realizar un 'Análisis de Costes' o un 'Análisis de Puntuación'.`;
        
        const systemInstruction = (pcapText && pptText)
          ? `${baseInstruction}
          
Actualmente, ya se han cargado los documentos de una licitación. Eres un experto en esta licitación específica. Tu única fuente de información son los textos del PCAP y PPT proporcionados a continuación. Responde a las preguntas del usuario de forma concisa basándote exclusivamente en ellos. Si la respuesta no está en los documentos, indícalo claramente.
          --- INICIO PCAP ---
          ${pcapText}
          --- FIN PCAP ---
          --- INICIO PPT ---
          ${pptText}
          --- FIN PPT ---`
          : `${baseInstruction}
          
Además de conocer la aplicación, también eres un experto en licitaciones públicas de electromedicina en España. Responde a las preguntas del usuario sobre este tema de forma general, ya que aún no se han proporcionado documentos específicos.`;
          
        chatInstance.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            }
        });
      }
      
      const response = await chatInstance.current.sendMessage({ message });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text }]);

    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('RATE_LIMIT_EXCEEDED')) {
        setErrorMessage('Has alcanzado el límite de uso de la API. Por favor, inténtalo de nuevo en unos minutos.');
        setShowErrorPopup(true);
      } else {
        setChatHistory(prev => [...prev, { role: 'model', text: 'Lo siento, he encontrado un error al procesar tu solicitud. Por favor, inténtalo de nuevo.' }]);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  const canAnalyze = pcapText && pptText;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm shadow-md w-full sticky top-0 z-20 border-b">
            <nav className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <img src={logoPath} alt="Logo Analizador de Licitaciones" className="h-8 sm:h-10 md:h-12 w-auto" />
                </div>
                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-teal-800 text-right leading-tight">
                    <span className="hidden sm:inline">Analizador de Licitaciones</span>
                    <span className="sm:hidden">Analizador</span>
                </h1>
            </nav>
        </header>

        <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 flex-grow w-full">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-md shadow max-w-4xl mx-auto" role="alert">
                    <p className="font-bold">Error</p>
                    <p className="text-sm sm:text-base">{error}</p>
                </div>
            )}

            {!report && !isLoading && (
                <div className="max-w-4xl mx-auto">
                    <FileUpload 
                        pcapFile={pcapFile}
                        pptFile={pptFile}
                        onPcapSelect={handlePcapSelect}
                        onPptSelect={handlePptSelect}
                        disabled={isLoading}
                    />
                    <div className="mt-6 sm:mt-8 text-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={!canAnalyze || isLoading}
                            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 md:px-10 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? 'Analizando...' : 'Analizar Documentos'}
                        </button>
                    </div>
                </div>
            )}
            
            {isLoading && <Loader message="Generando informe con IA..." />}

            {report && !isLoading && (
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-1 sm:p-2 sticky top-[65px] sm:top-[75px] md:top-[85px] z-10 border">
                        <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 md:space-x-2 justify-center" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('report')}
                                className={`${
                                    activeTab === 'report'
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-slate-200/60 hover:text-gray-800'
                                } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-3 md:px-5 rounded-lg font-medium text-xs sm:text-sm md:text-base inline-flex items-center justify-center transition-all duration-200 w-full sm:w-auto`}
                                aria-current={activeTab === 'report' ? 'page' : undefined}
                            >
                                <DocumentIcon className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5"/>
                                Informe
                            </button>
                            <button
                                onClick={() => setActiveTab('competition')}
                                className={`${
                                    activeTab === 'competition'
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-slate-200/60 hover:text-gray-800'
                                } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-3 md:px-5 rounded-lg font-medium text-xs sm:text-sm md:text-base inline-flex items-center justify-center transition-all duration-200 w-full sm:w-auto`}
                                aria-current={activeTab === 'competition' ? 'page' : undefined}
                            >
                                <CalculatorIcon className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5"/>
                                <span className="hidden sm:inline">Análisis de Costes</span>
                                <span className="sm:hidden">Costes</span>
                            </button>
                             <button
                                onClick={() => setActiveTab('scoring')}
                                className={`${
                                    activeTab === 'scoring'
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-slate-200/60 hover:text-gray-800'
                                } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-3 md:px-5 rounded-lg font-medium text-xs sm:text-sm md:text-base inline-flex items-center justify-center transition-all duration-200 w-full sm:w-auto`}
                                aria-current={activeTab === 'scoring' ? 'page' : undefined}
                            >
                                <ClipboardCheckIcon className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5"/>
                                <span className="hidden sm:inline">Análisis de Puntuación</span>
                                <span className="sm:hidden">Puntuación</span>
                            </button>
                        </nav>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 gap-3 sm:gap-4">
                        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex-1 w-full sm:w-auto">
                          <span className="font-semibold">Licitación en análisis:</span> {report.objetoLicitacion.descripcion}
                        </div>
                        <button 
                            onClick={handleReset}
                            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 sm:px-6 text-sm sm:text-base rounded-full transition-colors duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                        >
                            <span className="hidden sm:inline">Analizar otra licitación</span>
                            <span className="sm:hidden">Nueva licitación</span>
                        </button>
                    </div>
                    
                    <div className="mt-4 sm:mt-6">
                        {activeTab === 'report' && <ReportDisplay report={report} />}
                        {activeTab === 'competition' && <CompetitionAnalysis tenderBudgetFromReport={report.analisisEconomico.presupuestoBaseLicitacion} scoringCriteria={report.criteriosAdjudicacion} recommendedCosts={report.analisisEconomico.costesDetalladosRecomendados} onEconomicScoreChange={setSharedEconomicScore} />}
                        {activeTab === 'scoring' && <ScoringAnalysis scoringCriteria={report.criteriosAdjudicacion} initialEconomicScore={sharedEconomicScore} />}
                    </div>
                </div>
            )}
        </main>
        
        {/* Error Popup */}
        {showErrorPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                    <div className="p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Límite de API Alcanzado</h3>
                        <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
                        <button
                            onClick={() => setShowErrorPopup(false)}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <Chatbot 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
        />
        <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50">
            <ChatButton onClick={() => setIsChatOpen(prev => !prev)} />
        </div>
        
        <footer className="bg-slate-200 text-center py-3 sm:py-4 mt-auto">
            <p className="text-xs sm:text-sm text-slate-600 px-2">
                <span className="hidden sm:inline">Analizador de Licitaciones - Impulsado por IA de Google</span>
                <span className="sm:hidden">Impulsado por IA de Google</span>
            </p>
        </footer>
    </div>
  );
};

export default App;
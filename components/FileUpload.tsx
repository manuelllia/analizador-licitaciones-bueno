
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import DocumentIcon from './icons/DocumentIcon';
import CheckIcon from './icons/CheckIcon';

interface FileUploadProps {
  pcapFile: File | null;
  pptFile: File | null;
  onPcapSelect: (file: File) => void;
  onPptSelect: (file: File) => void;
  disabled: boolean;
}

const FileInput: React.FC<{
  file: File | null;
  onFileSelect: (file: File) => void;
  title: string;
  id: string;
  disabled: boolean;
}> = ({ file, onFileSelect, title, id, disabled }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full bg-slate-50 border-2 rounded-xl p-8 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
        isDragActive ? 'border-teal-500 ring-2 ring-teal-300' : 'border-dashed border-slate-300 hover:border-teal-400'
      } ${disabled ? 'cursor-not-allowed bg-slate-200 opacity-60' : 'cursor-pointer'}`}
    >
      <input {...getInputProps()} id={id} />
      <div className="flex flex-col items-center justify-center space-y-3 text-slate-600">
        {file ? (
          <>
            <CheckIcon className="w-12 h-12 text-teal-500" />
            <p className="font-semibold text-slate-800 break-all">{file.name}</p>
            <p className="text-xs">¡Archivo cargado con éxito!</p>
          </>
        ) : (
          <>
            <DocumentIcon className="w-12 h-12 text-slate-400" />
            <p className="font-bold text-lg text-slate-700">{title}</p>
            <p className="text-sm">Arrastra y suelta o haz clic para seleccionar</p>
            <p className="text-xs text-slate-500 mt-1">(Solo archivos .pdf)</p>
          </>
        )}
      </div>
    </div>
  );
};

const FileUpload: React.FC<FileUploadProps> = ({ pcapFile, pptFile, onPcapSelect, onPptSelect, disabled }) => {
  return (
    <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Cargar Documentos de Licitación</h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">Proporcione los documentos PCAP y PPT en formato PDF. Nuestro motor de IA analizará el contenido para generar un informe detallado.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <FileInput file={pcapFile} onFileSelect={onPcapSelect} title="Pliego Administrativo (PCAP)" id="pcap-upload" disabled={disabled}/>
            <FileInput file={pptFile} onFileSelect={onPptSelect} title="Pliego Técnico (PPT)" id="ppt-upload" disabled={disabled}/>
        </div>
    </div>
  );
};

export default FileUpload;

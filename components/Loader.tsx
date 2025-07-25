
import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 md:p-12">
      <svg
        className="animate-spin h-12 sm:h-14 md:h-16 w-12 sm:w-14 md:w-16 text-teal-600 mb-4 sm:mb-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="text-lg sm:text-xl font-semibold text-slate-800 px-2">{message}</p>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 px-2">Esto puede tardar unos segundos mientras la IA procesa los documentos...</p>
    </div>
  );
};

export default Loader;

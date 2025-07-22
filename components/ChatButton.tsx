
import React from 'react';
import ChatIcon from './icons/ChatIcon';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all duration-300 ease-in-out transform hover:scale-110"
      aria-label="Abrir chat de asistente"
    >
      <ChatIcon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8" />
    </button>
  );
};

export default ChatButton;
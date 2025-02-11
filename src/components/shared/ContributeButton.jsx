// src/components/shared/ContributeButton.jsx
import React from 'react';
import logoImg from '../../../public/logo.png'

const ContributeButton = ({ setIsContributionModalOpen, active }) => (
    <div className="relative -mt-6">
      <button 
        onClick={setIsContributionModalOpen}
        className={`menu-item menu-center ${active ? 'active' : ''}`}
      >
      {/* Logo Circle Container */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 logo-circle">
        {/* Efeito de rotação de fundo */}
        <div className="absolute inset-0 before:content-[''] before:absolute before:inset-0 before:w-[150%] before:h-[150%] before:bg-conic-gradient before:animate-spin-slow before:origin-center" />
        
        {/* Container principal com gradiente */}
        <div className="relative w-full h-full bg-gradient-to-r from-[#55d1ff20] to-[#084bee20] rounded-full flex items-center justify-center overflow-hidden">
          {/* Logo com efeitos */}
          <div className="relative w-14 h-14 flex items-center justify-center animate-pulse-slow">
            <img 
              src={logoImg} 
              alt="DOL" 
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(85,209,255,0.5)]"
            />
          </div>
        </div>

        {/* Efeito de brilho rotativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#55d1ff30] to-[#084bee30] rounded-full animate-spin-slow opacity-50" />
      </div>

      {/* Label */}
      <span className="text-xs mt-2 text-[#55d1ff]">Contribuir</span>
    </button>
  </div>
);

export default ContributeButton;
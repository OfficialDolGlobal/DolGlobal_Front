// src/components/shared/NavigationMenu.jsx
import React from 'react';
import { Home, Users, Gem, User } from 'lucide-react';
import ContributeButton from './ContributeButton';

const MenuIcon = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
      active 
        ? 'text-[#00ffff] scale-110' 
        : 'text-white/60 hover:text-white/80'
    }`}
  >
    <div className={`p-3 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-[#00ffff20]' 
        : 'hover:bg-[#ffffff10]'
    }`}>
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const NavigationMenu = ({ activePage, setActivePage, setIsContributionModalOpen }) => {
  // Função que gerencia o clique no botão Contribute
  const handleContributeClick = () => {
    setActivePage('contribute'); // Primeiro muda para a página
    setIsContributionModalOpen(true); // Depois abre o modal
  };

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#001242]/80 backdrop-blur-xl rounded-full p-2 border border-[#00ffff20] shadow-lg shadow-[#0057ff40]">
      <div className="flex items-center space-x-8 px-4">
        <MenuIcon 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
          active={activePage === 'home'} 
          onClick={() => setActivePage('home')} 
        />
        <MenuIcon 
          icon={<Users className="w-6 h-6" />} 
          label="Rede" 
          active={activePage === 'network'} 
          onClick={() => setActivePage('network')} 
        />
        {/* Modificado para usar handleContributeClick */}
        <ContributeButton 
          setIsContributionModalOpen={handleContributeClick} 
          active={activePage === 'contribute'}
        />
        <MenuIcon 
          icon={<Gem className="w-6 h-6" />} 
          label="NFTs" 
          active={activePage === 'nfts'} 
          onClick={() => setActivePage('nfts')} 
        />
        <MenuIcon 
          icon={<User className="w-6 h-6" />} 
          label="Perfil" 
          active={activePage === 'profile'} 
          onClick={() => setActivePage('profile')} 
        />
      </div>
    </nav>
  );
};

export default NavigationMenu;
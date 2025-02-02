import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export const NetworkTree = () => {
  const [levels, setLevels] = useState([]);
  const MAX_LEVELS = 3;
  const INVESTMENT_AMOUNT = 10;
  
  const getPercentage = (level) => {
    if (level === 1) return 10;
    if (level === 2) return 5;
    if (level === 3) return 2;
    return 0;
  };

  const calculateNodesForLevel = (level) => {
    if (level === 1) return 2;
    const previousLevelNodes = calculateNodesForLevel(level - 1);
    return previousLevelNodes * 2;
  };

  const calculateEarnings = (level, nodes) => {
    const percentage = getPercentage(level);
    return (INVESTMENT_AMOUNT * (percentage / 100) * nodes).toFixed(2);
  };

  useEffect(() => {
    if (levels.length < MAX_LEVELS) {
      const timer = setTimeout(() => {
        const newLevel = levels.length + 1;
        const nodes = calculateNodesForLevel(newLevel);
        setLevels(prev => [...prev, {
          level: newLevel,
          nodes: nodes,
          percentage: getPercentage(newLevel),
          earnings: calculateEarnings(newLevel, nodes)
        }]);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Reset após mostrar todos os níveis
      const timer = setTimeout(() => {
        setLevels([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [levels]);

  const renderUsers = (count, animate = true) => {
    return (
      <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
        {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <User 
              className={`w-6 h-6 text-cyan-400 ${animate ? 'animate-scaleIn' : ''}`}
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          </div>
        ))}
        {count > 8 && (
          <span className="text-sm text-cyan-400/60">+{count - 8}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Níveis */}
      {levels.map((level, index) => (
        <div 
          key={level.level}
          className="glass-effect rounded-xl gradient-border p-4 animate-fadeIn"
          style={{
            animationDelay: `${index * 0.3}s`
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
              <div className="flex justify-between md:w-auto">
                <div className="w-24">
                  <span className="text-white font-bold">Nível {level.level}</span>
                </div>
                <div className="w-20 md:text-center">
                  <span className="text-cyan-400 font-medium">{level.percentage}%</span>
                </div>
              </div>
              <div className="flex-grow">
                {renderUsers(level.nodes)}
              </div>
            </div>
            <div className="flex justify-between md:justify-end items-center gap-4 w-full md:w-auto">
              <div className="text-cyan-400/60 text-sm">{level.nodes} usuários</div>
              <span className="text-cyan-400 font-medium whitespace-nowrap">
                +{level.earnings} USDT
              </span>
            </div>
          </div>
        </div>
      ))}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
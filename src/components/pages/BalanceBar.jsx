import React from 'react';

const BalanceBar = ({ receivedAmount, pendingAmount,available }) => {
  const total = available;
  const receivedPercentage = (receivedAmount) * 100;
  const pendingPercentage = (pendingAmount) * 100;

  return (
    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg ring-1 ring-white/10">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">Saldo Total</span>
        <span className="text-sm text-cyan-400">{total.toFixed(2)} USDT</span>
      </div>
      
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
          style={{ width: `${receivedPercentage}%` }}
        />
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${pendingPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400" />
          <span className="text-sm text-gray-400">
            Resgatado: <span className="text-white">{receivedAmount.toFixed(2)} USDT</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          <span className="text-sm text-gray-400">
            Limite ativo: <span className="text-white">{pendingAmount.toFixed(2)} USDT</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceBar;
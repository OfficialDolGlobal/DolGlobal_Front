// src/components/shared/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon }) => (
  <div className="relative bg-[#001242]/80 backdrop-blur-xl rounded-xl p-6 border border-[#00ffff20]">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-30 rounded-xl" />
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-white/80">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl font-bold text-[#00ffff]">{value}</p>
  </div>
);

export default StatCard;  // Adicionando o export default
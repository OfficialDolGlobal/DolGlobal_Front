import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info } from 'lucide-react';

const DistributionSection = ({ t }) => {
    const [activeIndex, setActiveIndex] = useState(null);
  
    // Nova paleta de cores mais sofisticada
    const data = [
      { 
        name: t.distribution.pools.nft.title, 
        value: 20, 
        color: '#0891B2', // Cyan-600
        key: 'nft' 
      },
      { 
        name: t.distribution.pools.burn.title, 
        value: 10, 
        color: '#0C4A6E', // Sky-900
        key: 'burn' 
      },
      { 
        name: t.distribution.pools.recharge.title, 
        value: 20, 
        color: '#1E40AF', // Blue-800
        key: 'recharge' 
      },
      { 
        name: t.distribution.pools.network.title, 
        value: 38, 
        color: '#0369A1', // Sky-700
        key: 'network' 
      },
      { 
        name: t.distribution.pools.liquidity.title, 
        value: 12, 
        color: '#075985', // Sky-800
        key: 'liquidity' 
      }
    ];
  
    return (
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4"
            >
              {t.distribution.title}
            </motion.h2>
            <p className="text-xl text-gray-300">{t.distribution.subtitle}</p>
          </div>
  
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Gráfico com novo estilo */}
            <div className="relative h-[400px] bg-gradient-to-b from-white/5 to-transparent p-8 rounded-3xl border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={140}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    strokeWidth={1}
                    stroke="#000c2a"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                        style={{
                          filter: index === activeIndex ? 'brightness(1.2) saturate(1.2)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
  
              {/* Valor central com novo estilo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-[#000c2a]/80 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-cyan-400">{t.distribution.inUsdt}</div>
              </div>
            </div>
  
            {/* Legenda com novo estilo */}
            <div className="space-y-3">
              {data.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    index === activeIndex
                      ? 'bg-gradient-to-r from-white/10 to-white/5 border-cyan-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-200">{item.name}</span>
                        <span className="text-cyan-400 font-semibold">{item.value}%</span>
                      </div>
                      {index === activeIndex && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-gray-400 mt-2 leading-relaxed"
                        >
                          {t.distribution.pools[item.key].description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

export default DistributionSection;
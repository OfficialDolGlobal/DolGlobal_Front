import React from 'react';
import { Users, TrendingUp, CircleDollarSign } from 'lucide-react';
import PropTypes from 'prop-types';

const UnilevelSection = ({ t, id }) => {
  // Movendo os níveis de comissão para as traduções
  const commissionLevels = t.unilevel.commissionLevels;

  const infoCards = [
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: t.unilevel.infoCards.invite.title,
      description: t.unilevel.infoCards.invite.description
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: t.unilevel.infoCards.levels.title,
      description: t.unilevel.infoCards.levels.description
    },
    {
      icon: <CircleDollarSign className="w-6 h-6 text-cyan-400" />,
      title: t.unilevel.infoCards.distribution.title,
      description: t.unilevel.infoCards.distribution.description
    }
  ];

  return (
    <section id={id} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Título e Subtítulo */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            {t.unilevel.title}
          </h2>
          <p className="text-xl text-gray-300">
            {t.unilevel.subtitle}
          </p>
        </div>

        {/* Cards Informativos */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {infoCards.map((card, index) => (
            <div key={index} className="p-6 glass-effect rounded-2xl gradient-border hover:border-cyan-400/50 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {card.title}
              </h3>
              <p className="text-gray-400">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tabela de Comissões */}
        <div className="glass-effect rounded-2xl gradient-border p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
            {t.unilevel.commissionTable.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {commissionLevels.map((item, index) => (
              <div
                key={index}
                className={`p-4 md:p-6 rounded-xl ${
                  item.highlight
                    ? 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20'
                    : 'bg-white/5'
                } backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 transition-colors`}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">{t.unilevel.commissionTable.levelLabel}</div>
                  <div className="text-lg font-bold text-white mb-3">
                    {item.level}
                  </div>
                  <div className={`text-xl font-bold ${
                    item.highlight ? 'text-cyan-400' : 'text-gray-300'
                  }`}>
                    {item.percentage}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <span className="text-lg text-gray-300">
              {t.unilevel.commissionTable.totalDistribution}{' '}
              <span className="text-cyan-400 font-bold">38%</span>{' '}
              {t.unilevel.commissionTable.ofContribution}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

UnilevelSection.propTypes = {
  t: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired
};

export default UnilevelSection;
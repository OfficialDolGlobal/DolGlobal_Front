import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const NFTSection = ({ t, id }) => {
  // Movendo a configuração dos NFTs para as traduções
  const nfts = t.nfts.items.map(nft => ({
    ...nft,
    color: {
      Esmeralda: "#00ff88",
      Safira: "#0088ff",
      Ametista: "#aa44ff"
    }[nft.name]
  }));

  return (
    <section id={id} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4"
          >
            {t.nfts.title}
          </motion.h2>
          <p className="text-xl text-gray-300">
            {t.nfts.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {nfts.map((nft, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Efeito de Glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${nft.color}40 0%, transparent 70%)`,
                  transform: "translateY(10px) scale(0.95)",
                  filter: "blur(20px)",
                  zIndex: 0,
                }}
              />

              {/* Card Principal */}
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {/* Efeito de Borda Brilhante */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom right, ${nft.color}20, transparent)`,
                    borderRadius: "16px",
                  }}
                />

                {/* Conteúdo do Card */}
                <div className="p-6 relative z-10">
                  {/* Imagem do NFT */}
                  <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden">
                    <img
                      src={`/nfts/${nft.extensao}.png`}
                      alt={t.nfts.imageAlt.replace('{{name}}', nft.name)}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay com gradiente */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(to top, ${nft.color}40, transparent)`,
                      }}
                    />
                  </div>

                  {/* Informações do NFT */}
                  <h3 className="text-xl font-bold text-center mb-4 text-white">
                    {nft.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="text-center text-gray-400">{t.nfts.applicationLabel}</div>
                    <div
                      className="text-center font-bold text-lg"
                      style={{ color: nft.color }}
                    >
                      {nft.price}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-center text-gray-400">{t.nfts.returnLabel}</div>
                    <div
                      className="text-center font-bold"
                      style={{ color: nft.color }}
                    >
                      {nft.return}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-400">
              {t.nfts.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

NFTSection.propTypes = {
  t: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

export default NFTSection;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UnilevelSection from "./UnilevelSection";
import NFTSection from "./NFTSection";
import BackgroundAnimation from "./BackgroundAnimation";

import {
  Shield,
  Globe,
  Code,
  TrendingUp,
  Droplets,
  ChevronDown,
  Clock,
  Zap,
  DollarSign,
  Lock,
  BarChart3,
  Users,
  Check,
  ArrowDownCircle,
  Gift,
  Info, // Adicionado para o DistributionSection
} from "lucide-react";
import { useLanguage } from "../LanguageManager";



const LandingPage = ({ onConnect }) => {
  const { t, LanguageSelector } = useLanguage();

  useEffect(() => {
    // Carrega os scripts do Wistia
    const script1 = document.createElement("script");
    script1.src = "https://fast.wistia.com/embed/medias/gck2zb1g8x.jsonp";
    script1.async = true;

    const script2 = document.createElement("script");
    script2.src = "https://fast.wistia.com/assets/external/E-v1.js";
    script2.async = true;

    document.body.appendChild(script1);
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);



  const features = [
    {
      icon: <Lock className="w-12 h-12 text-cyan-400" />,
      title: t.features.verified.title,
      description: t.features.verified.description,
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-cyan-400" />,
      title: t.features.returns.title,
      description: t.features.returns.description,
    },
    {
      icon: <Users className="w-12 h-12 text-cyan-400" />,
      title: t.features.governance.title,
      description: t.features.governance.description,
    },
  ];

  const pools = [
    {
      title: t.pools.treasury.title,
      image: "/tesouro.png",
      icon: <Lock className="w-6 h-6 text-cyan-400" />,
      description: t.pools.treasury.description,
      features: t.pools.treasury.features,
    },
    {
      title: t.pools.recharge.title,
      image: "/recarga.png",
      icon: <ArrowDownCircle className="w-6 h-6 text-cyan-400" />,
      description: t.pools.recharge.description,
      features: t.pools.recharge.features,
    },
    {
      title: t.pools.liquidity.title,
      image: "/liquidez.png",
      icon: <Droplets className="w-6 h-6 text-cyan-400" />,
      description: t.pools.liquidity.description,
      features: t.pools.liquidity.features,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000c2a] to-[#001952] text-white">
      <BackgroundAnimation />

      {/* Header com navegação */}
      <header className="fixed top-0 w-full z-50 bg-opacity-90 backdrop-blur-sm bg-[#000c2a]">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-col sm:flex-row">
          <div className="flex items-center space-x-8">
            <div className="logo-circle w-12 h-12 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full"></div>
              <img
                src="/logo.png"
                alt="DOL GLOBAL"
                className="w-10 h-10 object-contain relative z-10"
              />
            </div>
          </div>

          {/* Seletor de idiomas e botão de conectar */}
          <div className="flex items-center  flex-col sm:flex-row justify-center gap-4 py-4">
            <LanguageSelector />
            <button
              onClick={onConnect}
              className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              {t.nav.connect}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-56 sm:pt-32 pb-20  px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
                <br />
                {t.hero.subtitle}
              </h1>
              <p className="text-xl text-gray-300">{t.hero.description}</p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConnect}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-semibold text-lg"
                >
                  {t.hero.cta}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4"
            >
              {t.about.title}
            </motion.h2>
            <p className="text-xl text-gray-300">{t.about.subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* O Projeto */}
              <div className="glass-effect rounded-2xl gradient-border p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">
                  {t.about.project.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t.about.project.description}
                </p>
              </div>

              {/* Diferenciais */}
              <div className="glass-effect rounded-2xl gradient-border p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">
                  {t.about.differentials.title}
                </h3>
                <ul className="space-y-3">
                  {t.about.differentials.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Objetivos */}
              <div className="glass-effect rounded-2xl gradient-border p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">
                  {t.about.objectives.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t.about.objectives.description}
                </p>
              </div>
            </motion.div>

            {/* Right Side - GIF */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="sticky top-24"
            >
              <div className="rounded-2xl border border-white/10 p-8 bg-transparent">
                <img
                  src="/logo.gif"
                  alt="DOL Global Gif"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#000c2a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              {t.features.why}
            </h2>
            <p className="text-xl text-gray-300">{t.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-6 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantias Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {t.security.title}
              </h2>
              <div className="space-y-4">
                {t.security.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/10"
            >
              <div className="space-y-6">
                <Shield className="w-16 h-16 text-cyan-400 mx-auto" />
                <h3 className="text-2xl font-semibold text-center">
                  {t.security.protection.title}
                </h3>
                <div className="pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        100%
                      </div>
                      <div className="text-sm text-gray-400">
                        {t.security.protection.stats.automated}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        24/7
                      </div>
                      <div className="text-sm text-gray-400">
                        {t.security.protection.stats.monitoring}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POols */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4"
            >
              {t.pools.section.title}
            </motion.h2>
            <p className="text-xl text-gray-300">{t.pools.section.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pools.map((pool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                {/* Card Principal */}
                <div className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-cyan-400/30">
                  {/* Imagem com Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000c2a] via-transparent to-transparent z-10" />
                    <img
                      src={pool.image}
                      alt="pools" // Adicionando tradução para o alt
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Ícone flutuante */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-20">
                      {pool.icon}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {pool.title}
                    </h3>
                    <p className="text-gray-300 text-sm">{pool.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Disclaimer */}
      <footer className="py-16 px-4 bg-[#000c2a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="/logo.png"
                  alt="DOL Global Logo"
                  className="w-10 h-10 object-contain relative z-10"
                />
                <span className="text-2xl font-bold text-white">
                  DOL Global
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(t.footer.links).map(([key, value]) => (
                  <a
                    key={key}
                    href={`#${key}`}
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {value}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">
                {t.footer.disclaimer}
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t.footer.disclaimerText}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} DOL Global. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

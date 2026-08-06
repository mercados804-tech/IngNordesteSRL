import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = ({ content }) => {
  const stats = [
    { label: "Años de experiencia", value: "15+" },
    { label: "Proyectos realizados", value: "500+" },
    { label: "Clientes satisfechos", value: "100%" },
  ];

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 z-0 opacity-100"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${content.image || "https://images.unsplash.com/photo-1541913080213-48119e70621c?auto=format&fit=crop&q=80"}')` 
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-7xl font-bold text-white mb-8 max-w-5xl mx-auto leading-tight"
        >
          {content.title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          {content.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
        >
          <a 
            href="#contacto" 
            className="w-full sm:w-auto px-10 py-4 bg-corporate-gold text-white rounded-lg font-bold shadow-2xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            Consultar Ahora
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="#galeria"
            className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-corporate-red transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Ver Proyectos
          </a>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto pt-12 border-t border-white/20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-white"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 text-corporate-gold">{stat.value}</div>
              <div className="text-sm md:text-base font-medium text-gray-300 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

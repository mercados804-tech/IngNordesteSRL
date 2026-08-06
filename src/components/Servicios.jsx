import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const Servicios = ({ content }) => {
  return (
    <section id="servicios" className="py-24 bg-corporate-gray overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-corporate-red mb-6">Nuestros Servicios</h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
            Soluciones integrales adaptadas a tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {content.map((servicio, index) => (
            <motion.div
              key={servicio.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]"
            >
              {/* Image Background */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-100"
                style={{ backgroundImage: `url('${servicio.image}')` }}
              ></div>
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-75 transition-opacity"></div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <h3 className="text-3xl font-bold mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {servicio.title}
                </h3>
                
                <p className="text-gray-300 mb-6 line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                  {servicio.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-white/20">
                  {servicio.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-200">
                      <CheckCircle2 size={16} className="text-corporate-red shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-bold uppercase tracking-widest text-corporate-gold">¿Tienes un proyecto en mente?</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios;

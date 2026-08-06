import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const Proyectos = ({ content }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  const openGallery = (proyecto) => {
    setSelectedProject(proyecto);
    setCurrentMediaIndex(0);
  };

  const closeGallery = () => {
    setSelectedProject(null);
  };

  const nextMedia = () => {
    if (selectedProject?.gallery) {
      setCurrentMediaIndex((prev) => (prev + 1) % selectedProject.gallery.length);
    }
  };

  const prevMedia = () => {
    if (selectedProject?.gallery) {
      setCurrentMediaIndex((prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length);
    }
  };

  return (
    <section id="galeria" className="py-24 bg-corporate-gray">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Proyectos Destacados</h2>
          <div className="w-24 h-1.5 bg-corporate-red mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Explora nuestra trayectoria a través de obras que transforman el entorno. Haz clic en cualquier proyecto para ver más fotos y videos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {content.map((proyecto, index) => (
            <motion.div
              key={proyecto.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => openGallery(proyecto)}
              className="bg-white rounded-[2rem] overflow-hidden shadow-xl group hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100"
            >
              {/* Image Preview */}
              <div className="relative h-72 bg-gray-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10"></div>
                
                {/* Image or Placeholder */}
                {proyecto.image ? (
                  <img 
                    src={proyecto.image} 
                    alt={proyecto.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-corporate-red/20 font-bold text-4xl uppercase tracking-widest bg-corporate-red/5 transform group-hover:scale-110 transition-transform duration-700">
                    {proyecto.title.substring(0, 2)}
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-6 left-6 z-20">
                  <span className="px-4 py-2 bg-corporate-red text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-widest">
                    {proyecto.category || 'Obra'}
                  </span>
                </div>

                {/* Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <ImageIcon className="text-white" size={32} />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-2">{proyecto.title}</h3>
                  <div className="flex items-center gap-2 text-corporate-gold font-bold text-sm">
                    <span>Ver Galería Completa</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 leading-relaxed line-clamp-2">
                  {proyecto.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeGallery}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl max-h-full bg-transparent flex flex-col items-center z-[110] overflow-y-auto no-scrollbar"
            >
              <div className="w-full flex flex-col items-center py-12">
                {/* Close Button */}
                <button
                  onClick={closeGallery}
                  className="fixed top-6 right-6 p-4 text-white hover:text-corporate-red transition-all duration-300 z-[150] bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md border border-white/20 shadow-2xl"
                  aria-label="Cerrar galería"
                >
                  <X size={28} />
                </button>

                {/* Main Media Display */}
                <div className="relative w-full aspect-video bg-black/40 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    {selectedProject.gallery && selectedProject.gallery[currentMediaIndex]?.type === 'video' ? (
                      <video
                        src={selectedProject.gallery[currentMediaIndex].url}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                      />
                    ) : (
                      <img
                        src={selectedProject.gallery ? selectedProject.gallery[currentMediaIndex].url : selectedProject.image}
                        alt={`${selectedProject.title} media`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {selectedProject.gallery && selectedProject.gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-corporate-red text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-30"
                    >
                      <ChevronLeft size={32} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-corporate-red text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-30"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </>
                )}

                {/* Media Counter */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-bold z-30">
                  {currentMediaIndex + 1} / {selectedProject.gallery ? selectedProject.gallery.length : 1}
                </div>
              </div>

              {/* Project Info Under Media */}
              <div className="mt-8 text-center text-white max-w-3xl">
                <h3 className="text-3xl font-bold mb-4">{selectedProject.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Thumbnails */}
              {selectedProject.gallery && selectedProject.gallery.length > 1 && (
                <div className="mt-10 flex gap-4 overflow-x-auto pb-4 max-w-full px-4 no-scrollbar">
                  {selectedProject.gallery.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${currentMediaIndex === idx ? 'border-corporate-red scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Play size={16} className="text-white" />
                        </div>
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" alt="thumbnail" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </section>
  );
};

export default Proyectos;

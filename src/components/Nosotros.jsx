import { motion } from 'framer-motion';
import { Target, Eye, Award, CheckCircle2 } from 'lucide-react';

const Nosotros = () => {
  const valores = [
    {
      titulo: "Compromiso con el contexto",
      desc: "Desarrollamos soluciones adaptadas al clima, la cultura y los recursos del nordeste argentino."
    },
    {
      titulo: "Calidad constructiva",
      desc: "Priorizamos la correcta ejecución, durabilidad y detalle técnico en cada obra."
    },
    {
      titulo: "Eficiencia y racionalidad",
      desc: "Optimizamos procesos, tiempos y recursos, tanto en obra como en producción."
    },
    {
      titulo: "Integración de sistemas",
      desc: "Articulamos arquitectura, construcción y mobiliario para brindar soluciones completas."
    },
    {
      titulo: "Responsabilidad y cumplimiento",
      desc: "Cumplimos con plazos, costos y compromisos asumidos con cada cliente."
    },
    {
      titulo: "Innovación aplicada",
      desc: "Incorporamos mejoras constantes en técnicas, materiales y procesos productivos."
    }
  ];

  return (
    <section id="nosotros" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Quiénes Somos</h2>
          <div className="w-24 h-1.5 bg-corporate-red mx-auto rounded-full"></div>
        </div>

        {/* Mision y Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-corporate-gray rounded-3xl border-l-8 border-corporate-red shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-corporate-red/10 rounded-2xl text-corporate-red">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Misión</h3>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed italic">
              "Impulsar el desarrollo del nordeste argentino a través de obras institucionales y residenciales, integrando arquitectura, construcción y mobiliario con criterios de eficiencia, calidad y pertenencia regional."
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-corporate-gray rounded-3xl border-l-8 border-corporate-gold shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-corporate-gold/10 rounded-2xl text-corporate-gold">
                <Eye size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Visión</h3>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed italic">
              "Consolidarnos como una empresa referente en el nordeste argentino en el desarrollo de obras institucionales y residenciales, reconocida por su capacidad de integrar diseño, construcción y equipamiento, aportando soluciones innovadoras, sostenibles y adaptadas al contexto local."
            </p>
          </motion.div>
        </div>

        {/* Valores */}
        <div>
          <div className="flex items-center gap-4 mb-12 justify-center">
            <Award className="text-corporate-red" size={40} />
            <h3 className="text-4xl font-bold text-gray-900 uppercase tracking-tight">Nuestros Valores</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-corporate-red group-hover:scale-125 transition-transform">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide group-hover:text-corporate-red transition-colors">
                      {valor.titulo}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {valor.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;

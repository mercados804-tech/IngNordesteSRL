import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Send, User, Building, ChevronDown, MapPin } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Contacto = ({ content }) => {
  const whatsappNumber = '376 4373798';
  const whatsappHref = 'https://wa.me/5493764373798';
  const mapAddress = 'Calle 44 B 8455, Posadas, Misiones';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const whatsappIcon = (
    <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M23.12 9.04A9.37 9.37 0 0 0 8.14 20.3L7 24.49l4.29-1.13A9.36 9.36 0 1 0 23.12 9.04ZM16 23.56a7.52 7.52 0 0 1-3.83-1.05l-.27-.16-2.53.67.68-2.46-.17-.25A7.54 7.54 0 1 1 16 23.56Zm4.13-5.65c-.23-.11-1.35-.67-1.56-.74-.21-.08-.36-.11-.52.11-.15.23-.58.74-.72.9-.13.15-.27.17-.49.06-.23-.11-.96-.35-1.82-1.13-.67-.6-1.13-1.35-1.26-1.57-.13-.23-.01-.35.09-.47.1-.1.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.28-.02-.4-.06-.11-.52-1.24-.71-1.7-.19-.45-.38-.39-.52-.39h-.44c-.15 0-.4.06-.61.28-.21.23-.8.78-.8 1.89 0 1.11.82 2.19.93 2.34.11.15 1.6 2.45 3.87 3.43.54.23.96.37 1.29.47.54.17 1.03.14 1.42.09.43-.06 1.35-.55 1.54-1.08.19-.53.19-.99.13-1.08-.05-.09-.2-.14-.43-.25Z"
      />
    </svg>
  );

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    servicio: '',
    mensaje: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const contactInfo = [
    {
      icon: whatsappIcon,
      title: "WhatsApp",
      value: whatsappNumber,
      sub: "Escribinos directamente por WhatsApp",
      link: whatsappHref
    },
    {
      icon: <Phone className="text-blue-500" />,
      title: "Telefono",
      value: content?.telefono || "+54 9 376 412-3456",
      sub: "Lun - Vie: 7:00 - 17:00",
      link: `tel:${content?.telefono?.replace(/\s+/g, '') || '+5493764123456'}`
    },
    {
      icon: <MapPin className="text-corporate-gold" />,
      title: "Dirección",
      value: content?.direccion || mapAddress,
      sub: "Posadas, Misiones",
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content?.direccion || mapAddress)}`
    },
    {
      icon: <Mail className="text-corporate-red" />,
      title: "Email",
      value: content?.email || "info@ingenierianordeste.com",
      sub: "Respuesta en 24hs",
      link: `mailto:${content?.email || 'info@ingenierianordeste.com'}`
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'consultas'), {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        empresa: formData.empresa.trim(),
        servicio: formData.servicio,
        mensaje: formData.mensaje.trim(),
        createdAt: serverTimestamp(),
      });

      setSuccess('Tu consulta se envio correctamente. Te responderemos a la brevedad.');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        servicio: '',
        mensaje: '',
      });
    } catch (submitError) {
      console.error('Error enviando consulta:', submitError);
      setError('No se pudo enviar la consulta. Verifica Firestore e intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 bg-corporate-gray overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-corporate-red mb-6">Contáctanos</h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Solicita tu presupuesto sin compromiso
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info Cards */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Información de Contacto</h3>
            <p className="text-gray-600 mb-12 text-lg">
              Comunícate con nosotros a través de cualquiera de estos medios. Responderemos a la brevedad.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 p-8 bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all group border border-gray-100"
                >
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {info.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{info.title}</h4>
                    <div className="text-lg md:text-xl font-bold text-gray-900 mb-1 break-words">{info.value}</div>
                    <div className="text-sm text-gray-500 break-words">{info.sub}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Solicita tu Presupuesto</h3>
            <p className="text-gray-500 mb-10 font-light">Completa el formulario y nos pondremos en contacto contigo</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" /> Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+54 11 1234-5678"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Building size={16} className="text-gray-400" /> Empresa (opcional)
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  placeholder="Nombre de tu empresa"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Servicio de interés *</label>
                <div className="relative">
                  <select
                    name="servicio"
                    required
                    value={formData.servicio}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona un servicio</option>
                    <option value="obras">Obras Civiles</option>
                    <option value="muebles">Fabricación de Muebles</option>
                    <option value="electricidad">Electricidad / Sistemas</option>
                    <option value="otro">Otro</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Mensaje *</label>
                <textarea
                  name="mensaje"
                  required
                  rows="4"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos sobre tu proyecto..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all resize-none"
                ></textarea>
              </div>

              {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
              {success && <p className="text-green-600 text-sm font-bold text-center">{success}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 bg-corporate-red text-white rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-800'}`}
              >
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white h-[400px] relative group"
        >
          <div className="absolute inset-0 bg-corporate-red/5 group-hover:bg-transparent transition-colors pointer-events-none z-10"></div>
          <iframe 
            src={mapSrc}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Ingeniería Nordeste"
            className="grayscale hover:grayscale-0 transition-all duration-700"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
};

export default Contacto;

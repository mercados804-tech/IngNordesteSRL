import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Send, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const FormularioCV = ({ jobs, contactEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    puesto: '',
    mensaje: '',
    archivo: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayJobs = jobs || [
    { id: 1, title: "Ingeniero Civil", location: "Nordeste", type: "Tiempo Completo" },
    { id: 2, title: "Carpintero Especializado", location: "Misiones", type: "Tiempo Completo" },
    { id: 3, title: "Electricista Industrial", location: "Chaco", type: "Tiempo Completo" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openForm = (puesto = '') => {
    setError('');
    setSuccess('');
    setIsOpen(true);
    if (puesto) {
      setFormData((prev) => ({ ...prev, puesto }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file && !allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos PDF o Word (Max 5MB).');
      setFormData((prev) => ({ ...prev, archivo: null }));
    } else if (file && file.size > 5 * 1024 * 1024) {
      setError('El archivo supera el máximo permitido de 5MB.');
      setFormData((prev) => ({ ...prev, archivo: null }));
    } else {
      setError('');
      setFormData((prev) => ({ ...prev, archivo: file }));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      puesto: '',
      mensaje: '',
      archivo: null,
    });
  };

  const sendCvEmailNotification = async ({ cvUrl, storagePath }) => {
    const recipientEmail = (contactEmail || 'info@ingenierianordeste.com').trim();
    if (!recipientEmail) return { sent: false };

    const emailFormData = new FormData();
    emailFormData.append('_subject', `Nuevo CV recibido - ${formData.nombre.trim()}`);
    emailFormData.append('_captcha', 'false');
    emailFormData.append('_template', 'table');
    emailFormData.append('_replyto', formData.email.trim());
    emailFormData.append('nombre', formData.nombre.trim());
    emailFormData.append('email', formData.email.trim());
    emailFormData.append('telefono', formData.telefono.trim());
    emailFormData.append('puesto', formData.puesto.trim());
    emailFormData.append('mensaje', formData.mensaje.trim() || 'Sin mensaje adicional');
    emailFormData.append('cv_url', cvUrl || 'No disponible');
    emailFormData.append('storage_path', storagePath || 'No disponible');

    if (formData.archivo) {
      emailFormData.append('attachment', formData.archivo);
    }

    const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: emailFormData,
    });

    if (!response.ok) {
      throw new Error(`formsubmit-${response.status}`);
    }

    return { sent: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.archivo) {
      setError('Por favor, adjunta tu CV.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const safeName = formData.archivo.name.replace(/\s+/g, '-');
      const storageRef = ref(storage, `cvs/${Date.now()}-${safeName}`);
      const snapshot = await uploadBytes(storageRef, formData.archivo);
      const storagePath = snapshot.ref.fullPath;
      let cvUrl = '';

      try {
        cvUrl = await getDownloadURL(snapshot.ref);
      } catch (urlError) {
        console.warn('No se pudo obtener la URL publica del CV. Se guardara el storagePath.', urlError);
      }

      await addDoc(collection(db, 'cvs'), {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        puesto: formData.puesto.trim(),
        mensaje: formData.mensaje.trim(),
        cvUrl,
        storagePath,
        fileName: formData.archivo.name,
        createdAt: serverTimestamp(),
      });

      let emailSent = false;
      try {
        const emailResult = await sendCvEmailNotification({ cvUrl, storagePath });
        emailSent = emailResult.sent;
      } catch (emailError) {
        console.error('Error enviando notificacion por email:', emailError);
      }

      setSuccess(
        emailSent
          ? 'Tu CV se envio correctamente. Gracias por postularte.'
          : 'Tu CV se guardo correctamente. Revisá que el correo de contacto esté activado en FormSubmit para recibir avisos por email.'
      );
      resetForm();
    } catch (submitError) {
      console.error('Error enviando CV:', submitError);
      const code = submitError?.code || '';

      if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
        setError('Firebase Storage esta bloqueando el acceso al archivo. Revisa las reglas de la carpeta cvs.');
      } else if (code === 'firestore/permission-denied') {
        setError('Firestore no permite guardar la postulacion. Revisa las reglas de la coleccion cvs.');
      } else {
        setError(`No se pudo enviar la postulacion. ${code ? `Error: ${code}` : 'Verifica Firebase e intenta nuevamente.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="trabaja-con-nosotros" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Trabajá con nosotros</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto italic">
            Sumate a un equipo que transforma realidades en el nordeste argentino.
          </p>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 gap-6 mb-16 max-w-4xl mx-auto">
          {displayJobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ x: 10 }}
              className="p-6 bg-corporate-gray rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group cursor-pointer"
              onClick={() => openForm(job.title)}
            >
              <div className="flex items-center gap-6 w-full">
                <div className="p-4 bg-corporate-red text-white rounded-xl group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-corporate-red transition-colors">{job.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-corporate-red hidden md:block" />
            </motion.div>
          ))}
        </div>

        {/* Call to Action Card */}
        <div className="max-w-4xl mx-auto bg-corporate-red rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Briefcase size={120} />
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">¿No encuentras el puesto que buscas?</h3>
          <p className="text-gray-200 text-lg mb-12 max-w-2xl mx-auto relative z-10 font-light leading-relaxed">
            Envíanos tu CV y te contactaremos cuando tengamos una oportunidad que se ajuste a tu perfil.
          </p>
          
          <div className="flex justify-center relative z-10">
            <button 
              onClick={() => openForm()}
              className="px-10 py-5 bg-corporate-gold hover:bg-yellow-600 text-white font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              <FileText size={20} /> Enviar CV Completo
            </button>
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-[110]"
              >
                {/* Modal Header */}
                <div className="bg-corporate-red p-6 md:p-8 text-white relative shrink-0">
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-[120]"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-2xl md:text-3xl font-bold mb-1">Envía tu CV</h3>
                  <p className="text-gray-200 text-sm">Completa el formulario y adjunta tu currículum</p>
                </div>

                {/* Modal Form - Scrollable area */}
                <div className="overflow-y-auto p-6 md:p-10 custom-scrollbar flex-1">
                  <form onSubmit={handleSubmit} className="space-y-6 pb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Nombre completo *</label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Juan Pérez"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                        value={formData.email}
                        onChange={handleInputChange}
                          placeholder="juan@email.com"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Teléfono *</label>
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
                      <label className="text-sm font-bold text-gray-700">Puesto de interés *</label>
                      <input
                        type="text"
                        name="puesto"
                        required
                        value={formData.puesto}
                        onChange={handleInputChange}
                        placeholder="Ej: Ingeniero Civil, Electricista, Carpintero"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Currículum Vitae *</label>
                      <div className="relative group">
                        <input
                          type="file"
                          name="cv"
                          accept=".pdf,.doc,.docx"
                          required
                          onChange={handleFileChange}
                          className="hidden"
                          id="cv-upload"
                        />
                        <label 
                          htmlFor="cv-upload"
                          className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-corporate-gold bg-yellow-50/30 rounded-2xl cursor-pointer group-hover:bg-yellow-50 group-hover:border-yellow-600 transition-all"
                        >
                          <Upload size={32} className="text-corporate-gold mb-2" />
                          <span className="font-bold text-gray-700 text-sm">Click para subir o arrastra aquí</span>
                          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">PDF o Word (Max. 5MB)</span>
                          {formData.archivo && (
                            <span className="mt-3 px-4 py-1 bg-corporate-red text-white text-[10px] rounded-full font-bold">
                              {formData.archivo.name}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Mensaje adicional (opcional)</label>
                      <textarea
                        name="mensaje"
                        rows="3"
                        value={formData.mensaje}
                        onChange={handleInputChange}
                        placeholder="Cuéntanos brevemente sobre tu experiencia..."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    {success && <p className="text-green-600 text-xs font-bold text-center">{success}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-5 bg-corporate-red text-white rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-800'}`}
                    >
                      <Send size={20} /> {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FormularioCV;

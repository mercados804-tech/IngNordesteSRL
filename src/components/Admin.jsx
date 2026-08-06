import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Save, Plus, Trash2, LayoutDashboard, Globe, Briefcase, FileText, Users, Download, ArrowLeft, Upload, Loader2, Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [cvs, setCvs] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [content, setContent] = useState({
    hero: { title: '', description: '', image: '' },
    servicios: [],
    proyectos: [],
    contacto: {
      telefono: '',
      email: '',
      direccion: '',
      redes: {
        instagram: '',
        facebook: ''
      }
    },
    empleos: []
  });
  const navigate = useNavigate();

  const handleFileUpload = async (file, pathPrefix = 'general') => {
    if (!file) return null;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error al subir el archivo.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const ImageUploadField = ({ label, value, onChange, pathPrefix }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file) => {
      const url = await handleFileUpload(file, pathPrefix);
      if (url) onChange(url);
    };

    return (
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          className={`relative group border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-6 gap-3 ${dragActive ? 'border-corporate-red bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-corporate-red/50'}`}
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-corporate-red" size={32} />
          ) : value ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => onChange('')}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="text-gray-400 group-hover:text-corporate-red transition-colors" size={32} />
              <p className="text-sm text-gray-500 text-center font-medium">
                Arrastra una imagen o <label className="text-corporate-red cursor-pointer hover:underline">haz clic para buscar</label>
              </p>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,video/*"
                onChange={(e) => handleFile(e.target.files[0])}
                id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <label 
                htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="absolute inset-0 cursor-pointer"
              />
            </>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-mono outline-none focus:ring-1 focus:ring-corporate-red"
          placeholder="O pega una URL o ruta de /assets/img/"
        />
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const isBypass = sessionStorage.getItem('isAdmin') === 'true';
      if (currentUser) {
        sessionStorage.removeItem('isAdmin');
        setUser(currentUser);
        fetchData();
      } else if (isBypass) {
        setUser({ email: 'Modo emergencia', isBypass: true });
        fetchData();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const docRef = doc(db, "content", "landing");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }

      // Fetch CVs
      const cvsSnap = await getDocs(collection(db, "cvs"));
      const firestoreCvs = await Promise.all(
        cvsSnap.docs.map(async (docItem) => {
          const data = { id: docItem.id, ...docItem.data() };

          if (!data.cvUrl && data.storagePath) {
            try {
              data.cvUrl = await getDownloadURL(ref(storage, data.storagePath));
            } catch (error) {
              console.error("Error resolving CV URL:", error);
            }
          }

          return data;
        })
      );

      let storageOnlyCvs = [];
      try {
        const storageFolderRef = ref(storage, 'cvs');
        const storageList = await listAll(storageFolderRef);
        const knownPaths = new Set(
          firestoreCvs
            .map((cv) => cv.storagePath)
            .filter(Boolean)
        );

        storageOnlyCvs = await Promise.all(
          storageList.items
            .filter((item) => !knownPaths.has(item.fullPath))
            .map(async (item) => {
              let url = '';

              try {
                url = await getDownloadURL(item);
              } catch (error) {
                console.error("Error resolving storage-only CV URL:", error);
              }

              return {
                id: `storage:${item.fullPath}`,
                nombre: 'CV en Storage',
                email: item.name,
                puesto: 'Sin registro en Firestore',
                cvUrl: url,
                storagePath: item.fullPath,
                fileName: item.name,
                createdAt: null,
                isStorageOnly: true,
              };
            })
        );
      } catch (error) {
        console.error("Error listing CVs from Storage:", error);
      }

      setCvs([...firestoreCvs, ...storageOnlyCvs]);

      // Fetch consultas
      const consultasSnap = await getDocs(collection(db, "consultas"));
      const consultasList = consultasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConsultas(consultasList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDeleteCV = async (cv) => {
    if (window.confirm("¿Estás seguro de eliminar este CV?")) {
      try {
        if (cv.storagePath) {
          try {
            await deleteObject(ref(storage, cv.storagePath));
          } catch (storageError) {
            console.error("Error deleting CV file from Storage:", storageError);
          }
        }

        if (!cv.isStorageOnly) {
          await deleteDoc(doc(db, "cvs", cv.id));
        }

        setCvs(cvs.filter((item) => item.id !== cv.id));
      } catch (error) {
        console.error("Error deleting CV:", error);
      }
    }
  };

  const handleDownloadCV = async (cv) => {
    try {
      let fileUrl = cv.cvUrl;

      if (!fileUrl && cv.storagePath) {
        fileUrl = await getDownloadURL(ref(storage, cv.storagePath));
      }

      if (!fileUrl) {
        alert('No se encontró un archivo descargable para este CV.');
        return;
      }

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = cv.fileName || 'cv';
      link.target = '_blank';
      link.rel = 'noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert('No se pudo descargar el CV.');
    }
  };

  const handleDeleteConsulta = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta consulta?")) {
      try {
        await deleteDoc(doc(db, "consultas", id));
        setConsultas(consultas.filter((consulta) => consulta.id !== id));
      } catch (error) {
        console.error("Error deleting consulta:", error);
      }
    }
  };

  const handleSave = async () => {
    if (user?.isBypass) {
      alert("Estás en modo emergencia. Para poder guardar, cerrá sesión e iniciá sesión con tu usuario de Firebase (Authentication).");
      return;
    }
    try {
      await setDoc(doc(db, "content", "landing"), content);
      alert("¡Contenido actualizado con éxito!");
    } catch (error) {
      console.error("Error updating content:", error);
      alert(`Hubo un error al guardar los cambios.\n${error?.code ? `Código: ${error.code}\n` : ''}${error?.message || ''}`);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('isAdmin');
    await signOut(auth);
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-corporate-red font-bold text-2xl animate-pulse">Cargando Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-20">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 p-8 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-400 hover:text-corporate-red transition-colors text-sm font-bold group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Volver a la Web
            </Link>
            <div className="flex items-center gap-3 text-corporate-red">
              <LayoutDashboard size={28} />
              <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'hero', label: 'Inicio / Hero', icon: Globe },
              { id: 'servicios', label: 'Servicios', icon: Briefcase },
              { id: 'proyectos', label: 'Proyectos', icon: FileText },
              { id: 'contacto', label: 'Contacto', icon: Phone },
              { id: 'empleos', label: 'Empleos', icon: Briefcase },
              { id: 'cvs', label: 'CVs Recibidos', icon: Users },
              { id: 'consultas', label: 'Consultas', icon: MessageCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-corporate-red text-white shadow-lg shadow-corporate-red/30' : 'text-gray-500 hover:bg-gray-100 hover:text-corporate-red'}`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-12 flex items-center gap-4 px-5 py-4 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 capitalize">{activeTab}</h1>
              <p className="text-gray-500 mt-2">Gestioná el contenido visible en la landing page.</p>
            </div>
            <button
              onClick={handleSave}
              className="px-8 py-4 bg-corporate-red text-white rounded-xl font-bold shadow-xl hover:bg-red-800 transition-all flex items-center gap-3 active:scale-95"
            >
              <Save size={20} />
              Guardar Cambios
            </button>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100"
            >
              {activeTab === 'hero' && (
                <div className="space-y-8">
                  <ImageUploadField 
                    label="Imagen Hero"
                    value={content.hero.image}
                    onChange={(val) => setContent({ ...content, hero: { ...content.hero, image: val } })}
                    pathPrefix="hero"
                  />
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Título Principal</label>
                    <input
                      type="text"
                      value={content.hero.title}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all font-bold text-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Descripción Hero</label>
                    <textarea
                      rows="4"
                      value={content.hero.description}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all resize-none text-lg leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'servicios' && (
                <div className="space-y-8">
                  {content.servicios.map((servicio, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                      <button 
                        onClick={() => {
                          const newServicios = [...content.servicios];
                          newServicios.splice(index, 1);
                          setContent({ ...content, servicios: newServicios });
                        }}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Título del Servicio</label>
                          <input
                            type="text"
                            value={servicio.title}
                            onChange={(e) => {
                              const newServicios = [...content.servicios];
                              newServicios[index].title = e.target.value;
                              setContent({ ...content, servicios: newServicios });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                          <input
                            type="text"
                            value={servicio.description}
                            onChange={(e) => {
                              const newServicios = [...content.servicios];
                              newServicios[index].description = e.target.value;
                              setContent({ ...content, servicios: newServicios });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <ImageUploadField 
                          label="Imagen del Servicio"
                          value={servicio.image}
                          onChange={(val) => {
                            const newServicios = [...content.servicios];
                            newServicios[index].image = val;
                            setContent({ ...content, servicios: newServicios });
                          }}
                          pathPrefix="servicios"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setContent({ ...content, servicios: [...content.servicios, { id: Date.now(), title: '', description: '' }] })}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-corporate-red hover:text-corporate-red transition-all flex items-center justify-center gap-3 font-bold"
                  >
                    <Plus size={20} /> Agregar Nuevo Servicio
                  </button>
                </div>
              )}

              {activeTab === 'proyectos' && (
                <div className="space-y-8">
                  {content.proyectos.map((proyecto, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                      <button 
                        onClick={() => {
                          const newProyectos = [...content.proyectos];
                          newProyectos.splice(index, 1);
                          setContent({ ...content, proyectos: newProyectos });
                        }}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Proyecto</label>
                          <input
                            type="text"
                            value={proyecto.title}
                            onChange={(e) => {
                              const newProyectos = [...content.proyectos];
                              newProyectos[index].title = e.target.value;
                              setContent({ ...content, proyectos: newProyectos });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                          <input
                            type="text"
                            value={proyecto.category || ''}
                            onChange={(e) => {
                              const newProyectos = [...content.proyectos];
                              newProyectos[index].category = e.target.value;
                              setContent({ ...content, proyectos: newProyectos });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red"
                            placeholder="Ej: Institucional, Arquitectura"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <ImageUploadField 
                            label="Imagen de Portada"
                            value={proyecto.image}
                            onChange={(val) => {
                              const newProyectos = [...content.proyectos];
                              newProyectos[index].image = val;
                              setContent({ ...content, proyectos: newProyectos });
                            }}
                            pathPrefix="proyectos"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Descripción / Detalles</label>
                          <textarea
                            rows="2"
                            value={proyecto.description}
                            onChange={(e) => {
                              const newProyectos = [...content.proyectos];
                              newProyectos[index].description = e.target.value;
                              setContent({ ...content, proyectos: newProyectos });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red resize-none"
                          />
                        </div>
                      </div>

                      {/* Gallery Editor */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Galería Multimedia (Fotos/Videos)</label>
                        <div className="space-y-3">
                          {proyecto.gallery?.map((media, mIdx) => (
                            <div key={mIdx} className="flex gap-3 items-center">
                              <select 
                                value={media.type}
                                onChange={(e) => {
                                  const newProyectos = [...content.proyectos];
                                  newProyectos[index].gallery[mIdx].type = e.target.value;
                                  setContent({ ...content, proyectos: newProyectos });
                                }}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                              >
                                <option value="image">Imagen</option>
                                <option value="video">Video</option>
                              </select>
                              <input
                                type="text"
                                value={media.url}
                                onChange={(e) => {
                                  const newProyectos = [...content.proyectos];
                                  newProyectos[index].gallery[mIdx].url = e.target.value;
                                  setContent({ ...content, proyectos: newProyectos });
                                }}
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-corporate-red"
                                placeholder="/assets/img/archivo.ext"
                              />
                              
                              <div className="relative">
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  id={`gallery-upload-${index}-${mIdx}`}
                                  onChange={async (e) => {
                                    const url = await handleFileUpload(e.target.files[0], 'gallery');
                                    if (url) {
                                      const newProyectos = [...content.proyectos];
                                      newProyectos[index].gallery[mIdx].url = url;
                                      setContent({ ...content, proyectos: newProyectos });
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`gallery-upload-${index}-${mIdx}`}
                                  className="p-2 bg-gray-100 hover:bg-corporate-red hover:text-white rounded-lg transition-colors cursor-pointer block"
                                >
                                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                </label>
                              </div>

                              <button 
                                onClick={() => {
                                  const newProyectos = [...content.proyectos];
                                  newProyectos[index].gallery.splice(mIdx, 1);
                                  setContent({ ...content, proyectos: newProyectos });
                                }}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newProyectos = [...content.proyectos];
                              if (!newProyectos[index].gallery) newProyectos[index].gallery = [];
                              newProyectos[index].gallery.push({ type: 'image', url: '' });
                              setContent({ ...content, proyectos: newProyectos });
                            }}
                            className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-corporate-red hover:border-corporate-red text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <Plus size={14} /> Añadir a la Galería
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setContent({ ...content, proyectos: [...content.proyectos, { id: Date.now(), title: '', description: '' }] })}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-corporate-red hover:text-corporate-red transition-all flex items-center justify-center gap-3 font-bold"
                  >
                    <Plus size={20} /> Agregar Nuevo Proyecto
                  </button>
                </div>
              )}

              {activeTab === 'contacto' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <Phone size={16} className="text-corporate-red" /> Teléfono
                      </label>
                      <input
                        type="text"
                        value={content.contacto?.telefono || ''}
                        onChange={(e) => setContent({ ...content, contacto: { ...content.contacto, telefono: e.target.value } })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all font-bold"
                        placeholder="+54 9 376 412-3456"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <Mail size={16} className="text-corporate-red" /> Email
                      </label>
                      <input
                        type="email"
                        value={content.contacto?.email || ''}
                        onChange={(e) => setContent({ ...content, contacto: { ...content.contacto, email: e.target.value } })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all font-bold"
                        placeholder="info@ingenierianordeste.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} className="text-corporate-red" /> Dirección
                    </label>
                    <input
                      type="text"
                      value={content.contacto?.direccion || ''}
                      onChange={(e) => setContent({ ...content, contacto: { ...content.contacto, direccion: e.target.value } })}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all font-bold"
                      placeholder="Posadas, Misiones, Argentina"
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Redes Sociales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          <Instagram size={16} className="text-pink-600" /> Instagram
                        </label>
                        <input
                          type="text"
                          value={content.contacto?.redes?.instagram || ''}
                          onChange={(e) => setContent({ 
                            ...content, 
                            contacto: { 
                              ...content.contacto, 
                              redes: { ...content.contacto.redes, instagram: e.target.value } 
                            } 
                          })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all text-sm"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          <Facebook size={16} className="text-blue-600" /> Facebook
                        </label>
                        <input
                          type="text"
                          value={content.contacto?.redes?.facebook || ''}
                          onChange={(e) => setContent({ 
                            ...content, 
                            contacto: { 
                              ...content.contacto, 
                              redes: { ...content.contacto.redes, facebook: e.target.value } 
                            } 
                          })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all text-sm"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'empleos' && (
                <div className="space-y-8">
                  {content.empleos?.map((empleo, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                      <button 
                        onClick={() => {
                          const newEmpleos = [...content.empleos];
                          newEmpleos.splice(index, 1);
                          setContent({ ...content, empleos: newEmpleos });
                        }}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Título del Puesto</label>
                          <input
                            type="text"
                            value={empleo.title}
                            onChange={(e) => {
                              const newEmpleos = [...content.empleos];
                              newEmpleos[index].title = e.target.value;
                              setContent({ ...content, empleos: newEmpleos });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red font-bold"
                            placeholder="Ej: Ingeniero Civil"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Ubicación</label>
                          <input
                            type="text"
                            value={empleo.location}
                            onChange={(e) => {
                              const newEmpleos = [...content.empleos];
                              newEmpleos[index].location = e.target.value;
                              setContent({ ...content, empleos: newEmpleos });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red"
                            placeholder="Ej: Posadas, Misiones"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Jornada</label>
                          <input
                            type="text"
                            value={empleo.type}
                            onChange={(e) => {
                              const newEmpleos = [...content.empleos];
                              newEmpleos[index].type = e.target.value;
                              setContent({ ...content, empleos: newEmpleos });
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-corporate-red"
                            placeholder="Ej: Tiempo Completo"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setContent({ ...content, empleos: [...(content.empleos || []), { id: Date.now(), title: '', location: '', type: '' }] })}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-corporate-red hover:text-corporate-red transition-all flex items-center justify-center gap-3 font-bold"
                  >
                    <Plus size={20} /> Agregar Nueva Vacante
                  </button>
                </div>
              )}

              {activeTab === 'cvs' && (
                <div className="space-y-6">
                  {cvs.length === 0 ? (
                    <p className="text-center text-gray-500 py-10 italic">No se han recibido CVs aún.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Postulante</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Puesto</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Fecha</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {cvs.map((cv) => (
                            <tr key={cv.id} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="py-4">
                                <div className="font-bold text-gray-900">{cv.nombre}</div>
                                <div className="text-xs text-gray-500">{cv.email}</div>
                              </td>
                              <td className="py-4 text-sm text-gray-600">{cv.puesto}</td>
                              <td className="py-4 text-sm text-gray-500">
                                {cv.createdAt?.toDate ? cv.createdAt.toDate().toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 text-right space-x-2">
                                <button 
                                  onClick={() => handleDownloadCV(cv)}
                                  className="p-2 text-corporate-gold hover:bg-yellow-50 rounded-lg inline-block transition-colors"
                                  title="Descargar CV"
                                >
                                  <Download size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCV(cv)}
                                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'consultas' && (
                <div className="space-y-6">
                  {consultas.length === 0 ? (
                    <p className="text-center text-gray-500 py-10 italic">No se han recibido consultas aún.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Contacto</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Servicio</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Mensaje</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Fecha</th>
                            <th className="pb-4 font-bold text-gray-400 uppercase text-xs text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {consultas.map((consulta) => (
                            <tr key={consulta.id} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="py-4">
                                <div className="font-bold text-gray-900">{consulta.nombre}</div>
                                <div className="text-xs text-gray-500">{consulta.email}</div>
                                <div className="text-xs text-gray-500">{consulta.telefono}</div>
                              </td>
                              <td className="py-4 text-sm text-gray-600">{consulta.servicio || 'N/A'}</td>
                              <td className="py-4 text-sm text-gray-600 max-w-xs">
                                <p className="line-clamp-3">{consulta.mensaje}</p>
                              </td>
                              <td className="py-4 text-sm text-gray-500">
                                {consulta.createdAt?.toDate ? consulta.createdAt.toDate().toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 text-right">
                                <button 
                                  onClick={() => handleDeleteConsulta(consulta.id)}
                                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Admin;

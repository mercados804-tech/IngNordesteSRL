import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Nosotros from './components/Nosotros';
import Servicios from './components/Servicios';
import Proyectos from './components/Proyectos';
import FormularioCV from './components/FormularioCV';
import Contacto from './components/Contacto';
import Login from './components/Login';
import Admin from './components/Admin';
import Footer from './components/Footer';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function App() {
  const [content, setContent] = useState({
    hero: {
      title: "Construimos soluciones a medida para tu proyecto",
      description: "Experiencia, calidad y compromiso en cada obra. Transformamos tus ideas en realidad con profesionalismo y dedicación.",
      image: "/assets/img/hero-nor.jpg"
    },
    servicios: [
      { 
        id: 1, 
        title: "Obras Civiles", 
        description: "Construcción de edificios residenciales y comerciales, infraestructura vial, puentes y proyectos de gran envergadura. Contamos con equipos especializados y tecnología de punta.", 
        items: ["Edificios residenciales y comerciales", "Infraestructura vial y puentes", "Proyectos de gran envergadura"],
        image: "/assets/img/obracivil-nor.png"
      },
      { 
        id: 2, 
        title: "Muebles Escolares", 
        description: "Diseño y fabricación de mobiliario escolar a medida, garantizando durabilidad y ergonomía para instituciones educativas. Combinamos funcionalidad y estética en cada pieza.", 
        items: ["Bancos y sillas escolares", "Escritorios docentes", "Armarios y estanterías"],
        image: "/assets/img/mobili-noed.jpg"
      },
      { 
        id: 3, 
        title: "Electricidad", 
        description: "Instalaciones eléctricas industriales, comerciales y residenciales. Mantenimiento preventivo y correctivo, automatización y sistemas de energía renovable con personal certificado.", 
        items: ["Instalaciones eléctricas certificadas", "Mantenimiento y reparaciones", "Sistemas de energía renovable"],
        image: "/assets/img/elect-nor.jpg"
      }
    ],
    proyectos: [
      { 
        id: 1, 
        title: "Instituto Santa Catalina", 
        description: "Inauguración de nuevos espacios Maker. Un proyecto enfocado en la innovación educativa.",
        category: "Institucional",
        image: "/assets/img/captura-sta-catalina.png",
        gallery: [
          { type: 'video', url: '/assets/img/video-2.mp4' },
          { type: 'image', url: '/assets/img/obracivil-nor.png' }
        ]
      },
      { 
        id: 2, 
        title: "Instituto Andrés Guacurarí (Posadas)", 
        description: "Sede Posadas. Un espacio diseñado para todas las etapas educativas con infraestructura de vanguardia.",
        category: "Institucional",
        image: "/assets/img/andres-guac.png",
        gallery: [
          { type: 'image', url: '/assets/img/andres-guac.png' },
          { type: 'video', url: '/assets/img/video-5.mp4' }
        ]
      },
      { 
        id: 3, 
        title: "Instituto Andrés Guacurarí (Cerro Azul)", 
        description: "Nueva sede en Cerro Azul, Misiones. Un proyecto integral de construcción civil y mobiliario.",
        category: "Institucional",
        image: "/assets/img/cerro-azul.png",
        gallery: [
          { type: 'image', url: '/assets/img/cerro-azul.png' },
          { type: 'video', url: '/assets/img/video-3.mp4' }
        ]
      }
    ],
    empleos: [
      { id: 1, title: "Ingeniero Civil", location: "Nordeste", type: "Tiempo Completo" },
      { id: 2, title: "Carpintero Especializado", location: "Misiones", type: "Tiempo Completo" },
      { id: 3, title: "Electricista Industrial", location: "Chaco", type: "Tiempo Completo" },
    ],
    contacto: {
      telefono: "+54 9 376 412-3456",
      email: "info@ingenierianordeste.com",
      direccion: "Calle 44 B 8455, Posadas, Misiones",
      redes: {
        instagram: "https://instagram.com/ingnordestesrl",
        facebook: "https://facebook.com/ingnordestesrl"
      }
    }
  });

  // Fetch content from Firestore (Super robust merge logic)
  useEffect(() => {
    const docRef = doc(db, "content", "landing");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const firestoreData = docSnap.data();

        setContent(prev => {
          // Merge Hero
          const newHero = { ...prev.hero };
          if (firestoreData.hero) {
            if (firestoreData.hero.title && firestoreData.hero.title.trim() !== "") newHero.title = firestoreData.hero.title;
            if (firestoreData.hero.description && firestoreData.hero.description.trim() !== "") newHero.description = firestoreData.hero.description;
            if (firestoreData.hero.image && firestoreData.hero.image.trim() !== "") newHero.image = firestoreData.hero.image;
          }

          // Merge Servicios
          const newServicios = prev.servicios.map((localService, i) => {
            const remoteService = firestoreData.servicios?.[i] || {};
            return {
              ...localService,
              ...remoteService,
              title: remoteService.title || localService.title,
              description: remoteService.description || localService.description,
              items: remoteService.items || localService.items,
              image: (remoteService.image && remoteService.image.trim() !== "") ? remoteService.image : localService.image
            };
          });

          // Merge Contacto
          const newContacto = {
            ...prev.contacto,
            ...firestoreData.contacto,
            redes: { ...prev.contacto.redes, ...firestoreData.contacto?.redes }
          };

          return {
            ...prev,
            hero: newHero,
            servicios: newServicios,
            proyectos: (firestoreData.proyectos && firestoreData.proyectos.length > 0) ? firestoreData.proyectos : prev.proyectos,
            empleos: (firestoreData.empleos && firestoreData.empleos.length > 0) ? firestoreData.empleos : prev.empleos,
            contacto: newContacto
          };
        });
      },
      (error) => {
        console.error("Error fetching content:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-corporate-gray">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <section id="inicio"><Hero content={content.hero} /></section>
              <section id="servicios"><Servicios content={content.servicios} /></section>
              <section id="nosotros"><Nosotros /></section>
              <section id="galeria"><Proyectos content={content.proyectos} /></section>
              <section id="trabaja-con-nosotros"><FormularioCV jobs={content.empleos} contactEmail={content.contacto?.email} /></section>
              <section id="contacto"><Contacto content={content.contacto} /></section>
              <Footer content={content.contacto} />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

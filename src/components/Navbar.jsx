import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    if (e.ctrlKey) {
      navigate('/login');
      return;
    }
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      setLogoClicks(0);
      navigate('/login');
    }
    setTimeout(() => setLogoClicks(0), 2000);
  };

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Quiénes somos', href: '#nosotros' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Trabajá con nosotros', href: '#trabaja-con-nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-white py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Logo Section */}
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer flex items-center gap-3 select-none group"
        >
          <img 
            src="/assets/img/logo_editado.png" 
            alt="Ingeniería Nordeste Logo" 
            className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800 leading-tight">Nordeste Ingenieria</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Construcción & Muebles</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-gray-600 hover:text-corporate-red transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-corporate-red after:transition-all hover:after:w-full"
            >
              {link.name}
            </a>
          ))}
          <a href="#contacto" className="px-6 py-2.5 bg-corporate-gold hover:bg-yellow-600 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 text-sm">
            Pedir Presupuesto
          </a>
        </div>

        {/* Hamburger Button (Always Visible in mobile/tablet) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-corporate-red hover:bg-gray-100 rounded-full transition-colors"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Side Menu */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
           onClick={() => setIsOpen(false)}>
        <div 
          className={`absolute top-0 right-0 h-screen w-80 bg-white shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            <div className="flex justify-end mb-8">
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-corporate-red">
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-medium text-gray-700 hover:text-corporate-red transition-colors py-2 border-b border-gray-100"
                >
                  {link.name}
                </a>
              ))}
              <a href="#contacto" onClick={() => setIsOpen(false)} className="mt-4 px-6 py-4 bg-corporate-gold text-white font-bold rounded-xl shadow-lg text-center">
                Pedir Presupuesto
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

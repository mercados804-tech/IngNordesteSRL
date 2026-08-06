import { Phone, Mail, Instagram, Facebook, MapPin } from 'lucide-react';

const Footer = ({ content }) => {
  const whatsappIcon = (
    <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M23.12 9.04A9.37 9.37 0 0 0 8.14 20.3L7 24.49l4.29-1.13A9.36 9.36 0 1 0 23.12 9.04ZM16 23.56a7.52 7.52 0 0 1-3.83-1.05l-.27-.16-2.53.67.68-2.46-.17-.25A7.54 7.54 0 1 1 16 23.56Zm4.13-5.65c-.23-.11-1.35-.67-1.56-.74-.21-.08-.36-.11-.52.11-.15.23-.58.74-.72.9-.13.15-.27.17-.49.06-.23-.11-.96-.35-1.82-1.13-.67-.6-1.13-1.35-1.26-1.57-.13-.23-.01-.35.09-.47.1-.1.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.28-.02-.4-.06-.11-.52-1.24-.71-1.7-.19-.45-.38-.39-.52-.39h-.44c-.15 0-.4.06-.61.28-.21.23-.8.78-.8 1.89 0 1.11.82 2.19.93 2.34.11.15 1.6 2.45 3.87 3.43.54.23.96.37 1.29.47.54.17 1.03.14 1.42.09.43-.06 1.35-.55 1.54-1.08.19-.53.19-.99.13-1.08-.05-.09-.2-.14-.43-.25Z"
      />
    </svg>
  );

  const normalizeSocialUrl = (value, kind) => {
    const v = (value || '').trim();
    if (!v) {
      if (kind === 'instagram') return 'https://instagram.com';
      if (kind === 'facebook') return 'https://facebook.com';
      return '#';
    }
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('www.')) return `https://${v}`;
    const cleaned = v.replace(/^@/, '');
    if (kind === 'instagram') return `https://instagram.com/${cleaned}`;
    if (kind === 'facebook') return `https://facebook.com/${cleaned}`;
    if (cleaned.includes('.')) return `https://${cleaned}`;
    return `https://${cleaned}`;
  };

  const redes = [
    { icon: <Instagram size={20} />, href: normalizeSocialUrl(content?.redes?.instagram, 'instagram'), label: "Instagram", hoverClass: "hover:bg-corporate-red" },
    { icon: <Facebook size={20} />, href: normalizeSocialUrl(content?.redes?.facebook, 'facebook'), label: "Facebook", hoverClass: "hover:bg-corporate-red" },
    { icon: whatsappIcon, href: 'https://wa.me/5493764373798', label: "WhatsApp", hoverClass: "hover:bg-green-500" },
  ];

  return (
    <footer className="bg-corporate-dark text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/assets/img/logo_editado.png" alt="Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold uppercase tracking-tighter">Ingeniería Nordeste</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Líderes en construcción y soluciones integrales en el nordeste argentino. Calidad, compromiso e innovación en cada proyecto.
            </p>
            <div className="flex gap-4">
              {redes.map((red, index) => (
                <a 
                  key={index}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-white/5 rounded-full flex items-center justify-center transition-all group ${red.hoverClass}`}
                  aria-label={red.label}
                >
                  <span className="group-hover:scale-110 transition-transform">{red.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-corporate-red pl-4 uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-corporate-red shrink-0" />
                <span>{content?.direccion || "Posadas, Misiones, Argentina"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-corporate-red shrink-0" />
                <span>{content?.telefono || "+54 9 376 4373798"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-corporate-red shrink-0" />
                <span>{content?.email || "info@ingenierianordeste.com"}</span>
              </li>
            </ul>
          </div>

          {/* Services Links (Quick View) */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-corporate-red pl-4">Servicios</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#servicios" className="hover:text-white transition-colors">Obras Civiles</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Fabricación de Muebles</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Electricidad Industrial</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Sistemas & Soporte</a></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-corporate-red pl-4">Horarios</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p className="flex justify-between">
                <span>Lunes - Viernes:</span>
                <span className="text-white font-medium">07:00 - 17:00</span>
              </p>
              <p className="flex justify-between">
                <span>Sábados:</span>
                <span className="text-white font-medium">08:00 - 12:00</span>
              </p>
              <p className="flex justify-between">
                <span>Domingos:</span>
                <span className="text-red-400 font-medium italic text-xs">Cerrado</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Ingeniería Nordeste SRL. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

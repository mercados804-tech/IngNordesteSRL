import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate('/admin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    sessionStorage.removeItem('isAdmin');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError('En Firebase falta habilitar Google (Authentication → Sign-in method).');
      } else if (code === 'auth/unauthorized-domain') {
        setError('El dominio actual no está autorizado en Firebase Authentication.');
      } else if (code === 'auth/popup-blocked') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithRedirect(auth, provider);
        return;
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Se cerró la ventana de Google. Volvé a intentar.');
      } else if (code === 'auth/cancelled-popup-request') {
        setError('Se canceló el popup. Volvé a intentar.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        setError('Ese email ya existe con otro método de acceso. Probá entrar con email y contraseña.');
      } else {
        setError(`No se pudo iniciar sesión con Google. ${code ? `Error: ${code}` : ''}`.trim());
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    sessionStorage.removeItem('isAdmin');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      if (err?.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          navigate('/admin');
          return;
        } catch (createErr) {
          const code = createErr?.code || '';
          if (code === 'auth/operation-not-allowed') {
            setError('En Firebase falta habilitar el método Email/Contraseña (Authentication → Sign-in method).');
          } else if (code === 'auth/weak-password') {
            setError('La contraseña es muy débil. Usá 6 caracteres o más.');
          } else if (code === 'auth/email-already-in-use') {
            setError('Ese email ya existe. Probá iniciar sesión con tu contraseña.');
          } else {
            setError('No se pudo crear el usuario. Verificá el email/contraseña y la configuración de Firebase.');
          }
        }
      } else {
        const code = err?.code || '';
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          setError('Contraseña incorrecta. Verificá y probá de nuevo.');
        } else if (code === 'auth/invalid-email') {
          setError('El email no es válido.');
        } else if (code === 'auth/too-many-requests') {
          setError('Demasiados intentos. Esperá un momento y volvé a intentar.');
        } else {
          setError('No se pudo iniciar sesión. Verificá el email y la contraseña.');
        }
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-corporate-gray px-4 pt-20">
      <Link 
        to="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-corporate-red transition-colors font-bold group z-50 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Volver a la Web
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-corporate-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-corporate-red w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Acceso Admin</h2>
          <p className="text-gray-500 mt-2">Ingresá tus credenciales para gestionar el sitio.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all"
              placeholder="admin@ingenierianordeste.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} /> Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-red outline-none transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-corporate-red transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-corporate-red text-white rounded-xl font-bold shadow-lg transition-all hover:bg-red-800 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Iniciando...' : 'Entrar al Panel'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm transition-all hover:border-corporate-red hover:text-corporate-red flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Entrar con Google
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-corporate-red text-sm font-medium transition-colors"
          >
            Volver a la web
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

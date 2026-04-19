import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PiggyBank } from '@phosphor-icons/react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        navigate('/mis-huchas');
      } else {
        setError(result.error);
      }
    } else {
      if (!name.trim()) {
        setError('Por favor, introduce tu nombre');
        setLoading(false);
        return;
      }
      const result = await register(email, password, name);
      if (result.success) {
        navigate('/mis-huchas');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Left side - Hero Image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/11427659/pexels-photo-11427659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
        }}
      >
        <div className="absolute inset-0 bg-[#A8E6CF] bg-opacity-30"></div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <PiggyBank size={120} weight="duotone" className="text-[#1A1A1A] mb-6" />
          <h1 className="text-5xl font-black text-[#1A1A1A] text-center uppercase tracking-tighter">
            Mis Huchas
          </h1>
          <p className="text-xl text-[#1A1A1A] text-center mt-4 font-medium">
            Ahorra y controla tu dinero de forma divertida
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-xl p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter">
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="auth-form">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="neo-input"
                    placeholder="Tu nombre"
                    required={!isLogin}
                    data-testid="name-input"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="neo-input"
                  placeholder="tu@email.com"
                  required
                  data-testid="email-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neo-input"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>

              {error && (
                <div
                  className="bg-[#FF9B9B] border-2 border-[#1A1A1A] rounded-xl p-4 text-[#1A1A1A] text-sm font-medium"
                  data-testid="error-message"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="neo-button w-full"
                disabled={loading}
                data-testid="submit-button"
              >
                {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Crear Cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-[#1A1A1A] font-medium hover:underline"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

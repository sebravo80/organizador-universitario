import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/newLogin.css';

const NewLogin = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const { login, register, loading, error } = useContext(AuthContext);
  
  // Estado para formulario de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Estado para formulario de registro
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Manejar cambios en los campos de login
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };
  
  // Manejar cambios en los campos de registro
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };
  
  // Manejar envío del formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (success) {
      navigate('/dashboard');
    }
  };
  
  // Manejar envío del formulario de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const success = await register(registerData.name, registerData.email, registerData.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`}>
      <div className="form-box login">
        <form onSubmit={handleLoginSubmit}>
          <h1>Iniciar Sesión</h1>
          {error && <p className="error">{error}</p>}
          <div className="input-box">
            <input 
              type="email" 
              name="email"
              placeholder="Correo electrónico" 
              required 
              value={loginData.email}
              onChange={handleLoginChange}
            />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              name="password"
              placeholder="Contraseña" 
              required
              value={loginData.password}
              onChange={handleLoginChange}
            />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <div className="forgot-link">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}>¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      <div className="form-box register">
        <form onSubmit={handleRegisterSubmit}>
          <h1>Registrarse</h1>
          {error && <p className="error">{error}</p>}
          <div className="input-box">
            <input 
              type="text" 
              name="name"
              placeholder="Nombre de usuario" 
              required
              value={registerData.name}
              onChange={handleRegisterChange}
            />
            <i className='bx bxs-user'></i>
          </div>
          <div className="input-box">
            <input 
              type="email" 
              name="email"
              placeholder="Correo electrónico" 
              required
              value={registerData.email}
              onChange={handleRegisterChange}
            />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              name="password"
              placeholder="Contraseña" 
              required
              value={registerData.password}
              onChange={handleRegisterChange}
            />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Registrarse'}
          </button>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>¡Wenas Wenas!</h1>
          <p>¿No tienes una cuenta?</p>
          <button 
            className="btn register-btn" 
            onClick={() => setIsActive(true)}
          >
            Registrarse
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>¡Bienvenido!</h1>
          <p>¿Ya tienes una cuenta?</p>
          <button 
            className="btn login-btn" 
            onClick={() => setIsActive(false)}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
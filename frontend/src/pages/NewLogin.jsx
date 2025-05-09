import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/newLogin.css';

const NewLogin = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const { login, register, loading: authLoading, error } = useContext(AuthContext);
  
  // Añade este estado para manejar la carga local
  const [loading, setLoading] = useState(false);
  
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

  // Estado para manejar errores
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para manejar mensajes de éxito
  const [successMessage, setSuccessMessage] = useState('');

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
    
    try {
      setLoading(true);
      const success = await login(loginData.email, loginData.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.msg || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };
  
  // Modificar la función handleRegisterSubmit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mostrar alguna indicación de carga DENTRO del formulario antes de enviar la solicitud
      setErrorMessage('');
      setLoading(true);
      
      const success = await register(registerData.name, registerData.email, registerData.password);
      if (success) {
        // Primero, completar el registro y actualizar el estado
        setLoginData({
          ...loginData,
          email: registerData.email
        });
        
        // Resetear el formulario de registro
        setRegisterData({
          name: '',
          email: '',
          password: ''
        });
        
        // Establecer el mensaje de éxito para que se muestre en el panel de login
        setSuccessMessage('¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.');
        
        // Usar setTimeout con 0ms para asegurar que el mensaje se establezca antes de la transición
        setTimeout(() => {
          setIsActive(false); // Cambiar al panel de login después de que todo esté listo
        }, 10);
      }
    } catch (err) {
      setErrorMessage(err.msg || 'Error al registrar usuario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${isActive ? 'active' : ''}`}>
      <div className="form-box login">
        <form onSubmit={handleLoginSubmit}>
          <h1>Iniciar Sesión</h1>
          {successMessage && !isActive && <p className="success">{successMessage}</p>}
          {(error || errorMessage) && <p className="error">{error || errorMessage}</p>}
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
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      <div className="form-box register">
        <form onSubmit={handleRegisterSubmit}>
          <h1>Registrarse</h1>
          {successMessage && isActive && <p className="success">{successMessage}</p>}
          {(error || errorMessage) && <p className="error">{error || errorMessage}</p>}
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
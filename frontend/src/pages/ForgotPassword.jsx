import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import '../styles/newLogin.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await forgotPassword(email);
      setSuccess(res.msg || 'Se ha enviado un enlace a tu correo si existe en nuestra base de datos');
      setEmail('');
    } catch (err) {
      console.error('Error en recuperación:', err);
      setError(err.response?.data?.msg || err.msg || 'Error al solicitar restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-box login">
        <form onSubmit={handleSubmit}>
          <h1>Recuperar contraseña</h1>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <p>Ingresa tu correo electrónico para recibir un enlace de recuperación</p>
          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <i className='bx bxs-envelope'></i>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Enviar enlace'}
          </button>
          <div className="back-link" style={{marginTop: '20px'}}>
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
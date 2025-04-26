import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import '../styles/newLogin.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const res = await resetPassword(token, password);
      setSuccess(res.msg);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.msg || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-box login">
        <form onSubmit={handleSubmit}>
          <h1>Restablecer contraseña</h1>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          
          {!success && (
            <>
              <div className="input-box">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i className='bx bxs-lock-alt'></i>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <i className='bx bxs-lock-alt'></i>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Procesando...' : 'Restablecer contraseña'}
              </button>
            </>
          )}
          
          <div className="back-link" style={{marginTop: '20px'}}>
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
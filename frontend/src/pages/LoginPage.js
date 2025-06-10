import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './AuthForm.css';

function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Navigate to dashboard or home page after login
    } catch (err) {
      setError(err.message);
      console.error("Error logging in: ", err);
    }
  };

    return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('login.title')}</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">{t('login.emailLabel')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('login.passwordLabel')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button">{t('login.button')}</button>
        </form>
        <p className="switch-auth">
          {t('login.noAccountPrompt')}{' '}
          <button onClick={() => navigate('/signup')} className="switch-auth-button">
            {t('login.signUpLink')}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './AuthForm.css';

function SignupPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role: 'kitchenStaff' // Default role
      });
      
      // Redirect to login page after successful registration
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in.',
          type: 'success'
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error("Error signing up: ", err);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('signup.title')}</h2>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">{t('signup.nameLabel')}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('signup.emailLabel')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('signup.passwordLabel')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? t('signup.creatingAccount') : t('signup.button')}
          </button>
        </form>
        <p className="switch-auth">
          {t('signup.haveAccountPrompt')}{' '}
          <button onClick={() => navigate('/login')} className="switch-auth-button">
            {t('signup.loginLink')}
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;

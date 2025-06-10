import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthForm.css';

function SignupPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user to Firestore 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        role: 'kitchenStaff', // Default role, can be changed by admin later
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate('/'); // Navigate to dashboard or home page after signup
    } catch (err) {
      setError(err.message);
      console.error("Error signing up: ", err);
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
          <button type="submit" className="auth-button">{t('signup.button')}</button>
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

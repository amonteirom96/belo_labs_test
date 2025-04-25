import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/users/register', formData);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.message || 'Error registering');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <button type="button" onClick={handleLoginRedirect} className={`${styles.button} ${styles.loginButton}`}>
            Login
          </button>
          <button type="submit" className={`${styles.button} ${styles.registerButton}`}>
            Register
          </button>
        </div>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default Register;
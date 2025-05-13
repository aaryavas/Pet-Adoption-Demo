import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        console.log('Login successful:', data);
        
        // Store username in localStorage
        localStorage.setItem('username', formData.username);

        alert('Login successful!');
        setFormData({
          username: '',
          password: ''
        });
        navigate('/dashboard'); // Navigate to dashboard on successful login
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({ submit: error.message || 'Login failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSignupClick = () => {
    navigate('/register');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      paddingTop: '80px',
      minHeight: '100vh',
      backgroundColor: '#fefefe',
      textAlign: 'center',
    }}>
      <div style={{ width: '80%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>
          Welcome Back
        </h1>
        <p style={{ fontSize: '1.2rem' }}>
          Enter your credentials to access your account
        </p>
        
        {errors.submit && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              disabled={isSubmitting}
              style={{ padding: '0.5em', fontSize: '1em' }}
            />
            {errors.username && (
              <div style={{ color: 'red', fontSize: '0.9rem' }}>
                {errors.username}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={{ padding: '0.5em', fontSize: '1em' }}
            />
            {errors.password && (
              <div style={{ color: 'red', fontSize: '0.9rem' }}>
                {errors.password}
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.6em 1.2em',
              fontSize: '1em',
              backgroundColor: '#646cff',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1rem',
              width: '100%',
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ fontSize: '1rem' }}>
            Don't have an account?
          </p>
          <button 
            onClick={handleSignupClick}
            style={{
              padding: '0.6em 1.2em',
              fontSize: '1em',
              backgroundColor: '#646cff',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              width: '100%',
            }}
          >
            Sign up
          </button>
          <p style={{ fontSize: '1rem', marginTop: '1rem' }}>
            Are you an admin?
          </p>
          <button 
            onClick={handleAdminClick}
            style={{
              padding: '0.6em 1.2em',
              fontSize: '1em',
              backgroundColor: '#ff0000',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              width: '100%',
            }}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
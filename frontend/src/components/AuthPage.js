import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaChalkboardTeacher, FaUser, FaLock, FaEnvelope, FaGoogle, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' // Default role
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const url = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const { data } = await axios.post(url, formData, {
        withCredentials: true
      });
  
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      } else if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
      
      // Redirect based on role
      if (data.user.role === 'tutor') {
        navigate('/tutor-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" 
         style={{ 
           background: 'linear-gradient(to right, #f8f9fa 50%, #e9ecef 50%)',
           padding: '20px'
         }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card shadow-sm rounded-4 overflow-hidden border-0">
              <div className="row g-0">
                {/* Left Side - Branding */}
                <div className="col-md-6 d-none d-md-flex p-5 flex-column justify-content-center align-items-center"
                     style={{ backgroundColor: '#2c3e50' }}>
                  <div className="text-center text-white">
                    <FaChalkboardTeacher size={48} className="mb-4" style={{ color: '#3498db' }} />
                    <h2 className="fw-bold mb-3">EduConnect</h2>
                    <p className="mb-0 text-light">
                      {isLogin 
                        ? "Join our learning community today!" 
                        : "Welcome back to your education hub"}
                    </p>
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="btn btn-outline-light mt-4 px-4 rounded-pill"
                      style={{ borderColor: '#3498db', color: '#3498db' }}
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                  </div>
                </div>
                
                {/* Right Side - Form */}
                <div className="col-md-6 bg-white p-5">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold" style={{ color: '#2c3e50' }}>
                      {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h3>
                    <p className="text-muted">
                      {isLogin 
                        ? 'Sign in to continue your learning journey' 
                        : 'Create your account to access all features'}
                    </p>
                  </div>
                  
                  {/* Role Selection (only for registration) */}
                  {!isLogin && (
                    <div className="mb-4">
                      <label className="form-label text-muted d-block">Register as:</label>
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className={`btn ${formData.role === 'student' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                          onClick={() => handleRoleChange('student')}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          className={`btn ${formData.role === 'tutor' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                          onClick={() => handleRoleChange('tutor')}
                        >
                          Tutor
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Social Login Buttons */}
                  <div className="d-flex justify-content-center gap-3 mb-4">
                    <button className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center"
                            style={{ borderColor: '#e0e0e0' }}>
                      <FaGoogle className="me-2" style={{ color: '#DB4437' }} />
                      <span>Google</span>
                    </button>
                    <button className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center"
                            style={{ borderColor: '#e0e0e0' }}>
                      <FaGithub className="me-2" />
                      <span>GitHub</span>
                    </button>
                  </div>
                  
                  <div className="text-center mb-4 position-relative">
                    <hr className="my-0" />
                    <span className="px-2 bg-white text-muted position-absolute top-50 start-50 translate-middle">
                      or use email
                    </span>
                  </div>
                  
                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    {!isLogin && (
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label text-muted">Full Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0">
                            <FaUser className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 py-2"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ borderColor: '#e0e0e0' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label text-muted">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <FaEnvelope className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0 py-2"
                          id="email"
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          style={{ borderColor: '#e0e0e0' }}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label text-muted">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <FaLock className="text-muted" />
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 py-2"
                          id="password"
                          name="password"
                          placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={isLogin ? 1 : 8}
                          style={{ borderColor: '#e0e0e0' }}
                        />
                      </div>
                      {!isLogin && (
                        <small className="text-muted">Use 8 or more characters with a mix of letters, numbers & symbols</small>
                      )}
                    </div>
                    
                    {isLogin && (
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input" 
                            id="remember" 
                            style={{ borderColor: '#e0e0e0' }}
                          />
                          <label className="form-check-label text-muted" htmlFor="remember">
                            Remember me
                          </label>
                        </div>
                        <Link to="/forgot-password" className="text-decoration-none" style={{ color: '#3498db' }}>
                          Forgot password?
                        </Link>
                      </div>
                    )}
                    
                    <button 
                      type="submit" 
                      className="btn w-100 py-2 mb-3 fw-bold rounded-pill"
                      style={{ backgroundColor: '#3498db', color: 'white' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : isLogin ? (
                        'Sign In'
                      ) : (
                        'Create Account'
                      )}
                    </button>
                    
                    <div className="text-center">
                      <small className="text-muted">
                        {isLogin 
                          ? "New to EduConnect? " 
                          : "Already have an account? "}
                        <button 
                          type="button" 
                          onClick={() => setIsLogin(!isLogin)}
                          className="btn btn-link p-0 text-decoration-none"
                          style={{ color: '#3498db' }}
                        >
                          {isLogin ? 'Create account' : 'Sign in'}
                        </button>
                      </small>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
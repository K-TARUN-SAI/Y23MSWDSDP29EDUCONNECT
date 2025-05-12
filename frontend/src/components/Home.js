import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaChalkboardTeacher, FaBook, FaCalendarCheck, FaVideo, FaUsers, FaPlayCircle, FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';
import { IoIosRocket } from 'react-icons/io';
import { BsGraphUp, BsShieldLock } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FaVideo size={36} className="text-primary" />, 
      title: "HD Video Conferencing",
      description: "Crystal clear video and audio for immersive virtual classes."
    },
    {
      icon: <FaBook size={36} className="text-success" />, 
      title: "Assignment Management",
      description: "Create, distribute, and grade assignments seamlessly."
    },
    {
      icon: <FaCalendarCheck size={36} className="text-danger" />, 
      title: "Attendance Tracking",
      description: "Automated tracking with detailed analytics and reports."
    },
    {
      icon: <FaUsers size={36} className="text-info" />, 
      title: "Collaborative Learning",
      description: "Interactive group projects and discussion forums."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson", 
      role: "Professor, Computer Science",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "This platform has transformed how I teach online. The interface is intuitive and the features are comprehensive.",
      rating: 5
    },
    {
      name: "James Peterson", 
      role: "Student, Engineering",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "The UI makes virtual classes feel real. I've never felt more connected to my professors and classmates.",
      rating: 4
    },
    {
      name: "Lisa Chen", 
      role: "Teaching Assistant",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "Tracking assignments and attendance has never been easier. Saves me hours every week!",
      rating: 5
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Users" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" },
    { value: "50+", label: "Countries" }
  ];

  return (
    <div className="overflow-hidden">
      {/* Navbar */}
      <nav className={`navbar navbar-expand-lg fixed-top transition-all ${isScrolled ? 'navbar-light bg-white shadow-sm py-2' : 'navbar-dark py-3'}`}
           style={{ transition: 'all 0.3s ease', backgroundColor: isScrolled ? 'white' : 'transparent' }}>
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <FaChalkboardTeacher className="text-primary me-2" size={30} />
            <span className="fw-bold" style={{ color: isScrolled ? '#0d6efd' : 'white' }}>EduConnect</span>
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><a className="nav-link" href="#features" style={{ color: isScrolled ? '#212529' : 'white' }}>Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#how-it-works" style={{ color: isScrolled ? '#212529' : 'white' }}>How It Works</a></li>
              <li className="nav-item"><a className="nav-link" href="#testimonials" style={{ color: isScrolled ? '#212529' : 'white' }}>Testimonials</a></li>
              <li className="nav-item"><a className="nav-link" href="#pricing" style={{ color: isScrolled ? '#212529' : 'white' }}>Pricing</a></li>
            </ul>
            <div className="d-flex">
            <Link to="/auth">
    <button className={`btn ${isScrolled ? 'btn-outline-primary' : 'btn-outline-light'} me-2`}>Login</button>
  </Link>
  <Link to="/auth">
    <button className={`btn ${isScrolled ? 'btn-primary' : 'btn-light text-primary'}`}>Sign Up</button>
  </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section text-white d-flex align-items-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">Empower Learning <span className="text-warning">Everywhere</span></h1>
              <p className="lead mb-4" style={{ opacity: 0.9 }}>A seamless and powerful solution for dynamic virtual classrooms that connects educators and students worldwide.</p>
              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-warning btn-lg px-4 py-3 d-flex align-items-center">
                  <IoIosRocket className="me-2" size={20} /> Get Started
                </button>
                <button className="btn btn-outline-light btn-lg px-4 py-3 d-flex align-items-center">
                  <FaPlayCircle className="me-2" size={20} /> Watch Demo
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                     alt="Virtual Classroom" 
                     className="img-fluid rounded-4 shadow-lg" 
                     style={{ border: '5px solid rgba(255,255,255,0.2)' }} />
                <div className="position-absolute top-0 start-0 translate-middle bg-primary rounded-circle p-3 shadow" 
                     style={{ width: '60px', height: '60px' }}>
                  <FaUsers size={24} className="text-white" />
                </div>
                <div className="position-absolute bottom-0 end-0 translate-middle bg-success rounded-circle p-3 shadow" 
                     style={{ width: '60px', height: '60px' }}>
                  <BsGraphUp size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white" style={{ marginTop: '-50px' }}>
        <div className="container">
          <div className="row g-4 justify-content-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-3 p-4 text-center h-100">
                  <h2 className="fw-bold text-primary">{stat.value}</h2>
                  <p className="mb-0 text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Powerful Features</h2>
            <p className="lead text-muted">Everything you need to create engaging virtual learning experiences</p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm p-4 text-center hover-effect" 
                     style={{ transition: 'transform 0.3s', borderRadius: '15px' }}>
                  <div className="mb-3">{feature.icon}</div>
                  <h5 className="mb-3">{feature.title}</h5>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                   alt="Collaboration" 
                   className="img-fluid rounded-4 shadow" />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">How EduConnect <span className="text-primary">Works</span></h2>
              <div className="d-flex mb-4">
                <div className="me-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '50px', height: '50px' }}>
                    <span className="fw-bold">1</span>
                  </div>
                </div>
                <div>
                  <h5>Create Your Account</h5>
                  <p className="text-muted">Sign up as an educator or student in just a few simple steps.</p>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="me-4">
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '50px', height: '50px' }}>
                    <span className="fw-bold">2</span>
                  </div>
                </div>
                <div>
                  <h5>Set Up Your Virtual Classroom</h5>
                  <p className="text-muted">Customize your learning environment with your preferred settings.</p>
                </div>
              </div>
              <div className="d-flex">
                <div className="me-4">
                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '50px', height: '50px' }}>
                    <span className="fw-bold">3</span>
                  </div>
                </div>
                <div>
                  <h5>Start Teaching or Learning</h5>
                  <p className="text-muted">Engage with your students or classmates in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">What Our Users Say</h2>
            <p className="lead text-muted">Trusted by educators and students worldwide</p>
          </div>
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-md-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4 text-center">
                    <img src={testimonial.image} alt={testimonial.name} 
                         className="rounded-circle mb-3 shadow-sm" width="100" height="100" />
                    <div className="mb-3">
                      {[...Array(5)].map((_, i) => (
                        i < testimonial.rating ? 
                        <FaStar key={i} className="text-warning" /> : 
                        <FaRegStar key={i} className="text-warning" />
                      ))}
                    </div>
                    <FaQuoteLeft className="text-muted mb-3" />
                    <p className="mb-4">"{testimonial.text}"</p>
                    <h6 className="fw-bold mb-0">{testimonial.name}</h6>
                    <small className="text-muted">{testimonial.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-5 text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Learning Experience?</h2>
          <p className="lead mb-5" style={{ opacity: 0.9 }}>Join thousands of educators and students already using EduConnect</p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <button className="btn btn-light btn-lg px-5 py-3 text-primary fw-bold">
              Start Free Trial
            </button>
            <button className="btn btn-outline-light btn-lg px-5 py-3">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

 
    </div>
  );
};

export default Home;
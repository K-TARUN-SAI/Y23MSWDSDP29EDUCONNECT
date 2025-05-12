import React, { useState, useEffect } from 'react';
import { 
  FaChalkboardTeacher, FaVideo, FaBook, FaCalendarAlt,
  FaBell, FaSearch, FaUserCircle, FaChartLine,
  FaUserGraduate, FaClipboardList
} from 'react-icons/fa';
import { BsGraphUp, BsClipboardData } from 'react-icons/bs';
import { Link, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';

const TutorDashboard = () => {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [error, setError] = useState(null);

  // Get the current path to highlight active sidebar item
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!user || !token) {
          setError('User not authenticated. Please log in.');
          setLoading(false);
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        // Fetch tutor's upcoming classes
        const classesRes = await axios.get(`/api/classes/tutor/${user._id}`, config);
        setUpcomingClasses(classesRes.data);

        // Fetch other dashboard data
        const assignmentsRes = await axios.get(`/api/assignments/tutor`, config);
        setAssignments(assignmentsRes.data);

        const attendanceRes = await axios.get(`/api/attendance/tutor/${user._id}`, config);
        setAttendance(attendanceRes.data);

        const studentsRes = await axios.get(`/api/students/tutor/${user._id}`, config);
        setStudents(studentsRes.data);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);


  // Navigation items configuration
  const navItems = [
    {
      path: '/tutor-dashboard',
      icon: <BsGraphUp className="me-2" />,
      label: 'Dashboard'
    },
    {
      path: '/tutor-dashboard/classes',
      icon: <FaVideo className="me-2" />,
      label: 'Classes'
    },
    {
      path: '/tutor-assignments',
      icon: <FaBook className="me-2" />,
      label: 'Assignments'
    },
    {
      path: '/tutor-attendance',
      icon: <BsClipboardData className="me-2" />,
      label: 'Attendance'
    },
    {
      path: '/tutor-dashboard/students',
      icon: <FaUserGraduate className="me-2" />,
      label: 'Students'
    }
  ];

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#2c3e50' }}>
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/tutor-dashboard">
            <FaChalkboardTeacher className="me-2" style={{ color: '#3498db' }} />
            <span style={{ fontWeight: '600' }}>EduConnect</span>
          </Link>
          
          <div className="d-flex align-items-center">
            <div className="input-group mx-3" style={{ width: '300px' }}>
              <span className="input-group-text bg-white border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search..." 
                style={{ boxShadow: 'none' }}
              />
            </div>
            
            <button className="btn position-relative mx-2" style={{ color: '#fff' }}>
              <FaBell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            
            <div className="dropdown">
              <button className="btn rounded-circle" style={{ color: '#fff' }} data-bs-toggle="dropdown">
                <FaUserCircle size={24} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><h6 className="dropdown-header">Instructor Dashboard</h6></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item text-danger" to="/logout">Logout</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-md-2 p-0 bg-white" style={{ minHeight: 'calc(100vh - 56px)', boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}>
            <div className="d-flex flex-column p-3">
              <ul className="nav nav-pills flex-column mb-auto">
                {navItems.map((item) => (
                  <li className="nav-item mb-2" key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link rounded-pill d-flex align-items-center ${
                        currentPath === item.path 
                          ? 'active' 
                          : 'text-dark'
                      }`}
                      style={currentPath === item.path ? { backgroundColor: '#3498db' } : {}}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-md-10 py-4 px-4">
            <Outlet />
            
            {currentPath === '/tutor-dashboard' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 style={{ color: '#2c3e50', fontWeight: '600' }}>Instructor Dashboard</h2>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #3498db' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-muted mb-1">Upcoming Classes</h6>
                            <h3 style={{ color: '#2c3e50' }}>{upcomingClasses.length}</h3>
                          </div>
                          <FaVideo size={28} style={{ color: '#3498db' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #2ecc71' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-muted mb-1">Assignments</h6>
                            <h3 style={{ color: '#2c3e50' }}>{assignments.length}</h3>
                          </div>
                          <FaBook size={28} style={{ color: '#2ecc71' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #9b59b6' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-muted mb-1">Students</h6>
                            <h3 style={{ color: '#2c3e50' }}>{students.length}</h3>
                          </div>
                          <FaUserGraduate size={28} style={{ color: '#9b59b6' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <Link to="/tutor-dashboard/classes" className="card text-decoration-none">
                      <div className="card-body text-center">
                        <FaVideo size={48} className="text-primary mb-3" />
                        <h5>Manage Classes</h5>
                        <p className="text-muted">View and schedule upcoming classes</p>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-4">
                    <Link to="/tutor-dashboard/assignments" className="card text-decoration-none">
                      <div className="card-body text-center">
                        <FaBook size={48} className="text-success mb-3" />
                        <h5>Assignments</h5>
                        <p className="text-muted">Create and grade student work</p>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-4">
                    <Link to="/tutor-dashboard/students" className="card text-decoration-none">
                      <div className="card-body text-center">
                        <FaUserGraduate size={48} className="text-warning mb-3" />
                        <h5>Students</h5>
                        <p className="text-muted">View and manage your students</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
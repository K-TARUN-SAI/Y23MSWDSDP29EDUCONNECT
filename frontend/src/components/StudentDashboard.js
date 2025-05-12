import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaChalkboardTeacher, FaVideo, FaBook, FaCalendarAlt, FaUsers,
  FaBell, FaSearch, FaUserCircle, FaFileUpload, FaChartLine,
  FaCheckCircle, FaClock, FaTimesCircle
} from 'react-icons/fa';
import { BsGraphUp } from 'react-icons/bs';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch student's upcoming classes
        const classesRes = await axios.get(`${API_BASE_URL}/api/classes/student/${user._id}`);
        // Combine enrolledClasses and availableClasses arrays into one array for upcomingClasses
        setUpcomingClasses([...classesRes.data.enrolledClasses, ...classesRes.data.availableClasses]);

        // Fetch student's assignments
        // const assignmentsRes = await axios.get(`${API_BASE_URL}/api/assignments/student/${user._id}`);
        // setAssignments(assignmentsRes.data);

        // // Fetch student's attendance
        // const attendanceRes = await axios.get(`${API_BASE_URL}/api/attendance/student/${user._id}`);
        // setAttendance(attendanceRes.data);

        // // Fetch notifications
        // const notificationsRes = await axios.get(`${API_BASE_URL}/api/notifications/student/${user._id}`);
        // setNotifications(notificationsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const joinVideoConference = async (meetingId) => {
    try {
      // Verify the student has access to this meeting
      const response = await axios.get(`/api/classes/verify-access/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.hasAccess) {
        navigate(`/student-dashboard/video-conference/${meetingId}`);
      } else {
        alert('You do not have access to this class meeting');
      }
    } catch (error) {
      console.error('Error verifying meeting access:', error);
      alert('Could not verify meeting access. Please try again.');
    }
  };

  const enrollStudent = async (classId) => {
    try {
      const response = await axios.post(`/api/classes/${classId}/add-student`, {
        studentId: user._id
      });
      alert('Enrolled successfully!');
      // Refresh classes list
      const classesRes = await axios.get(`/api/classes/student/${user._id}`);
      setUpcomingClasses([...classesRes.data.enrolledClasses, ...classesRes.data.availableClasses]);
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Failed to enroll in class. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <FaCheckCircle className="text-success" />;
      case 'late': return <FaClock className="text-warning" />;
      case 'absent': return <FaTimesCircle className="text-danger" />;
      default: return null;
    }
  };

  const currentPath = location.pathname;

  const navItems = [
    {
      path: '/student-dashboard',
      icon: <BsGraphUp className="me-2" />,
      label: 'Dashboard'
    },
    {
      path: '/student-dashboard/classes',
      icon: <FaVideo className="me-2" />,
      label: 'Classes'
    },
    {
      path: '/student-assignments',
      icon: <FaBook className="me-2" />,
      label: 'Assignments'
    },
    {
      path: '/student-attendance',
      icon: <FaCalendarAlt className="me-2" />,
      label: 'Attendance'
    }
  ];

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#2c3e50' }}>
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/student-dashboard">
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
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <div className="dropdown">
              <button className="btn rounded-circle" style={{ color: '#fff' }} data-bs-toggle="dropdown">
                <FaUserCircle size={24} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><h6 className="dropdown-header">Student Dashboard</h6></li>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ color: '#2c3e50', fontWeight: '600' }}>Student Dashboard</h2>
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
                        <h6 className="text-muted mb-1">Pending Assignments</h6>
                        <h3 style={{ color: '#2c3e50' }}>{assignments.filter(a => a.status === 'pending').length}</h3>
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
                        <h6 className="text-muted mb-1">Attendance</h6>
                        <h3 style={{ color: '#2c3e50' }}>{attendance.present}%</h3>
                      </div>
                      <FaUsers size={28} style={{ color: '#9b59b6' }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #f1c40f' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">Current Streak</h6>
                        <h3 style={{ color: '#2c3e50' }}>{attendance.streak} days</h3>
                      </div>
                      <FaChartLine size={28} style={{ color: '#f1c40f' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Classes */}
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 style={{ color: '#2c3e50', fontWeight: '600' }}>Upcoming Classes</h5>
                  </div>
                  <div className="card-body p-0">
                    {upcomingClasses.map(cls => (
                      <div key={cls._id} className="d-flex align-items-center p-3 border-bottom">
                        <div className="flex-grow-1">
                          <h6 className="mb-1" style={{ color: '#2c3e50' }}>{cls.title}</h6>
                          <small className="text-muted d-block">
                            {new Date(cls.schedule).toLocaleString()} • {cls.instructor?.name || 'Tutor'}
                          </small>
                        </div>
                    <button 
                      className="btn btn-sm"
                      style={{ backgroundColor: '#3498db', color: '#fff' }}
                      onClick={() => joinVideoConference(cls.meetingId)}
                      disabled={new Date(cls.schedule) > new Date()}
                    >
                      {new Date(cls.schedule) > new Date() ? 'Not Started Yet' : 'Join Class'}
                    </button>
                    {!cls.students?.includes(user._id) && (
                      <button
                        className="btn btn-sm ms-2"
                        style={{ backgroundColor: '#2ecc71', color: '#fff' }}
                        onClick={() => enrollStudent(cls._id)}
                      >
                        Enroll
                      </button>
                    )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 style={{ color: '#2c3e50', fontWeight: '600' }}>Recent Assignments</h5>
                  </div>
                  <div className="card-body">
                    {assignments.map(assignment => (
                      <div key={assignment._id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1" style={{ color: '#2c3e50' }}>{assignment.title}</h6>
                            <small className="text-muted">{assignment.course?.name || 'Course'}</small>
                          </div>
                          {assignment.status === 'submitted' ? (
                            <span className="badge" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>
                              {assignment.grade || 'Submitted'}
                            </span>
                          ) : (
                            <small className="text-muted">
                              {assignment.progress}% complete
                            </small>
                          )}
                        </div>
                        <small className="text-muted d-block mt-1">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </small>
                        {assignment.status === 'pending' && (
                          <div className="progress mt-2" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${assignment.progress}%`, backgroundColor: '#3498db' }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="row">
              <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 style={{ color: '#2c3e50', fontWeight: '600' }}>Attendance Overview</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-around text-center mb-4">
                      <div>
                        <h4 style={{ color: '#2ecc71' }}>{attendance.present}%</h4>
                        <small className="text-muted">Present</small>
                      </div>
                      <div>
                        <h4 style={{ color: '#f39c12' }}>{attendance.late}%</h4>
                        <small className="text-muted">Late</small>
                      </div>
                      <div>
                        <h4 style={{ color: '#e74c3c' }}>{attendance.absent}%</h4>
                        <small className="text-muted">Absent</small>
                      </div>
                    </div>
                    <div className="bg-light rounded" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f8c8d' }}>
                      Attendance Chart Visualization
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h5 style={{ color: '#2c3e50', fontWeight: '600' }}>Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <button 
                      className="btn w-100 mb-3 text-start d-flex align-items-center p-2 rounded" 
                      style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}
                      onClick={() => {
                        const nextClass = upcomingClasses.find(cls => new Date(cls.schedule) >= new Date());
                        if (nextClass) {
                          joinVideoConference(nextClass.meetingId);
                        }
                      }}
                    >
                      <FaVideo className="me-3" />
                      Join Next Class
                    </button>
                    <button 
                      className="btn w-100 mb-3 text-start d-flex align-items-center p-2 rounded" 
                      style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}
                    >
                      <FaBook className="me-3" />
                      Submit Assignment
                    </button>
                    <button 
                      className="btn w-100 text-start d-flex align-items-center p-2 rounded" 
                      style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }}
                    >
                      <FaCalendarAlt className="me-3" />
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
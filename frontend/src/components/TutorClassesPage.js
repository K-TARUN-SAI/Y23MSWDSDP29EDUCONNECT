import React, { useState, useEffect } from 'react';
import { FaVideo, FaPlus, FaEdit, FaTrash, FaClock, FaChalkboardTeacher } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TutorClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    subject: '',
    schedule: '',
    duration: 60,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`/api/classes/tutor/${user._id}`);
        setClasses(response.data);
      } catch (error) {
        toast.error('Failed to fetch classes');
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [user._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateClass = async () => {
    try {
      setLoading(true);
      const meetingId = `meet-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
      
      const response = await axios.post('/api/classes', {
        ...newClass,
        tutorId: user._id,
        meetingId
      });

      setClasses([...classes, response.data]);
      setShowModal(false);
      setNewClass({
        title: '',
        subject: '',
        schedule: '',
        duration: 60,
        description: ''
      });
      toast.success('Class created successfully!');
    } catch (error) {
      toast.error('Failed to create class');
      console.error('Error creating class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/classes/${editingClass._id}`, {
        ...newClass,
        tutorId: user._id
      });

      setClasses(classes.map(cls => 
        cls._id === editingClass._id ? response.data : cls
      ));
      setShowModal(false);
      setEditingClass(null);
      setNewClass({
        title: '',
        subject: '',
        schedule: '',
        duration: 60,
        description: ''
      });
      toast.success('Class updated successfully!');
    } catch (error) {
      toast.error('Failed to update class');
      console.error('Error updating class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`/api/classes/${classId}`);
        setClasses(classes.filter(cls => cls._id !== classId));
        toast.success('Class deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete class');
        console.error('Error deleting class:', error);
      }
    }
  };

  const startVideoConference = (meetingId) => {
    navigate(`/tutor-dashboard/video-conference/${meetingId}`);
  };

  const handleEditClick = (classItem) => {
    setEditingClass(classItem);
    setNewClass({
      title: classItem.title,
      subject: classItem.subject,
      schedule: classItem.schedule,
      duration: classItem.duration,
      description: classItem.description || ''
    });
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#2c3e50', fontWeight: '600' }}>My Classes</h2>
        <button 
          className="btn d-flex align-items-center" 
          style={{ backgroundColor: '#3498db', color: '#fff' }}
          onClick={() => {
            setEditingClass(null);
            setNewClass({
              title: '',
              subject: '',
              schedule: '',
              duration: 60,
              description: ''
            });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          New Class
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {classes.length === 0 ? (
            <div className="text-center p-5">
              <FaChalkboardTeacher size={48} className="text-muted mb-3" />
              <h4>No Classes Scheduled</h4>
              <p className="text-muted">Create your first class to get started</p>
              <button 
                className="btn mt-3" 
                style={{ backgroundColor: '#3498db', color: '#fff' }}
                onClick={() => setShowModal(true)}
              >
                <FaPlus className="me-2" />
                Create Class
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cls => (
                    <tr key={cls._id}>
                      <td>{cls.title}</td>
                      <td>{cls.subject}</td>
                      <td>
                        {new Date(cls.schedule).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>{cls.duration} minutes</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm"
                            style={{ backgroundColor: '#3498db', color: '#fff' }}
                            onClick={() => startVideoConference(cls.meetingId)}
                          >
                            <FaVideo className="me-1" />
                            Start
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditClick(cls)}
                          >
                            <FaEdit className="me-1" />
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClass(cls._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Class Modal */}
      {showModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingClass(null);
                  }}
                  disabled={loading}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Class Title*</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="title"
                      value={newClass.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Subject*</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="subject"
                      value={newClass.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date & Time*</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      name="schedule"
                      value={newClass.schedule}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Duration (minutes)*</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="duration"
                      min="30"
                      value={newClass.duration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    name="description"
                    value={newClass.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingClass(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ backgroundColor: '#3498db', color: '#fff' }}
                  onClick={editingClass ? handleUpdateClass : handleCreateClass}
                  disabled={loading || !newClass.title || !newClass.subject || !newClass.schedule}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : editingClass ? (
                    'Update Class'
                  ) : (
                    'Create Class'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorClassesPage;
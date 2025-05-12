import React, { useState, useEffect } from 'react';
import { FaVideo, FaClock, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentClassesPage = () => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // Fetch enrolled classes
        const enrolledRes = await axios.get(`/api/classes/student/${user._id}`);
        // Set enrolledClasses to the enrolledClasses array from response data
        setEnrolledClasses(enrolledRes.data.enrolledClasses);

        // Fetch available classes (not enrolled)
        const availableRes = await axios.get('/api/classes/available');
        setAvailableClasses(availableRes.data);
      } catch (error) {
        toast.error('Failed to fetch classes');
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user._id]);

  const joinVideoConference = (meetingId) => {
    navigate(`/student-dashboard/video-conference/${meetingId}`);
  };

  const handleEnroll = async (classId) => {
    try {
      setLoading(true);
      await axios.post(`/api/classes/${classId}/enroll`, { studentId: user._id });
      
      // Refresh both lists
      const enrolledRes = await axios.get(`/api/classes/student/${user._id}`);
      // Set enrolledClasses to the enrolledClasses array from response data
      setEnrolledClasses(enrolledRes.data.enrolledClasses);
      
      const availableRes = await axios.get('/api/classes/available');
      setAvailableClasses(availableRes.data);
      
      toast.success('Successfully enrolled in class!');
      setShowEnrollModal(false);
    } catch (error) {
      toast.error('Failed to enroll in class');
      console.error('Error enrolling:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString([], options);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#2c3e50', fontWeight: '600' }}>My Classes</h2>
      </div>

      {/* Enrolled Classes Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0">
          <h5 style={{ color: '#2c3e50', fontWeight: '600' }}>Enrolled Classes</h5>
        </div>
        <div className="card-body p-0">
          {enrolledClasses.length === 0 ? (
            <div className="text-center p-5">
              <FaChalkboardTeacher size={48} className="text-muted mb-3" />
              <h5>Not Enrolled in Any Classes</h5>
              <p className="text-muted">Browse available classes below to enroll</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Tutor</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledClasses.map(cls => (
                    <tr key={cls._id}>
                      <td>
                        <strong>{cls.title}</strong>
                        <div className="text-muted small">{cls.subject}</div>
                      </td>
                      <td>
                        <FaUserTie className="me-2" />
                        {cls.tutor?.name || 'Tutor'}
                      </td>
                      <td>
                        {formatDateTime(cls.schedule)}
                        <div className="text-muted small">
                          {cls.duration} minutes
                        </div>
                      </td>
                      <td>
                        {new Date(cls.schedule) > new Date() ? (
                          <span className="badge bg-warning text-dark">
                            <FaClock className="me-1" />
                            Upcoming
                          </span>
                        ) : (
                          <span className="badge bg-success">
                            <FaVideo className="me-1" />
                            Active
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: '#3498db', color: '#fff' }}
                          onClick={() => joinVideoConference(cls.meetingId)}
                          disabled={new Date(cls.schedule) > new Date()}
                        >
                          {new Date(cls.schedule) > new Date() ? 'Starts Soon' : 'Join Class'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Available Classes Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0">
          <h5 style={{ color: '#2c3e50', fontWeight: '600' }}>Available Classes</h5>
        </div>
        <div className="card-body p-0">
          {availableClasses.length === 0 ? (
            <div className="text-center p-5">
              <FaChalkboardTeacher size={48} className="text-muted mb-3" />
              <h5>No Available Classes</h5>
              <p className="text-muted">Check back later for new classes</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Tutor</th>
                    <th>Schedule</th>
                    <th>Seats</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableClasses.map(cls => (
                    <tr key={cls._id}>
                      <td>
                        <strong>{cls.title}</strong>
                        <div className="text-muted small">{cls.subject}</div>
                      </td>
                      <td>
                        <FaUserTie className="me-2" />
                        {cls.tutor?.name || 'Tutor'}
                      </td>
                      <td>
                        {formatDateTime(cls.schedule)}
                        <div className="text-muted small">
                          {cls.duration} minutes
                        </div>
                      </td>
                      <td>
                        {cls.maxStudents - cls.students.length} remaining
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: '#2ecc71', color: '#fff' }}
                          onClick={() => {
                            setSelectedClass(cls);
                            setShowEnrollModal(true);
                          }}
                        >
                          Enroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enroll Confirmation Modal */}
      {showEnrollModal && selectedClass && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Enrollment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEnrollModal(false)}
                  disabled={loading}
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to enroll in <strong>{selectedClass.title}</strong>?
                </p>
                <ul className="list-unstyled">
                  <li>
                    <FaUserTie className="me-2" />
                    Tutor: {selectedClass.tutor?.name || 'Not specified'}
                  </li>
                  <li>
                    <FaClock className="me-2" />
                    {formatDateTime(selectedClass.schedule)} ({selectedClass.duration} mins)
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEnrollModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#2ecc71', color: '#fff' }}
                  onClick={() => handleEnroll(selectedClass._id)}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : (
                    'Confirm Enrollment'
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

export default StudentClassesPage;
import React, { useState, useEffect } from 'react';
import { 
  FaBook, FaFileUpload, FaCalendarAlt, FaSearch, FaFilter, 
  FaUserGraduate, FaEdit, FaSpinner, FaTimes, FaCheck 
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TutorAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    class: '',
    description: '',
    dueDate: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      console.log('TutorAssignmentsPage - User:', user);
      console.log('TutorAssignmentsPage - Token:', token);
      if (!user || !token) {
        toast.error('User not authenticated');
        setLoading(false);
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const [assignmentsRes, classesRes] = await Promise.all([
        axios.get('/api/assignments/tutor', config),
        axios.get(`/api/classes/tutor/${user._id}`, config)
      ]);
      console.log('TutorAssignmentsPage - Assignments response:', assignmentsRes);
      console.log('TutorAssignmentsPage - Classes response:', classesRes);
      setAssignments(assignmentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('TutorAssignmentsPage - Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Filter by search term
    if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Filter by grading status
    if (filter === 'graded') {
      return assignment.submissions.every(sub => sub.grade);
    }
    if (filter === 'ungraded') {
      return assignment.submissions.some(sub => !sub.grade);
    }
    return true;
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleCreateAssignment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('dueDate', newAssignment.dueDate);
      formData.append('classId', newAssignment.class);
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const res = await axios.post('/api/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setAssignments([...assignments, res.data]);
      setShowCreateModal(false);
      setNewAssignment({
        title: '',
        class: '',
        description: '',
        dueDate: ''
      });
      setFiles([]);
      toast.success('Assignment created successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create assignment');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (assignmentId, submissionId, currentGrade, currentComments) => {
    try {
      setGrading(submissionId);
      const grade = prompt("Enter grade:", currentGrade || '');
      if (grade === null) return;
      
      const comments = prompt("Enter comments:", currentComments || '');
      
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/assignments/${assignmentId}/grade/${submissionId}`, {
        grade,
        comments
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAssignments(assignments.map(a => 
        a._id === assignmentId ? res.data : a
      ));
      toast.success('Grade updated successfully');
    } catch (error) {
      toast.error('Failed to update grade');
      console.error('Error:', error);
    } finally {
      setGrading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'text-danger';
    if (['doc', 'docx'].includes(ext)) return 'text-primary';
    if (['ppt', 'pptx'].includes(ext)) return 'text-warning';
    if (['xls', 'xlsx'].includes(ext)) return 'text-success';
    return 'text-secondary';
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaBook className="me-2 text-primary" />
          Manage Assignments
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
        >
          <FaFileUpload className="me-2" />
          Create Assignment
        </button>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaFilter />
            </span>
            <select
              className="form-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Assignments</option>
              <option value="graded">Fully Graded</option>
              <option value="ungraded">Pending Grading</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="fa-spin me-2" size={24} />
          <span>Loading assignments...</span>
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="row">
          {filteredAssignments.map(assignment => (
            <div key={assignment._id} className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{assignment.title}</h5>
                    <small className="text-muted">
                      {assignment.class?.title} • Due: {formatDate(assignment.dueDate)}
                    </small>
                  </div>
                  <span className={`badge ${assignment.submissions.length === 0 ? 'bg-secondary' : 
                    assignment.submissions.every(s => s.grade) ? 'bg-success' : 'bg-warning'}`}>
                    {assignment.submissions.length} submission{assignment.submissions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-text">{assignment.description}</p>
                  
                  {/* Assignment Materials */}
                  {assignment.attachments.length > 0 && (
                    <div className="mb-4">
                      <h6 className="d-flex align-items-center">
                        <FaFileUpload className="me-2" />
                        Assignment Materials
                      </h6>
                      <div className="list-group">
                          {assignment.attachments.map((file, index) => (
                            <a 
                              key={index}
                              href={file.startsWith('uploads/') ? `/${file}` : `/uploads/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="list-group-item list-group-item-action d-flex align-items-center"
                            >
                              <span className={`me-2 ${getFileIcon(file)}`}>
                                <FaFileUpload />
                              </span>
                              {file.split('/').pop()}
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Submissions */}
                  <div className="mb-3">
                    <h6 className="d-flex align-items-center">
                      <FaUserGraduate className="me-2" />
                      Student Submissions
                    </h6>
                    {assignment.submissions.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Submission</th>
                              <th>Submitted</th>
                              <th>Grade</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignment.submissions.map(submission => (
                              <tr key={submission._id}>
                                <td>{submission.student?.name || 'Student'}</td>
                                <td>
                                  <a 
                                    href={`/uploads/${submission.file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                  >
                                    {submission.file.split('/').pop()}
                                  </a>
                                </td>
                                <td>{formatDate(submission.submittedAt)}</td>
                                <td>
                                  {submission.grade ? (
                                    <span className="badge bg-success">{submission.grade}</span>
                                  ) : (
                                    <span className="badge bg-warning text-dark">Pending</span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleGradeSubmission(
                                      assignment._id,
                                      submission._id,
                                      submission.grade,
                                      submission.comments
                                    )}
                                    disabled={grading === submission._id}
                                  >
                                    {grading === submission._id ? (
                                      <FaSpinner className="fa-spin me-1" />
                                    ) : (
                                      <FaEdit className="me-1" />
                                    )}
                                    {submission.grade ? 'Update' : 'Grade'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-info mb-0">
                        No submissions yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <h4 className="text-muted">No assignments found</h4>
          <p>Try adjusting your filters or create a new assignment</p>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Assignment</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title*</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Class*</label>
                  <select
                    className="form-select"
                    value={newAssignment.class}
                    onChange={(e) => setNewAssignment({...newAssignment, class: e.target.value})}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.title} ({cls.subject})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Due Date*</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Attachments</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    multiple
                    onChange={handleFileChange}
                  />
                  {files.length > 0 && (
                    <div className="mt-2">
                      <h6>Selected Files:</h6>
                      <ul className="list-group">
                        {files.map((file, index) => (
                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <FaFileUpload className={`me-2 ${getFileIcon(file.name)}`} />
                              {file.name}
                            </span>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFile(index)}
                            >
                              <FaTimes />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleCreateAssignment}
                  disabled={loading || !newAssignment.title || !newAssignment.class || !newAssignment.dueDate}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="fa-spin me-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="me-2" />
                      Create Assignment
                    </>
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

export default TutorAssignmentsPage;
import React, { useState, useEffect } from 'react';
import { 
  FaBook, FaFileUpload, FaCalendarAlt, FaSpinner, 
  FaCheck, FaTimes, FaFileDownload, FaUserTie 
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.get('/api/assignments/student', config);
      setAssignments(res.data);
    } catch (error) {
      toast.error('Failed to fetch assignments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }

    try {
      setSubmitting(assignmentId);
      const formData = new FormData();
      formData.append('submission', file);

      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setAssignments(assignments.map(a => 
        a._id === assignmentId ? res.data : a
      ));
      setFile(null);
      document.getElementById(`file-input-${assignmentId}`).value = '';
      toast.success('Assignment submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assignment');
      console.error('Error:', error);
    } finally {
      setSubmitting(null);
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
    if (!filename) return 'text-secondary';
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'text-danger';
    if (['doc', 'docx'].includes(ext)) return 'text-primary';
    if (['ppt', 'pptx'].includes(ext)) return 'text-warning';
    if (['xls', 'xlsx'].includes(ext)) return 'text-success';
    return 'text-secondary';
  };

  const getStatusBadge = (assignment, submission) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (submission) {
      return submission.grade ? (
        <span className="badge bg-success">Graded: {submission.grade}</span>
      ) : (
        <span className="badge bg-info">Submitted</span>
      );
    } else if (now > dueDate) {
      return <span className="badge bg-danger">Past Due</span>;
    } else {
      return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaBook className="me-2 text-primary" />
          My Assignments
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="fa-spin me-2" size={24} />
          <span>Loading assignments...</span>
        </div>
      ) : assignments.length > 0 ? (
        <div className="row">
          {assignments.map(assignment => {
            const submission = assignment.submissions.find(
              sub => sub.student._id === JSON.parse(localStorage.getItem('user'))._id
            );
            const isPastDue = new Date() > new Date(assignment.dueDate);
            
            return (
              <div key={assignment._id} className="col-md-6 mb-4">
                <div className={`card h-100 shadow-sm ${isPastDue && !submission ? 'border-danger' : ''}`}>
                  <div className="card-header bg-white">
                    <h5 className="mb-1">{assignment.title}</h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <FaUserTie className="me-1" />
                        {assignment.tutor?.name}
                      </small>
                      {getStatusBadge(assignment, submission)}
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{assignment.description}</p>
                    
                    {/* Assignment Materials */}
                    {assignment.attachments.length > 0 && (
                      <div className="mb-4">
                        <h6 className="d-flex align-items-center">
                          <FaFileDownload className="me-2" />
                          Assignment Files
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
                                <FaFileDownload />
                              </span>
                              {file.split('/').pop()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission Section */}
                    <div className="mb-3">
                      <h6 className="d-flex align-items-center">
                        <FaFileUpload className="me-2" />
                        Your Submission
                      </h6>
                      {submission ? (
                        <div className="card bg-light">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <strong>Submitted File:</strong>
                            <a 
                              href={submission.file && submission.file.startsWith('uploads/') ? `/${submission.file}` : `/uploads/${submission.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              <FaFileDownload className="me-1" />
                              Download
                            </a>
                            </div>
                            <div className="mb-2">
                              <small className="text-muted">
                                Submitted on: {formatDate(submission.submittedAt)}
                              </small>
                            </div>
                            {submission.grade && (
                              <div className="alert alert-success mb-0">
                                <strong>Grade:</strong> {submission.grade}
                                {submission.comments && (
                                  <div className="mt-2">
                                    <strong>Feedback:</strong>
                                    <p className="mb-0">{submission.comments}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="card bg-light">
                          <div className="card-body">
                            {isPastDue ? (
                              <div className="alert alert-danger mb-0">
                                This assignment is past the due date
                              </div>
                            ) : (
                              <>
                                <div className="mb-3">
                                  <input
                                    id={`file-input-${assignment._id}`}
                                    type="file"
                                    className="form-control"
                                    onChange={handleFileChange}
                                  />
                                </div>
                                <button
                                  className="btn btn-primary w-100"
                                  onClick={() => handleSubmitAssignment(assignment._id)}
                                  disabled={!file || submitting === assignment._id}
                                >
                                  {submitting === assignment._id ? (
                                    <>
                                      <FaSpinner className="fa-spin me-2" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <FaCheck className="me-2" />
                                      Submit Assignment
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <FaCalendarAlt className="me-1" />
                        Due: {formatDate(assignment.dueDate)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5">
          <h4 className="text-muted">No assignments found</h4>
          <p>You don't have any assignments yet</p>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;
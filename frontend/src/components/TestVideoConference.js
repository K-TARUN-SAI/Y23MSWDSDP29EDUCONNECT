import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestVideoConference = () => {
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState('tutor');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId) {
      // Store role in localStorage temporarily
      localStorage.setItem('user', JSON.stringify({ 
        _id: `${role}-${Date.now()}`,
        role 
      }));
      
      navigate(`/video-conference/${roomId}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="mb-4">Test Video Conference</h3>
              
              <div className="mb-3">
                <label className="form-label">Room ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter any room name"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select 
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="tutor">Tutor</option>
                  <option value="student">Student</option>
                </select>
              </div>
              
              <button 
                className="btn btn-primary w-100"
                onClick={handleJoin}
              >
                Join Video Conference
              </button>
              
              <div className="mt-3 text-muted">
                <small>
                  <strong>Test instructions:</strong><br/>
                  1. Open this page in two browser tabs/windows<br/>
                  2. Set one as "tutor" and one as "student"<br/>
                  3. Use the same Room ID for both<br/>
                  4. Click Join on both
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestVideoConference;
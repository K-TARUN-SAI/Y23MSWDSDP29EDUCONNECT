import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import '../css/VideoConferencePage.css';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaPhone, 
  FaUser,
  FaExpand,
  FaCompress,
  FaUserTie,
  FaUserGraduate,
  FaInfoCircle,
  FaCog,
  FaUsers,
  FaKey
} from 'react-icons/fa';
import { Tooltip, OverlayTrigger, Toast, ToastContainer } from 'react-bootstrap';

const VideoConferencePage = () => {
  const [user, setUser] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [showRoomToast, setShowRoomToast] = useState(true);
  
  const userVideoRef = useRef();
  const containerRef = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef();
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    console.log('Socket connection token:', token);
    setUser(userData);
    setError(null);

    // Initialize socket connection with auth token
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError('Socket connection failed: ' + err.message);
    });

    // Get user media
    navigator.mediaDevices.getUserMedia({ 
      video: { width: 1280, height: 720 },
      audio: true 
    })
      .then(currentStream => {
        setStream(currentStream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = currentStream;
        }

        // Join the room
        socketRef.current.emit('join-room', roomId, userData._id);

        // Handle new user connections
        socketRef.current.on('user-connected', userId => {
          const peer = createPeer(userId, socketRef.current.id, currentStream);
          peersRef.current.push({
            peerId: userId,
            peer,
          });
          setParticipantCount(prev => prev + 1);
        });

        // Handle incoming calls
        socketRef.current.on('user-joined', (signal, callerId) => {
          const peer = addPeer(signal, callerId, currentStream);
          peersRef.current.push({
            peerId: callerId,
            peer,
          });
          setParticipantCount(prev => prev + 1);
        });

        // Handle receiving signals
        socketRef.current.on('signal', signal => {
          const item = peersRef.current.find(p => p.peerId === signal.id);
          if (item) item.peer.signal(signal.data);
        });

        // Handle user disconnections
        socketRef.current.on('user-disconnected', userId => {
          const peerObj = peersRef.current.find(p => p.peerId === userId);
          if (peerObj) peerObj.peer.destroy();
          peersRef.current = peersRef.current.filter(p => p.peerId !== userId);
          setPeers(peersRef.current);
          setParticipantCount(prev => prev - 1);
        });

        // Handle participant count updates
        socketRef.current.on('participant-count', count => {
          setParticipantCount(count);
        });

        // Simulate connection quality monitoring
        const qualityInterval = setInterval(() => {
          const qualities = ['excellent', 'good', 'fair', 'poor'];
          setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        }, 10000);

        return () => clearInterval(qualityInterval);
      })
      .catch(err => {
        console.error('Failed to get media devices:', err);
        setError('Failed to access camera/microphone. Please check permissions and try again.');
      });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(peerObj => {
        if (peerObj.peer) peerObj.peer.destroy();
      });
    };
  }, [roomId]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add your TURN servers here if needed
        ]
      }
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', { userToSignal, callerId, signal });
    });

    peer.on('stream', remoteStream => {
      setPeers(prev => [...prev, { peerId: callerId, stream: remoteStream }]);
    });

    peer.on('error', err => {
      console.error('Peer connection error:', err);
      setConnectionQuality('poor');
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add your TURN servers here if needed
        ]
      }
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', { signal, callerId: socketRef.current.id, userToSignal: callerId });
    });

    peer.on('stream', remoteStream => {
      setPeers(prev => [...prev, { peerId: callerId, stream: remoteStream }]);
    });

    peer.on('error', err => {
      console.error('Peer connection error:', err);
      setConnectionQuality('poor');
    });

    peer.signal(incomingSignal);

    return peer;
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const leaveMeeting = () => {
    if (window.confirm('Are you sure you want to leave the meeting?')) {
      navigate(user?.role === 'tutor' ? '/tutor-dashboard' : '/student-dashboard');
    }
  };

  const renderParticipantIcon = () => {
    return user?.role === 'tutor' ? (
      <FaUserTie className="ms-2" size={14} title="Tutor" />
    ) : (
      <FaUserGraduate className="ms-2" size={14} title="Student" />
    );
  };

  const getConnectionQualityColor = () => {
    switch(connectionQuality) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'danger';
      default: return 'secondary';
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setShowRoomToast(true);
    setTimeout(() => setShowRoomToast(false), 3000);
  };

  if (error) {
    return (
      <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
        <div className="alert alert-danger text-center w-75">
          <FaInfoCircle className="me-2" />
          {error}
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div 
      className="video-conference-container bg-dark text-light" 
      ref={containerRef}
    >
      {/* Header Bar */}
      <div className="header-bar bg-dark bg-opacity-95 p-2 d-flex justify-content-between align-items-center border-bottom border-secondary">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center badge bg-dark border border-secondary text-white">
            <FaUsers className="me-2" size={12} />
            <span>{participantCount + 1}</span>
          </div>
          
          <div className="d-flex align-items-center">
            <span className="text-muted me-1">Room:</span>
            <span className="text-white fw-bold">{roomId}</span>
            <button 
              className="btn btn-sm btn-link text-primary p-0 ms-2"
              onClick={copyRoomId}
              title="Copy room ID"
            >
              <FaKey size={12} />
            </button>
          </div>
          
          <div className={`connection-indicator ${connectionQuality}`}>
            <div className="indicator-dot"></div>
            <span className="ms-2">{connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}</span>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <span className="text-white">
            {user?.name}
            {renderParticipantIcon()}
          </span>
          
          <div className="d-flex gap-2">
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</Tooltip>}
            >
              <button 
                className="btn btn-sm btn-outline-light rounded-circle p-1 d-flex align-items-center justify-content-center"
                onClick={toggleFullscreen}
                style={{ width: '32px', height: '32px' }}
              >
                {fullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
              </button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Settings</Tooltip>}
            >
              <button 
                className="btn btn-sm btn-outline-light rounded-circle p-1 d-flex align-items-center justify-content-center"
                onClick={() => setShowSettings(!showSettings)}
                style={{ width: '32px', height: '32px' }}
              >
                <FaCog size={14} />
              </button>
            </OverlayTrigger>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel bg-dark bg-opacity-95 p-3 border-bottom border-secondary">
          <div className="container">
            <h5 className="text-white mb-3">Meeting Settings</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="form-check form-switch mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="videoToggle" 
                    checked={videoEnabled}
                    onChange={toggleVideo}
                  />
                  <label className="form-check-label text-white" htmlFor="videoToggle">
                    Camera {videoEnabled ? 'On' : 'Off'}
                  </label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="audioToggle" 
                    checked={audioEnabled}
                    onChange={toggleAudio}
                  />
                  <label className="form-check-label text-white" htmlFor="audioToggle">
                    Microphone {audioEnabled ? 'On' : 'Off'}
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text-white mb-3">
                  <strong>Connection Quality:</strong> 
                  <span className={`text-${getConnectionQualityColor()} ms-2`}>
                    {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
                  </span>
                </div>
                <div className="text-white">
                  <strong>Participants:</strong> {participantCount + 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="video-grid-container">
        {peers.length === 0 ? (
          <div className="single-video-view">
            <div className="video-tile main-tile">
              <div className="video-container">
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`video-element ${!videoEnabled ? 'video-disabled' : ''}`}
                />
                <div className="video-overlay">
                  <span className="participant-name">
                    You {renderParticipantIcon()}
                  </span>
                  {!videoEnabled && (
                    <div className="video-off-indicator">
                      <FaUser size={48} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="welcome-message text-center">
              <h4 className="text-white"></h4>
              <p className="text-muted">Share this room ID with participants</p>
              <button 
                className="btn btn-outline-light mt-2"
                onClick={copyRoomId}
              >
                <FaKey className="me-2" />
                Copy Room ID
              </button>
            </div>
          </div>
        ) : (
          <div className={`video-grid ${peers.length > 3 ? 'grid-lg' : ''}`}>
            {/* Local Video */}
            <div className={`video-tile ${peers.length === 0 ? 'main-tile' : ''}`}>
              <div className="video-container">
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`video-element ${!videoEnabled ? 'video-disabled' : ''}`}
                />
                <div className="video-overlay">
                  <span className="participant-name">
                    You {renderParticipantIcon()}
                  </span>
                  {!videoEnabled && (
                    <div className="video-off-indicator">
                      <FaUser size={48} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Remote Videos */}
            {peers.map((peer, index) => (
              <div className="video-tile" key={peer.peerId}>
                <VideoComponent 
                  stream={peer.stream} 
                  number={index + 1}
                  role={peer.peerId.includes('tutor') ? 'tutor' : 'student'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls-bar bg-dark bg-opacity-95 p-3 border-top border-secondary">
        <div className="d-flex justify-content-center align-items-center gap-4">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{videoEnabled ? 'Turn off camera' : 'Turn on camera'}</Tooltip>}
          >
            <button
              className={`btn btn-control rounded-circle ${videoEnabled ? 'btn-primary' : 'btn-dark border'}`}
              onClick={toggleVideo}
            >
              {videoEnabled ? <FaVideo size={18} /> : <FaVideoSlash size={18} />}
            </button>
          </OverlayTrigger>
          
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{audioEnabled ? 'Mute microphone' : 'Unmute microphone'}</Tooltip>}
          >
            <button
              className={`btn btn-control rounded-circle ${audioEnabled ? 'btn-primary' : 'btn-dark border'}`}
              onClick={toggleAudio}
            >
              {audioEnabled ? <FaMicrophone size={18} /> : <FaMicrophoneSlash size={18} />}
            </button>
          </OverlayTrigger>
          
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Leave meeting</Tooltip>}
          >
            <button 
              className="btn btn-control rounded-circle btn-danger"
              onClick={leaveMeeting}
            >
              <FaPhone size={18} />
            </button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer position="bottom-center" className="mb-3">
        <Toast 
          show={showRoomToast} 
          onClose={() => setShowRoomToast(false)}
          delay={3000} 
          autohide
          bg="dark"
        >
          <Toast.Body className="text-white">
            Room ID copied to clipboard!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

const VideoComponent = ({ stream, number, role }) => {
  const videoRef = useRef();
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Check if video is enabled
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        setVideoEnabled(videoTrack.enabled);
        const handleEnabledChange = () => setVideoEnabled(videoTrack.enabled);
        videoTrack.addEventListener('enabledchange', handleEnabledChange);
        return () => videoTrack.removeEventListener('enabledchange', handleEnabledChange);
      }
    }
  }, [stream]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`video-element ${!videoEnabled ? 'video-disabled' : ''}`}
      />
      <div className="video-overlay">
        <span className="participant-name">
          {role === 'tutor' ? 'Tutor' : 'Student'} {number} 
          {role === 'tutor' ? (
            <FaUserTie className="ms-2" size={12} />
          ) : (
            <FaUserGraduate className="ms-2" size={12} />
          )}
        </span>
        {!videoEnabled && (
          <div className="video-off-indicator">
            <FaUser size={48} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConferencePage;
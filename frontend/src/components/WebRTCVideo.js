import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhone } from 'react-icons/fa';

const WebRTCVideo = ({ roomId, userRole }) => {
  const [peers, setPeers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef();

  useEffect(() => {
    // Connect to signaling server
    socketRef.current = io(process.env.REACT_APP_API_URL);

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        userVideoRef.current.srcObject = stream;

        // Join the room
        socketRef.current.emit('join-room', roomId, `${userRole}-${Date.now()}`);

        socketRef.current.on('user-connected', (userId) => {
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream
          });

          peer.on('signal', signal => {
            socketRef.current.emit('signal', { to: userId, signal });
          });

          peersRef.current.push({ peer, userId });
          setPeers(prev => [...prev, { userId }]);
        });

        socketRef.current.on('signal', ({ from, signal }) => {
          const peerObj = peersRef.current.find(p => p.userId === from);
          if (peerObj) peerObj.peer.signal(signal);
        });

        socketRef.current.on('user-disconnected', userId => {
          const peerObj = peersRef.current.find(p => p.userId === userId);
          if (peerObj) peerObj.peer.destroy();
          peersRef.current = peersRef.current.filter(p => p.userId !== userId);
          setPeers(prev => prev.filter(p => p.userId !== userId));
        });
      })
      .catch(err => console.error('Error accessing media devices:', err));

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      socketRef.current?.disconnect();
    };
  }, [roomId, userRole]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const leaveCall = () => {
    window.location.href = userRole === 'tutor' ? '/tutor-dashboard' : '/student-dashboard';
  };

  return (
    <div className="video-conference-container">
      <div className="video-grid">
        {/* Local Video */}
        <div className="video-tile local-video">
          <video 
            ref={userVideoRef} 
            autoPlay 
            playsInline 
            muted
            className={!videoEnabled ? 'video-disabled' : ''}
          />
          <div className="video-overlay">You ({userRole})</div>
        </div>

        {/* Remote Videos */}
        {peers.map((peer, index) => (
          <div key={index} className="video-tile">
            <video 
              autoPlay 
              playsInline 
              ref={ref => {
                if (ref && peersRef.current[index]) {
                  peersRef.current[index].peer.on('stream', stream => {
                    ref.srcObject = stream;
                  });
                }
              }}
            />
            <div className="video-overlay">{peer.userId}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button onClick={toggleVideo} className={!videoEnabled ? 'active' : ''}>
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button onClick={toggleAudio} className={!audioEnabled ? 'active' : ''}>
          {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={leaveCall} className="leave-button">
          <FaPhone /> Leave
        </button>
      </div>
    </div>
  );
};

export default WebRTCVideo;
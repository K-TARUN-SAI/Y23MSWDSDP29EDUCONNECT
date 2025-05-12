import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './components/AuthPage';
import Home from './components/Home';
import VideoConferencePage from './components/VideoConferencePage';
import StudentAssignmentsPage from './components/StudentAssignmentsPage';
import TutorAssignmentsPage from './components/TutorAssignmentsPage';
import StudentAttendancePage from './components/StudentAttendancePage';
import TutorAttendancePage from './components/TutorAttendancePage';
import StudentDashboard from './components/StudentDashboard';
import TutorDashboard from './components/TutorDashboard';
import Unauthorized from './components/Unauthorized'; // Create this component
import WebRTCVideo from './components/WebRTCVideo'; // Import WebRTCVideo component
import TutorClassesPage from './components/TutorClassesPage';
import StudentClassesPage from './components/StudentClassesPage'; // Import StudentClassesPage component
import TestVideoConference from './components/TestVideoConference'; // Import TestVideoConference component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-assignments" element={<StudentAssignmentsPage />} />
            <Route path="/student-attendance" element={<StudentAttendancePage />} />
            <Route 
              path="/student-dashboard/video-conference/:meetingId" 
              element={<VideoConferencePage role="student" />} 
            />
          </Route>
          
          {/* Protected tutor routes */}
          <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
            <Route path="/tutor-dashboard" element={<TutorDashboard />} />
            <Route path="/tutor-assignments" element={<TutorAssignmentsPage />} />
            <Route path="/tutor-attendance" element={<TutorAttendancePage />} />
            <Route 
              path="/tutor-dashboard/video-conference/:meetingId" 
              element={<VideoConferencePage role="tutor" />} 
            />
          </Route>
          <Route path="/tutor-dashboard/classes" element={<TutorClassesPage />} />
          <Route path="/student-dashboard/classes" element={<StudentClassesPage />} />
          {/* Test route (optional) */}
          <Route path="/test-video" element={<TestVideoConference />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
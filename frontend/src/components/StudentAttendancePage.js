// pages/StudentAttendancePage.js
import React, { useState, useEffect } from 'react';
import { Table, Tag, Space } from 'antd';
import axios from 'axios';
import { io } from 'socket.io-client';

const StudentAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get('/api/attendance/student', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAttendance(res.data);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);
// In both attendance pages, add this useEffect:
useEffect(() => {
  const socket = io('http://localhost:5000');
  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null; // Decode token to get user ID
  
  socket.on('attendance-update', (update) => {
    if (update.studentId === currentUserId) { // For student view
      setAttendance(prev => [...prev, update]);
    } else { // For tutor view
      setAttendance(prev => prev.map(a => 
        a._id === update._id ? update : a
      ));
    }
  });

  return () => socket.disconnect();
}, []);
  const columns = [
    {
      title: 'Class',
      dataIndex: ['class', 'title'],
      key: 'class'
    },
    {
      title: 'Subject',
      dataIndex: ['class', 'subject'],
      key: 'subject'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = '';
        switch (status) {
          case 'present': color = 'green'; break;
          case 'late': color = 'orange'; break;
          default: color = 'red';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: dur => dur ? `${dur} mins` : 'N/A'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Attendance Records</h1>
      <Table 
        columns={columns} 
        dataSource={attendance} 
        loading={loading}
        rowKey="_id"
      />
    </div>
  );
};

export default StudentAttendancePage;
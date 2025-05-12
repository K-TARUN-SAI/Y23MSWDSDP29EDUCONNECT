// pages/TutorAttendancePage.js
import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, DatePicker, Button, Space } from 'antd';
import { io } from 'socket.io-client';
import axios from 'axios';

const TutorAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class: null,
    date: null,
    status: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, classesRes] = await Promise.all([
          axios.get('/api/attendance/tutor', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('/api/classes/tutor', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setAttendance(attendanceRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // In both attendance pages, add this useEffect:
useEffect(() => {
  const socket = io('http://localhost:5000');
  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null; // Decode user ID from token

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

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const filteredData = attendance.filter(record => {
    return (
      (!filters.class || record.class._id === filters.class) &&
      (!filters.date || new Date(record.date).toDateString() === new Date(filters.date).toDateString()) &&
      (!filters.status || record.status === filters.status)
    );
  });

  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student'
    },
    {
      title: 'Class',
      dataIndex: ['class', 'title'],
      key: 'class'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => new Date(date).toLocaleString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'present' ? 'green' : 
          status === 'late' ? 'orange' : 'red'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: dur => dur ? `${dur} mins` : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => updateStatus(record._id, 'present')}>
            Present
          </Button>
          <Button size="small" onClick={() => updateStatus(record._id, 'late')}>
            Late
          </Button>
          <Button size="small" danger onClick={() => updateStatus(record._id, 'absent')}>
            Absent
          </Button>
        </Space>
      )
    }
  ];

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/attendance/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(attendance.map(a => 
        a._id === id ? { ...a, status } : a
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Class Attendance Management</h1>
      
      <div className="flex gap-4 mb-6">
        <Select
          placeholder="Filter by Class"
          style={{ width: 200 }}
          onChange={val => handleFilterChange('class', val)}
          allowClear
        >
          {classes.map(c => (
            <Select.Option key={c._id} value={c._id}>
              {c.title}
            </Select.Option>
          ))}
        </Select>
        
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          onChange={val => handleFilterChange('status', val)}
          allowClear
        >
          <Select.Option value="present">Present</Select.Option>
          <Select.Option value="late">Late</Select.Option>
          <Select.Option value="absent">Absent</Select.Option>
        </Select>
        
        <DatePicker 
          placeholder="Filter by Date" 
          onChange={date => handleFilterChange('date', date)} 
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default TutorAttendancePage;
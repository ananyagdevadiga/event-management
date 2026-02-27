import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EventForm from '../components/EventForm';
import { FiArrowLeft } from 'react-icons/fi';

const CreateEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!!id);
  const [message, setMessage] = useState({ type: '', text: '' });
  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err.message);
      setMessage({ type: 'error', text: 'Event not found or access denied' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', id)
          .eq('created_by', user.id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Event updated successfully!' });
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{ ...formData, created_by: user.id }]);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Event created successfully!' });
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save event' });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading event...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="form-page">
          <h1>{isEditing ? 'Edit Event' : 'Create New Event'}</h1>
          <p>{isEditing ? 'Update your event details' : 'Fill in the details for your new event'}</p>

          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <EventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin')}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default CreateEditEvent;

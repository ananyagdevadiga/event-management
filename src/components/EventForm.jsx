import React, { useState, useEffect } from 'react';

const EventForm = ({ event, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    max_attendees: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 10) : '',
        location: event.location || '',
        max_attendees: event.max_attendees || '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
    };
    onSubmit(submitData);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Event Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter event title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event..."
          rows="4"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Event Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Event location"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="max_attendees">Max Attendees</label>
        <input
          type="number"
          id="max_attendees"
          name="max_attendees"
          value={formData.max_attendees}
          onChange={handleChange}
          placeholder="Leave empty for unlimited"
          min="1"
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;

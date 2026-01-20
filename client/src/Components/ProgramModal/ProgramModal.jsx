import React, { useState } from 'react';
import './ProgramModal.css';
import { MdAccessTime, MdClose } from 'react-icons/md';
import { HiUsers } from 'react-icons/hi';
import { AiOutlineFilePdf } from 'react-icons/ai';
import { useAuth } from '../../hooks/useAuth';

const ProgramModal = ({ program, onClose, onSubscribe }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    whatsapp_number: '',
    is_employed: false,
  });

  const handleGuestChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setGuestData({ ...guestData, [e.target.name]: value });
    setError('');
  };

  const handleJoinClick = async () => {
    setError('');
    setLoading(true);

    try {
      if (isAuthenticated) {
        // Authenticated user subscription
        await onSubscribe(program.id);
        setSuccess('تم الاشتراك بنجاح!');
      } else {
        // Guest subscription - validate fields
        if (!guestData.first_name || !guestData.last_name || !guestData.age || !guestData.whatsapp_number) {
          setError('جميع الحقول مطلوبة');
          setLoading(false);
          return;
        }

        await onSubscribe(program.id, guestData);
        setSuccess('تم الاشتراك بنجاح!');
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'فشل الاشتراك. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="program-modal-overlay" onClick={onClose}>
      <div className="program-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <MdClose />
        </button>

        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-label">{program.label}</span>
            <h2 className="modal-title">{program.title}</h2>
          </div>

          <div className="modal-body">
            <div className="modal-info">
              <p className="modal-description">{program.fullDescription || program.description}</p>
              
              <div className="modal-details">
                <div className="detail-item">
                  <MdAccessTime className="detail-icon" />
                  <span>{program.duration}</span>
                </div>
                <div className="detail-item">
                  <HiUsers className="detail-icon" />
                  <span>{program.students || 0} طالب</span>
                </div>
              </div>

              {program.resources && program.resources.length > 0 && (
                <div className="modal-resources">
                  <h3>الموارد التعليمية</h3>
                  <ul className="resources-list">
                    {program.resources.map((resource, index) => (
                      <li key={index} className="resource-item">
                        <AiOutlineFilePdf className="pdf-icon" />
                        <a 
                          href={`http://localhost:3001${resource.path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                        >
                          {resource.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-price">
                <span className="price-label">السعر:</span>
                <div className="price-values">
                  <span className="current-price">{program.price} د.م.</span>
                  {program.originalPrice && (
                    <span className="original-price">{program.originalPrice} د.م.</span>
                  )}
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="guest-form">
                <h3>معلومات التسجيل</h3>
                
                {error && <div className="form-error">{error}</div>}
                {success && <div className="form-success">{success}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guest_first_name">الاسم الأول</label>
                    <input
                      type="text"
                      id="guest_first_name"
                      name="first_name"
                      value={guestData.first_name}
                      onChange={handleGuestChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="guest_last_name">الاسم الأخير</label>
                    <input
                      type="text"
                      id="guest_last_name"
                      name="last_name"
                      value={guestData.last_name}
                      onChange={handleGuestChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guest_age">العمر</label>
                    <input
                      type="number"
                      id="guest_age"
                      name="age"
                      value={guestData.age}
                      onChange={handleGuestChange}
                      required
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="guest_whatsapp">رقم الواتساب</label>
                    <input
                      type="tel"
                      id="guest_whatsapp"
                      name="whatsapp_number"
                      value={guestData.whatsapp_number}
                      onChange={handleGuestChange}
                      required
                      placeholder="+212600000000"
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="guest_employed">
                    <input
                      type="checkbox"
                      id="guest_employed"
                      name="is_employed"
                      checked={guestData.is_employed}
                      onChange={handleGuestChange}
                    />
                    <span>موظف حالياً</span>
                  </label>
                </div>
              </div>
            )}

            {isAuthenticated && error && <div className="form-error">{error}</div>}
            {isAuthenticated && success && <div className="form-success">{success}</div>}
          </div>

          <div className="modal-footer">
            <button 
              className="join-now-btn" 
              onClick={handleJoinClick}
              disabled={loading}
            >
              {loading ? 'جاري التسجيل...' : 'انضم الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramModal;

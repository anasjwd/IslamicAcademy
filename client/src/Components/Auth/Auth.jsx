import React, { useState } from 'react';
import './Auth.css';
import { useAuth } from '../../hooks/useAuth';

const Auth = ({ onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, signup } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    whatsapp_number: '',
    is_employed: false,
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignupChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSignupData({ ...signupData, [e.target.name]: value });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      setSuccess('تم تسجيل الدخول بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      setLoading(false);
      return;
    }

    // Remove confirmPassword before sending
    const { confirmPassword, ...userData } = signupData;

    try {
      await signup(userData);
      setSuccess('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'فشل التسجيل. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="auth-content">
          <h2 className="auth-title">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">كلمة المرور</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="********"
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">الاسم الأول</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={signupData.first_name}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">الاسم الأخير</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={signupData.last_name}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="signup-password">كلمة المرور</label>
                  <input
                    type="password"
                    id="signup-password"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    placeholder="********"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    required
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">العمر</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={signupData.age}
                    onChange={handleSignupChange}
                    required
                    min="1"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp_number">رقم الواتساب</label>
                  <input
                    type="tel"
                    id="whatsapp_number"
                    name="whatsapp_number"
                    value={signupData.whatsapp_number}
                    onChange={handleSignupChange}
                    required
                    placeholder="+212600000000"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="is_employed">
                  <input
                    type="checkbox"
                    id="is_employed"
                    name="is_employed"
                    checked={signupData.is_employed}
                    onChange={handleSignupChange}
                  />
                  <span>موظف حالياً</span>
                </label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'جاري التحميل...' : 'إنشاء الحساب'}
              </button>
            </form>
          )}

          <div className="auth-switch">
            {mode === 'login' ? (
              <p>
                ليس لديك حساب؟{' '}
                <button onClick={() => setMode('signup')} className="switch-btn">
                  سجل الآن
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{' '}
                <button onClick={() => setMode('login')} className="switch-btn">
                  سجل الدخول
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

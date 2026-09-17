import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { loginOfficer } from '../api/complaintsApi.js';
import { useLanguage } from '../i18n/I18n.jsx';

export default function OfficerLogin() {
  const { t } = useLanguage(); const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const navigate = useNavigate();
  const submit = async (event) => { event.preventDefault(); setError(''); try { const response = await loginOfficer(form); localStorage.setItem('officerToken', response.data.token); localStorage.setItem('officerProfile', JSON.stringify(response.data.officer)); navigate('/officer-dashboard'); } catch (requestError) { setError(requestError.response?.data?.error || t('invalidCredentials')); } };
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  return <main className="auth-page"><section className="auth-card"><div className="section-kicker">{t('officer').toUpperCase()}</div><h1>{t('officerLogin')}</h1><p>{t('accessRestricted')}</p><form onSubmit={submit}><label>Email address<input type="email" name="email" value={form.email} onChange={update} required /></label><label>{t('password')}<input type="password" name="password" value={form.password} onChange={update} required /></label>{error && <p className="error-message">{error}</p>}<button className="button primary-button">{t('signIn')}</button></form><p className="auth-switch">Need an account? <Link to="/officer-register">Register as an officer</Link></p></section></main>;
}
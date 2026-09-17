import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOfficerDepartments, registerOfficer } from '../api/complaintsApi.js';

export default function OfficerRegister() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', municipality_ward: '', department: '', idCard: null });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getOfficerDepartments()
      .then(({ data }) => setDepartments(data))
      .catch(() => setError('Unable to load departments. Please try again.'));
  }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('password', form.password);
    data.append('phone', form.phone);
    data.append('municipality_ward', form.municipality_ward);
    data.append('department', form.department);
    data.append('idCard', form.idCard);
    try {
      const response = await registerOfficer(data);
      setMessage(response.data.message);
      setForm({ name: '', email: '', password: '', phone: '', municipality_ward: '', department: '', idCard: null });
      event.target.reset();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Registration failed.');
    }
  };

  return <main className="auth-page"><section className="auth-card"><div className="section-kicker">OFFICER SERVICES</div><h1>Officer Registration</h1><p>Submit your details for manual government verification.</p><form onSubmit={submit}><label>Full name<input name="name" value={form.name} onChange={update} required /></label><label>Email address<input type="email" name="email" value={form.email} onChange={update} required /></label><label>Password<input type="password" name="password" value={form.password} onChange={update} minLength="8" required /></label><label>Registered phone number<input type="tel" name="phone" value={form.phone} onChange={update} required /></label><label>Municipality / Ward<input name="municipality_ward" value={form.municipality_ward} onChange={update} required /></label><label>Department<select name="department" value={form.department} onChange={update} required><option value="" disabled>Select Department</option>{departments.map((department) => <option key={department.value} value={department.value}>{department.name}</option>)}</select></label><label>Job ID Card document<input type="file" name="idCard" accept="image/*,.pdf" onChange={(event) => setForm({ ...form, idCard: event.target.files[0] })} required /></label>{error && <p className="error-message">{error}</p>}{message && <p className="message">{message}</p>}<button className="button primary-button">Submit Registration</button></form><p className="auth-switch">Already registered? <Link to="/officer-login">Officer Login</Link></p></section></main>;
}

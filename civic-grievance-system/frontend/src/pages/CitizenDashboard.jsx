import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm.jsx';
import { getCitizenComplaints } from '../api/complaintsApi.js';
import { useLanguage } from '../i18n/I18n.jsx';
import DashboardSidebar from '../components/DashboardSidebar.jsx';

export default function CitizenDashboard() {
  const { t } = useLanguage(); const [items, setItems] = useState([]); const token = localStorage.getItem('citizenToken'); const profile = JSON.parse(localStorage.getItem('citizenProfile') || '{}'); const navigate = useNavigate();
  const load = async () => { try { setItems((await getCitizenComplaints(token)).data); } catch (_error) { localStorage.removeItem('citizenToken'); navigate('/citizen-login'); } };
  useEffect(() => { if (!token) navigate('/citizen-login'); else load(); }, []);
  return <div className="dashboard-shell"><DashboardSidebar role="citizen" /><main className="dashboard-page"><div className="dashboard-top"><div><div className="section-kicker">{t('citizen').toUpperCase()}</div><h1>{t('welcome')}, {profile.name || t('citizen')}</h1><p>{t('myComplaints')}</p></div></div><div className="grid citizen-grid"><ComplaintForm onSubmitted={load} /><section className="table-panel"><div className="table-heading"><h2>{t('myComplaints')}</h2><span>{items.length} {t('complaints').toLowerCase()}</span></div>{items.map((item) => <Link className="report" to={`/complaints/${item.id}`} key={item.id}><b>#{item.id}</b><span>{item.title || item.category} · {item.status}</span><i>{item.severity}</i></Link>)}{!items.length && <p className="empty-state">{t('noComplaints')}</p>}</section></div></main></div>;
}
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/I18n.jsx';

export default function DashboardSidebar({ role, department }) {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const signOut = () => { localStorage.removeItem(`${role}Token`); localStorage.removeItem(`${role}Profile`); navigate('/'); };
  const links = role === 'citizen' ? [{ to: '/citizen-dashboard', label: t('myComplaints') }, { to: '/', label: t('submit') }] : role === 'admin' ? [{ to: '/admin-dashboard', label: t('administration') }, { to: '/admin-dashboard', label: t('complaints') }] : [{ to: '/officer-dashboard', label: t('officerWorkspace') }, { to: '/officer-dashboard', label: department || t('assignedComplaints') }];
  return <aside className="dashboard-sidebar"><div className="sidebar-title">{role === 'citizen' ? t('citizen') : role === 'admin' ? t('admin') : department || t('officer')}</div><nav>{links.map((link) => <NavLink key={`${link.to}-${link.label}`} to={link.to}>{link.label}</NavLink>)}</nav><div className="sidebar-bottom"><label>{t('language')}<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option></select></label><button onClick={signOut}>{t('logout')}</button></div></aside>;
}

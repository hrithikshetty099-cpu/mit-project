import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/I18n.jsx';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const citizenPath = localStorage.getItem('citizenToken') ? '/citizen-dashboard' : '/citizen-login';
  return <header className="site-header"><Link to="/" className="gov-brand"><span className="emblem" aria-hidden="true">◈</span><span><b>{t('government')}</b><small>{t('appName')}</small></span></Link><nav className="site-nav"><NavLink to="/">{t('reportIssue')}</NavLink><NavLink to="/track">{t('track')}</NavLink><NavLink to="/map">{t('heatmap')}</NavLink><Link to={citizenPath}>{t('citizenLogin')}</Link><Link className="officer-link" to="/officer-login">{t('officerLogin')}</Link><Link className="admin-link" to="/admin-login">{t('adminLogin')}</Link><label className="language-picker">{t('language')}<select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t('language')}><option value="en">English</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option></select></label></nav></header>;
}
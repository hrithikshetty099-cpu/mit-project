import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/I18n.jsx';

export default function RoleSelect() {
  const { language, setLanguage } = useLanguage();
  return <main className="role-select-page"><label className="role-language-picker">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Language"><option value="en">English</option><option value="kn">Kannada</option><option value="hi">Hindi</option></select></label><section className="role-select-content"><div className="section-kicker">KARNATAKA CIVIC SERVICES</div><h1>Government of Karnataka</h1><p className="role-select-title">Smart Civic Grievance &amp; Resolution System</p><div className="role-options"><Link className="role-option" to="/citizen"><strong>I'm a Citizen</strong><span>Report civic issues and track their resolution</span></Link><Link className="role-option role-option-officer" to="/officer-login"><strong>I'm an Officer</strong><span>Manage and resolve complaints assigned to your department</span></Link></div></section></main>;
}

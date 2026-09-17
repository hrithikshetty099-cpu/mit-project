import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignComplaintDepartment, assignComplaintOfficer, assignOfficerDepartment, getAdminComplaints, getAdminDepartments, getAdminOfficers, getAdminUsers, getOfficerDepartments, reviewOfficer } from '../api/complaintsApi.js';
import { useLanguage } from '../i18n/I18n.jsx';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import ComplaintEvidence from '../components/ComplaintEvidence.jsx';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState({ users: [], officers: [], departments: [], complaints: [] });
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  const load = async () => {
    try {
      const responses = await Promise.all([getAdminUsers(token), getAdminOfficers(token), getAdminDepartments(token), getAdminComplaints(token), getOfficerDepartments()]);
      setData({ users: responses[0].data, officers: responses[1].data, departments: responses[2].data, complaints: responses[3].data, officerDepartments: responses[4].data });
    } catch (_error) { localStorage.removeItem('adminToken'); navigate('/admin-login'); }
  };
  useEffect(() => { if (!token) navigate('/admin-login'); else load(); }, []);
  const departmentOptions = data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>);
  const officerDepartmentOptions = (data.officerDepartments || []).map((department) => <option key={department.value} value={department.value}>{department.name}</option>);
  const officersForDepartment = (departmentId) => { const departmentName = data.departments.find((department) => String(department.id) === String(departmentId))?.name; const departmentValue = data.officerDepartments?.find((department) => department.name === departmentName)?.value; return data.officers.filter((officer) => officer.department === departmentValue && officer.verification_status === 'approved'); };
  const signOut = () => { localStorage.removeItem('adminToken'); navigate('/'); };
  return <div className="dashboard-shell"><DashboardSidebar role="admin" /><main className="dashboard-page">
    <div className="dashboard-top"><div><div className="section-kicker">{t('administration').toUpperCase()}</div><h1>{t('administration')}</h1><p>{t('manageRecords')}</p></div><button className="button outline-button" onClick={signOut}>{t('logout')}</button></div>
    <div className="admin-stats"><div><b>{data.users.length}</b><span>{t('citizens')}</span></div><div><b>{data.officers.length}</b><span>{t('officers')}</span></div><div><b>{data.complaints.length}</b><span>{t('complaints')}</span></div></div>
    <section className="table-panel"><div className="table-heading"><h2>{t('officerAssignments')}</h2><span>{t('department')}</span></div>{data.officers.map((officer) => <div className="admin-row" key={officer.id}><span><b>{officer.name}</b><small>{officer.email} · {officer.verification_status}</small></span><div><button className="small-action" disabled={officer.verification_status === 'approved'} onClick={async () => { await reviewOfficer(token, officer.id, 'approved'); load(); }}>{t('approve')}</button><button className="small-action danger-action" disabled={officer.verification_status === 'rejected'} onClick={async () => { await reviewOfficer(token, officer.id, 'rejected'); load(); }}>{t('reject')}</button><select value={officer.department} onChange={async (event) => { await assignOfficerDepartment(token, officer.id, event.target.value); load(); }}>{officerDepartmentOptions}</select></div></div>)}</section>
    <section className="table-panel"><div className="table-heading"><h2>{t('complaintRouting')}</h2><span>{t('complaints')}</span></div>{data.complaints.map((complaint) => <div className="admin-row admin-complaint" key={complaint.id}><div><span><b>#{complaint.id} · {complaint.title || complaint.category}</b><small>{complaint.status} · {complaint.department_name || 'Unassigned'}</small></span><ComplaintEvidence complaint={complaint} /></div><div><select value={complaint.department_id || ''} onChange={async (event) => { await assignComplaintDepartment(token, complaint.id, event.target.value); load(); }}><option value="">Unassigned</option>{departmentOptions}</select><select value={complaint.assigned_officer_id || ''} onChange={async (event) => { if (event.target.value) { await assignComplaintOfficer(token, complaint.id, event.target.value); load(); } }}><option value="">Assign officer</option>{officersForDepartment(complaint.department_id).map((officer) => <option key={officer.id} value={officer.id}>{officer.name}</option>)}</select></div></div>)}</section>
  </main></div>;
}

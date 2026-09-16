import { useState } from 'react';
import { trackComplaint } from '../api/complaintsApi.js';
import Timeline from '../components/Timeline.jsx';

export default function TrackComplaint() {
  const [id, setId] = useState(''); const [result, setResult] = useState(null); const [error, setError] = useState('');
  const search = async (event) => { event.preventDefault(); setError(''); setResult(null); try { const response = await trackComplaint(id); setResult(response.data); } catch (_error) { setError('Sign in first, or no complaint was found for that reference ID.'); } };
  return <main className="content-page"><div className="section-kicker">CITIZEN SERVICES / TRACK</div><h1>Track a complaint</h1><p className="lead">Enter the reference number from your submission to view its current resolution stage.</p><form className="lookup-form" onSubmit={search}><label htmlFor="reference">Complaint reference ID</label><div><input id="reference" value={id} onChange={(event) => setId(event.target.value)} placeholder="Example: 1042" required /><button className="button primary-button">Search record</button></div></form>{error && <p className="error-message">{error}</p>}{result && <section className="record-panel"><div className="record-meta"><span>Reference #{result.complaint.id}</span><strong>{result.complaint.status}</strong></div><h2>{result.complaint.category}</h2><p>{result.complaint.description}</p><Timeline history={result.history} status={result.complaint.status} /></section>}</main>;
}
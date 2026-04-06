import React from 'react';
import InteractiveGlassPanel from './InteractiveGlassPanel';

export default function ServiceModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <InteractiveGlassPanel className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3 id="modal-title" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {data.title}
        </h3>
        <p id="modal-desc" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
          {data.desc}
        </p>
        <ul id="modal-features" className="modal-list">
          {data.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </InteractiveGlassPanel>
    </div>
  );
}

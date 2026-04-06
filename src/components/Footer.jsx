import React from 'react';
import { Link } from 'react-router-dom';
import InteractiveGlassPanel from './InteractiveGlassPanel';

export default function Footer() {
  return (
    <footer className="gs-reveal">
      <InteractiveGlassPanel className="footer-content">
        <p style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '1rem' }}>
          <a href="tel:+254746047504" style={{ color: 'var(--text-main)', textDecoration: 'none', borderBottom: '2px dashed var(--accent-green)', transition: 'color 0.3s' }} 
             onMouseOver={(e) => e.currentTarget.style.color='var(--accent-green)'} 
             onMouseOut={(e) => e.currentTarget.style.color='var(--text-main)'}>
            <i className="fa-solid fa-phone"></i> +254 746 047 504
          </a>
        </p>
        <p><i className="fa-solid fa-location-dot"></i> 00100-277 Nairobi, Kenya</p>
      </InteractiveGlassPanel>
    </footer>
  );
}

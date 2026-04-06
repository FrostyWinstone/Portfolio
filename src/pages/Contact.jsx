import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import InteractiveGlassPanel from '../components/InteractiveGlassPanel';

export default function Contact() {

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on mount
    gsap.fromTo(".contact-form-wrapper", 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const msg = document.getElementById('message').value;
    
    const recipient = "okombewinstone@gmail.com";
    const subject = encodeURIComponent("Website Inquiry: " + name);
    const body = encodeURIComponent(`Hello,\n\nMy name is ${name}.\n\nMessage:\n${msg}\n\n---\nSent from Unpublished Studios Website`);
    
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="page-transition">
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        
        <Link to="/" className="back-link"><i className="fa-solid fa-arrow-left"></i> Back to Home</Link>
        
        <InteractiveGlassPanel className="contact-form-wrapper" style={{ width: '100%', maxWidth: '600px' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem', fontSize: '2rem' }}>Send a Message.</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Reach out directly and I'll get back to you via email.</p>
            
            <form className="contact-form" onSubmit={sendEmail}>
                <div className="input-group">
                    <label htmlFor="name">Your Name</label>
                    <input type="text" id="name" required placeholder="e.g. John Doe" />
                </div>
                
                <div className="input-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows="5" required placeholder="How can we help you?"></textarea>
                </div>
                
                <button type="submit" className="submit-btn"><i className="fa-solid fa-paper-plane"></i> Send Email</button>
            </form>
        </InteractiveGlassPanel>
      </div>
    </div>
  );
}

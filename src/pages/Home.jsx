import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';
import ServiceModal from '../components/ServiceModal';
import InteractiveGlassPanel from '../components/InteractiveGlassPanel';
import TerminalHacker from '../components/TerminalHacker';

gsap.registerPlugin(ScrollTrigger);

const servicesData = [
  {
    title: 'IT Support',
    icon: 'fa-solid fa-server',
    short: 'Quick and effective IT support exactly when you need it. Flawless execution without the technical headache.',
    desc: 'Comprehensive IT support ensuring zero downtime for your critical infrastructure.',
    features: ['24/7 Priority Support', 'Remote & On-site Troubleshooting', 'Hardware Maintenance', 'Software Updates']
  },
  {
    title: 'Network Infrastructure',
    icon: 'fa-solid fa-network-wired',
    short: 'Custom, scalable, and beautifully seamless running network infrastructure designed around precise requirements.',
    desc: 'Enterprise-grade networking solutions tailored to your physical floorplan and bandwidth needs.',
    features: ['Structured Cabling', 'High-Speed Wi-Fi Setup', 'Firewall Security', 'Server Rack Management']
  },
  {
    title: 'CCTV Setup',
    icon: 'fa-solid fa-shield-halved',
    short: 'Secure whatever matters most to your home or business with uncompromising, state-of-the-art surveillance.',
    desc: 'Crystal-clear surveillance solutions that give you peace of mind 24/7.',
    features: ['IP Camera Installation', 'DVR/NVR Configuration', 'Remote Mobile Viewing', 'Motion Alert Setup']
  },
  {
    title: 'Smart Homes',
    icon: 'fa-solid fa-house-signal',
    short: 'Future-proof your space with invisible, deeply integrated, and automated smart living experiences.',
    desc: 'Transform your living space with intelligent, automated systems for lighting, audio, and security.',
    features: ['Home Assistant Hubs', 'Automated Lighting', 'Smart Locks & Entry', 'Integrated Audio Systems']
  }
];

export default function Home() {
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    // Reveal Animations
    gsap.fromTo(".badge", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
    );
    gsap.fromTo("h1.display", 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: "power3.out" }
    );
    gsap.fromTo(".hero p", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.7, ease: "power3.out" }
    );

    const revealElements = document.querySelectorAll(".gs-reveal");
    revealElements.forEach((elem) => {
      // Don't duplicate hero logic
      if(elem.classList.contains("hero")) return;
      gsap.fromTo(elem, 
        { opacity: 0, y: 60 },
        {
          opacity: 1, 
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.killAll(); // Cleanup so SPA routing doesn't break
    };
  }, []);

  return (
    <div className="page-transition">
      <div className="app-container">
        
        {/* Hero Section */}
        <section className="hero gs-reveal">
          <TerminalHacker />
          <div className="badge">Unpublished Studios</div>
          <h1 className="display">Tech<br/>Crafted.</h1>
          <p>Your Trusted ICT Expert.<br/>Secure, seamless, and effective infrastructure engineered to absolute perfection.</p>
        </section>

        {/* Stats Section */}
        <section className="stats-container gs-reveal">
          <div className="stat-box">
            <h4>17</h4>
            <p>Companies Served</p>
          </div>
          <div className="stat-box">
            <h4>123</h4>
            <p>Projects Completed</p>
          </div>
        </section>

        {/* Services Section */}
        <section className="services gs-reveal">
          <h2 className="section-title">Areas of Expertise.</h2>
          
          <div className="services-grid">
            {servicesData.map((s, idx) => (
              <InteractiveGlassPanel 
                key={idx} 
                className="service-card interactive"
                onClick={() => setModalData(s)}
              >
                <i className={`${s.icon} service-icon`}></i>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                </div>
              </InteractiveGlassPanel>
            ))}
          </div>
        </section>

        {/* Call to Action (Big Email Button) */}
        <section className="gs-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Link to="/contact" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <InteractiveGlassPanel className="interactive" style={{ padding: '3rem 5rem', borderColor: 'var(--accent-red)' }}>
              <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Need an ICT Expert?</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'var(--accent-red)', color: '#fff', padding: '1rem 2rem', borderRadius: '100px', fontWeight: 600, fontSize: '1.2rem', transition: 'transform 0.3s', boxShadow: '0 10px 20px rgba(230, 28, 36, 0.4)' }}>
                <i className="fa-solid fa-envelope"></i> Send me an Email
              </div>
            </InteractiveGlassPanel>
          </Link>
        </section>

        <Footer />
      </div>

      <ServiceModal 
        isOpen={!!modalData} 
        onClose={() => setModalData(null)} 
        data={modalData} 
      />
    </div>
  );
}

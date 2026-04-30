import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ScanLine, FileSpreadsheet, BellRing, Sun, Moon, User, Phone, Globe } from 'lucide-react';
import { ThemeContext } from '../App';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleDemoRequest = () => {
    navigate('/login');
  };

  const features = [
    {
      title: "Smart OCR Scanning",
      description: "Extract data from scanned invoices and receipts with 99.8% accuracy using our automotive-trained AI models.",
      icon: <ScanLine size={32} />
    },
    {
      title: "Tally Integration",
      description: "Seamlessly cross-reference your uploaded documents with exported Tally ERP data in seconds.",
      icon: <FileSpreadsheet size={32} />
    },
    {
      title: "Real-time Fraud Alerts",
      description: "Instantly detect manipulated amounts, fake vendors, and duplicate entries before payments are made.",
      icon: <BellRing size={32} />
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="brand">
            <ShieldAlert size={32} color="#2563eb" />
            <span className="brand-name">DealerGuard AI</span>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {isDarkMode ? <Sun size={20} color="var(--text-primary)" /> : <Moon size={20} color="var(--text-primary)" />}
            </button>
            <button className="login-btn" onClick={handleDemoRequest}>Login</button>
            <button className="btn-primary" onClick={handleDemoRequest}>Request Demo</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">New: AI Models Updated for 2024</div>
          <h1 className="hero-title">AI-Powered Fraud Detection for Car Dealerships</h1>
          <p className="hero-subtitle">
            Protect your dealership's margins. Automatically reconcile Tally entries with physical invoices to catch discrepancies, vendor fraud, and duplicate bills instantly.
          </p>
          <div className="hero-actions">
            <button className="btn-primary hero-btn" onClick={handleDemoRequest}>Request a Demo</button>
            <button className="btn-secondary hero-btn">See How it Works</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose DealerGuard AI?</h2>
          <p>Built specifically for the Indian automotive retail sector to stop revenue leakage.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-about">
            <div className="footer-brand">
              <ShieldAlert size={28} color="var(--primary)" />
              <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>14 Ai Automation</span>
            </div>
            <p className="footer-desc">
              We specialize in building cutting-edge AI and automation solutions that eliminate manual inefficiencies and detect discrepancies in real-time. DealerGuard AI is our flagship product tailored for the automotive industry.
            </p>
          </div>
          
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <User size={18} className="contact-icon" />
              <p><strong>Founder:</strong> Sahil</p>
            </div>
            <div className="contact-item">
              <Phone size={18} className="contact-icon" />
              <p><strong>Phone:</strong> +91 9737462043</p>
            </div>
            <div className="contact-item">
              <Globe size={18} className="contact-icon" />
              <a href="https://www.14techsolutions.com" target="_blank" rel="noreferrer" className="website-link">
                www.14techsolutions.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 14 Ai Automation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

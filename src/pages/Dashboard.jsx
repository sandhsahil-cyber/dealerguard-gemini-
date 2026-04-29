import { Building2, FileSearch, ShieldAlert, IndianRupee, AlertTriangle, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const recentAlerts = [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Global Dashboard</h1>
        <p>Overview of fraud detection metrics across all TATA Motors dealerships.</p>
      </div>

      <div className="summary-cards">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Building2 className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Outlets Monitored</p>
            <h3 className="stat-value">0</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <FileSearch className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Docs Processed (This Month)</p>
            <h3 className="stat-value">0</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <ShieldAlert className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Fraud Detected (This Month)</p>
            <h3 className="stat-value danger-text">0</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">
            <IndianRupee className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Amount at Risk (₹)</p>
            <h3 className="stat-value warning-text">{formatCurrency(0)}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Fraud Cases by Outlet Name</h3>
          </div>
          <div className="horizontal-bar-chart">
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              No fraud cases reported yet.
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h3>Document Types Analyzed</h3>
          </div>
          <div className="pie-chart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              No document data available.
            </div>
          </div>
        </div>

        <div className="card recent-activity">
          <div className="card-header flex-between">
            <h3>Recent Fraud Alerts (Last 5)</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list" style={{ padding: '0 1rem' }}>
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No recent fraud alerts.
              </div>
            ) : (
              <ul className="activity-list">
                {recentAlerts.map((alert, index) => (
                  <li key={index} className="activity-item premium-row">
                    <div className="activity-icon red-pulse"><AlertTriangle size={18} /></div>
                    <div className="activity-details flex-1">
                      <div className="alert-header">
                        <div className="alert-title">
                          <span className="alert-badge">{alert.id}</span>
                          <span className="alert-outlet">{alert.outlet}</span>
                        </div>
                        <span className="alert-amount danger-text font-bold">{formatCurrency(alert.amount)}</span>
                      </div>
                      <div className="alert-meta">
                        <span className="reason"><span className="dot"></span>{alert.reason}</span>
                        <span className="time">{alert.date}</span>
                      </div>
                    </div>
                    <div className="row-action">
                      <ChevronRight size={20} className="chevron-icon" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


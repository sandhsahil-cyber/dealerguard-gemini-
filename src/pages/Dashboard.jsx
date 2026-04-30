import { useState, useEffect } from 'react';
import { Building2, FileSearch, ShieldAlert, IndianRupee, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    outlets: 0,
    docs: 0,
    frauds: 0,
    amountAtRisk: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Get total outlets from uploads
      const { data: outletsData } = await supabase
        .from('uploads')
        .select('outlet');
      
      const uniqueOutlets = new Set(outletsData?.map(u => u.outlet)).size;

      // 2. Get fraud results stats
      const { data: fraudResults, error: fraudError } = await supabase
        .from('fraud_results')
        .select('*');
      
      if (fraudError) throw fraudError;

      const totalDocs = fraudResults.length;
      const totalFrauds = fraudResults.filter(r => r.status === 'fraud').length;
      const amountAtRisk = fraudResults
        .filter(r => r.status === 'fraud')
        .reduce((sum, r) => sum + (r.amt_doc || 0), 0);

      setStats({
        outlets: uniqueOutlets,
        docs: totalDocs,
        frauds: totalFrauds,
        amountAtRisk: amountAtRisk
      });

      // 3. Get recent alerts with outlet info
      const { data: alerts, error: alertsError } = await supabase
        .from('fraud_results')
        .select(`
          *,
          uploads (outlet)
        `)
        .eq('status', 'fraud')
        .order('id', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;

      const formattedAlerts = alerts.map(a => ({
        id: a.invoice_no,
        outlet: a.uploads?.outlet?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown Outlet',
        amount: a.amt_doc,
        reason: a.amt_tally !== a.amt_doc ? 'Amount Mismatch' : 'Vendor Discrepancy',
        date: a.date
      }));

      setRecentAlerts(formattedAlerts);

    } catch (err) {
      console.error('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={64} color="var(--primary)" />
      </div>
    );
  }

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
            <h3 className="stat-value">{stats.outlets}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <FileSearch className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Docs Processed (Total)</p>
            <h3 className="stat-value">{stats.docs}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <ShieldAlert className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Fraud Detected (Total)</p>
            <h3 className="stat-value danger-text">{stats.frauds}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper yellow">
            <IndianRupee className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Amount at Risk (₹)</p>
            <h3 className="stat-value warning-text">{formatCurrency(stats.amountAtRisk)}</h3>
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


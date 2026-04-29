import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, AlertTriangle, CheckCircle, HelpCircle, X, FileImage, FileSpreadsheet, Upload } from 'lucide-react';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: passedData = [], outlet = '', uploadDate = new Date().toLocaleDateString('en-IN') } = location.state || {};

  const [filter, setFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState(passedData);
  const hasData = data.length > 0;

  const markAsReviewed = (e, id) => {
    e.stopPropagation();
    setData(prev => prev.map(item => item.id === id ? { ...item, reviewed: true } : item));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredData = data.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'match': return <CheckCircle size={16} className="status-icon green" />;
      case 'partial': return <HelpCircle size={16} className="status-icon yellow" />;
      case 'fraud': return <AlertTriangle size={16} className="status-icon red" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'match': return 'Matched';
      case 'partial': return 'Medium Risk';
      case 'fraud': return 'High Risk';
      default: return '';
    }
  };

  return (
    <div className="results-page">
      <div className="page-header-actions">
        <div>
          <h1>Analysis Results</h1>
          <p>Batch uploaded on {uploadDate}{outlet ? ` · ${outlet.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}</p>
        </div>
        <button className="btn-primary flex-center gap-2" style={{ backgroundColor: '#dc2626' }}>
          <Download size={18} /> Export to PDF
        </button>
      </div>

      {!hasData ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <h2 style={{ marginBottom: '0.75rem' }}>No Analysis Data</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Upload a Tally export or scanned invoices to run fraud detection.</p>
          <button className="btn-primary" onClick={() => navigate('/upload')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={16} /> Go to Upload
          </button>
        </div>
      ) : (<>

      <div className="summary-cards">
        <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <p className="stat-label">Total Documents</p>
            <h3 className="stat-value">{data.length}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('match')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <p className="stat-label">Matched</p>
            <h3 className="stat-value green-text">{data.filter(d => d.status === 'match').length}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('partial')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <p className="stat-label">Partial</p>
            <h3 className="stat-value yellow-text">{data.filter(d => d.status === 'partial').length}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('fraud')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <p className="stat-label">High Risk / Fraud</p>
            <h3 className="stat-value red-text">{data.filter(d => d.status === 'fraud').length}</h3>
          </div>
        </div>
      </div>

      <div className="card table-container">
        <div className="table-header-controls">
          <div className="filter-group">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-btn ${filter === 'fraud' ? 'active' : ''}`} onClick={() => setFilter('fraud')}>High Risk</button>
            <button className={`filter-btn ${filter === 'partial' ? 'active' : ''}`} onClick={() => setFilter('partial')}>Medium Risk</button>
            <button className={`filter-btn ${filter === 'match' ? 'active' : ''}`} onClick={() => setFilter('match')}>Matched</button>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Amount (Tally)</th>
                <th>Amount (Doc)</th>
                <th>Vendor (Tally)</th>
                <th>Vendor (Doc)</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr 
                  key={row.id} 
                  className={`row-${row.status} ${row.status === 'fraud' ? 'clickable-row' : ''}`}
                  onClick={() => row.status === 'fraud' ? setSelectedRow(row) : null}
                >
                  <td className="font-medium">{row.id}</td>
                  <td>{row.date}</td>
                  <td className={row.amtTally !== row.amtDoc ? 'highlight-diff' : ''}>{formatCurrency(row.amtTally)}</td>
                  <td className={row.amtTally !== row.amtDoc ? 'highlight-diff' : ''}>{formatCurrency(row.amtDoc)}</td>
                  <td className={row.venTally !== row.venDoc ? 'highlight-diff' : ''}>{row.venTally}</td>
                  <td className={row.venTally !== row.venDoc ? 'highlight-diff' : ''}>{row.venDoc}</td>
                  <td>
                    <div className={`status-badge badge-${row.status}`}>
                      {getStatusIcon(row.status)}
                      {getStatusText(row.status)}
                    </div>
                  </td>
                  <td>
                    <div className="score-cell">
                      <div className="score-bar-bg">
                        <div className={`score-bar fill-${row.status}`} style={{ width: `${row.score}%` }}></div>
                      </div>
                      <span>{row.score}</span>
                    </div>
                  </td>
                  <td>
                    {row.reviewed ? (
                      <span className="reviewed-badge"><CheckCircle size={14}/> Reviewed</span>
                    ) : (
                      <button className="review-btn" onClick={(e) => markAsReviewed(e, row.id)}>Mark as Reviewed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow && (
        <div className="side-panel-overlay" onClick={() => setSelectedRow(null)}>
          <div className="side-panel" onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <h2>Fraud Analysis Details - {selectedRow.id}</h2>
              <button className="close-btn" onClick={() => setSelectedRow(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="side-panel-content">
              <div className="panel-col">
                <div className="col-header">
                  <FileImage size={18} />
                  <h3>Scanned Document</h3>
                </div>
                <div className="mock-image-container">
                  <div className="mock-invoice">
                    <div className="mock-invoice-header">TAX INVOICE</div>
                    <div className="mock-invoice-body">
                      <p><strong>Invoice No:</strong> {selectedRow.id}</p>
                      <p><strong>Date:</strong> {selectedRow.date}</p>
                      <div className={`highlight-box ${selectedRow.venTally !== selectedRow.venDoc ? 'highlight-red' : ''}`}>
                        <p><strong>Vendor:</strong> {selectedRow.venDoc}</p>
                      </div>
                      <div className={`highlight-box ${selectedRow.amtTally !== selectedRow.amtDoc ? 'highlight-red' : ''}`}>
                        <p><strong>Total Amount:</strong> {formatCurrency(selectedRow.amtDoc)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="panel-col">
                <div className="col-header">
                  <FileSpreadsheet size={18} />
                  <h3>Tally Entry</h3>
                </div>
                <div className="tally-data-container">
                  <div className="tally-field">
                    <span className="tally-label">Voucher No</span>
                    <span className="tally-value">{selectedRow.id}</span>
                  </div>
                  <div className="tally-field">
                    <span className="tally-label">Date</span>
                    <span className="tally-value">{selectedRow.date}</span>
                  </div>
                  <div className={`tally-field ${selectedRow.venTally !== selectedRow.venDoc ? 'highlight-red-bg' : ''}`}>
                    <span className="tally-label">Party A/c Name</span>
                    <span className="tally-value">{selectedRow.venTally}</span>
                  </div>
                  <div className={`tally-field ${selectedRow.amtTally !== selectedRow.amtDoc ? 'highlight-red-bg' : ''}`}>
                    <span className="tally-label">Amount</span>
                    <span className="tally-value">{formatCurrency(selectedRow.amtTally)}</span>
                  </div>
                </div>
                
                <div className="discrepancy-summary">
                  <h4><AlertTriangle size={16} /> Discrepancy Found</h4>
                  <ul>
                    {selectedRow.amtTally !== selectedRow.amtDoc && (
                      <li>Amount mismatch: Tally shows {formatCurrency(selectedRow.amtTally)} but document shows {formatCurrency(selectedRow.amtDoc)}</li>
                    )}
                    {selectedRow.venTally !== selectedRow.venDoc && (
                      <li>Vendor mismatch: Tally shows "{selectedRow.venTally}" but document shows "{selectedRow.venDoc}"</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>)}
    </div>
  );
};

export default Results;

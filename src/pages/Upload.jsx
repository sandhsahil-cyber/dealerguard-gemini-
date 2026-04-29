import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileSpreadsheet, FileImage, Camera, CheckCircle, MapPin } from 'lucide-react';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const [tallyFile, setTallyFile] = useState(null);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState('');

  const handleTallyUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTallyFile(e.target.files[0]);
    }
  };

  const handleScannedUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setScannedFiles(Array.from(e.target.files));
    }
  };

  const simulateCameraScan = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      const mockFile = new File(['dummy content'], `scanned_doc_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setScannedFiles(prev => [...prev, mockFile]);
      setIsCameraActive(false);
    }, 3000);
  };

  /* ── CSV Parser ─────────────────────────────────────── */
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    return lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      obj._rowIndex = idx;
      return obj;
    });
  };

  /* ── Extract standard fields from a CSV row ─────────── */
  const extractRowData = (row, idx) => {
    const invKeys = ['Invoice No', 'Invoice Number', 'Voucher No', 'VoucherNo', 'InvoiceNo', 'Invoice', 'Ref No'];
    const id = invKeys.map(k => row[k]).find(v => v) || `INV-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`;

    const dateKeys = ['Date', 'Invoice Date', 'Voucher Date', 'date', 'Dt'];
    const date = dateKeys.map(k => row[k]).find(v => v) || new Date(Date.now() - idx * 86400000).toLocaleDateString('en-IN');

    const amtKeys = ['Amount', 'Total Amount', 'Total', 'Net Amount', 'Value', 'Debit', 'Credit', 'Gross', 'Dr Amount'];
    const amtStr = amtKeys.map(k => row[k]).find(v => v && !isNaN(parseFloat(String(v).replace(/[₹,\s]/g, ''))));
    const amtTally = amtStr ? Math.abs(parseFloat(String(amtStr).replace(/[₹,\s]/g, ''))) : Math.floor(50000 + ((idx * 73841) % 850000));

    const venKeys = ['Vendor', 'Party', 'Party Name', 'Ledger', 'Name', 'Account', 'Particulars', 'Narration'];
    const venTally = venKeys.map(k => row[k]).find(v => v && v.length > 2) || `Vendor ${idx + 1}`;

    return { id, date, amtTally, venTally };
  };

  /* ── Generate fraud detection results ──────────────── */
  const VENDORS = ['MRF Tyres Ltd', 'Bosch Auto Parts', 'Tata Autocomp', 'Mahindra Parts', 'Exide Industries', 'Motherson Sumi', 'Sundaram Clayton', 'Minda Industries'];
  const FAKE_VENDORS = ['MRF Tyres Pvt Ltd', 'Bosch Auto Spares', 'Tata Auto Systems', 'Mahindra Spare Parts Co', 'Exide Ind Ltd', 'Motherson Sumi Sys Pvt'];

  const generateResults = (rows, scannedCount) => {
    const totalCount = Math.max(rows.length, scannedCount, 5);

    return Array.from({ length: totalCount }, (_, idx) => {
      const base = rows[idx] ? extractRowData(rows[idx], idx) : null;
      const seed = (idx * 7 + 3) % 10;

      const amtTally = base?.amtTally || Math.floor(50000 + ((idx * 73841) % 850000));
      const venTally = base?.venTally || VENDORS[idx % VENDORS.length];
      const id       = base?.id   || `INV-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`;
      const date     = base?.date || new Date(Date.now() - idx * 86400000).toLocaleDateString('en-IN');

      let status, score, amtDoc, venDoc;

      if (seed < 3) {
        // FRAUD — amount tampered ± vendor
        amtDoc  = Math.round(amtTally * (1.05 + seed * 0.04));
        venDoc  = seed < 1 ? FAKE_VENDORS[idx % FAKE_VENDORS.length] : venTally;
        status  = 'fraud';
        score   = Math.floor(15 + seed * 10);
      } else if (seed < 5) {
        // PARTIAL — small difference
        amtDoc  = Math.round(amtTally * (1.01 + seed * 0.005));
        venDoc  = venTally;
        status  = 'partial';
        score   = Math.floor(50 + seed * 5);
      } else {
        // MATCH — identical
        amtDoc  = amtTally;
        venDoc  = venTally;
        status  = 'match';
        score   = Math.floor(90 + seed);
      }

      return { id, date, amtTally, amtDoc, venTally, venDoc, status, score, reviewed: false };
    });
  };

  /* ── Start processing ───────────────────────────────── */
  const startProcessing = () => {
    if (!selectedOutlet) { alert('Please select a dealership outlet first.'); return; }
    if (!tallyFile && scannedFiles.length === 0) { alert('Please upload at least one file.'); return; }

    setIsProcessing(true);
    setProgress(0);

    const runAnalysis = (csvRows = []) => {
      let pct = 0;
      const results = generateResults(csvRows, scannedFiles.length);

      const timer = setInterval(() => {
        pct += Math.random() * 18 + 5;
        if (pct >= 100) {
          clearInterval(timer);
          setProgress(100);
          setTimeout(() => {
            navigate('/results', {
              state: {
                data: results,
                outlet: selectedOutlet,
                uploadDate: new Date().toLocaleDateString('en-IN'),
              },
            });
          }, 600);
        } else {
          setProgress(Math.min(pct, 99));
        }
      }, 350);
    };

    if (tallyFile) {
      const reader = new FileReader();
      reader.onload  = (e) => { try { runAnalysis(parseCSV(e.target.result)); } catch { runAnalysis([]); } };
      reader.onerror = ()  => runAnalysis([]);
      reader.readAsText(tallyFile);
    } else {
      runAnalysis([]);
    }
  };

  /* ── Processing screen ──────────────────────────────── */
  if (isProcessing) {
    return (
      <div className="processing-container">
        <div className="processing-card">
          <h2>Analyzing Documents</h2>
          <p>Cross-referencing Tally data with scanned invoices...</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-text">{Math.round(progress)}% Complete</p>
          <ul className="processing-steps">
            <li className={progress > 20 ? 'completed' : ''}><CheckCircle size={16} /> Reading Tally Export</li>
            <li className={progress > 50 ? 'completed' : ''}><CheckCircle size={16} /> Performing OCR on Scans</li>
            <li className={progress > 80 ? 'completed' : ''}><CheckCircle size={16} /> Running Fraud Detection AI</li>
          </ul>
        </div>
      </div>
    );
  }

  /* ── Upload form ────────────────────────────────────── */
  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Upload Documents</h1>
        <p>Upload your Tally export and corresponding invoice scans for verification.</p>
      </div>

      {/* Outlet selector */}
      <div className="card outlet-selector-container">
        <div className="outlet-selector-header">
          <MapPin size={20} className="text-secondary" />
          <label htmlFor="outlet-select">Select Dealership Outlet</label>
        </div>
        <select id="outlet-select" className="outlet-select" value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)}>
          <option value="" disabled>Choose an outlet...</option>
          <option value="tata-rajkot">TATA Motors - Rajkot</option>
          <option value="tata-delhi">TATA Motors - Delhi South</option>
          <option value="mg-ahmedabad">MG Motors - Ahmedabad</option>
          <option value="toyota-surat">Toyota - Surat</option>
          <option value="hyundai-mumbai">Hyundai - Mumbai West</option>
        </select>
      </div>

      {/* Upload grid */}
      <div className="upload-grid">
        {/* Section A – Tally */}
        <div className="card upload-section">
          <div className="section-header">
            <div className="icon-badge blue"><FileSpreadsheet size={24} /></div>
            <h2>Section A: Tally Export</h2>
            <p>Upload Excel (.xlsx) or CSV export from TallyPrime</p>
          </div>
          <div className="drop-zone">
            <UploadIcon size={32} className="drop-icon" />
            <p>Drag and drop your file here, or click to browse</p>
            <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleTallyUpload} className="file-input" />
          </div>
          {tallyFile && (
            <div className="file-preview">
              <FileSpreadsheet size={20} />
              <span>{tallyFile.name}</span>
            </div>
          )}
        </div>

        {/* Section B – Scanned docs */}
        <div className="card upload-section">
          <div className="section-header">
            <div className="icon-badge blue"><FileImage size={24} /></div>
            <h2>Section B: Scanned Documents</h2>
            <p>Upload or scan JPG / PDF invoices</p>
          </div>
          <div className="drop-zone">
            <UploadIcon size={32} className="drop-icon" />
            <p>Drag and drop multiple files here, or click to browse</p>
            <input type="file" accept="image/*,.pdf" multiple onChange={handleScannedUpload} className="file-input" />
          </div>
          <div className="camera-section">
            <div className="divider"><span>OR</span></div>
            <button className={`btn-primary camera-btn ${isCameraActive ? 'scanning' : ''}`} onClick={simulateCameraScan} disabled={isCameraActive}>
              <Camera size={20} />
              {isCameraActive ? 'Scanning Document...' : 'Use Mobile Camera Scan'}
            </button>
            {isCameraActive && (
              <div className="camera-viewfinder">
                <div className="scan-line" />
                <p>Position document in frame...</p>
              </div>
            )}
          </div>
          {scannedFiles.length > 0 && (
            <div className="file-preview-list">
              {scannedFiles.map((file, idx) => (
                <div key={idx} className="file-preview">
                  <FileImage size={20} />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="upload-actions">
        <button className="btn-primary process-btn" onClick={startProcessing} disabled={!tallyFile && scannedFiles.length === 0}>
          Start Fraud Analysis
        </button>
      </div>
    </div>
  );
};

export default Upload;

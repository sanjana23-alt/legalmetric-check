import { useState, useRef } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  ScanLine,
  History,
  FileText,
  Settings,
  LogOut,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  IndianRupee,
  CalendarDays,
  Scale,
  MapPin,
  Phone,
  Search,
  Bell,
  User,
  Menu,
  X,
  Download,
  RefreshCcw,
  Camera,
} from "lucide-react";

import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      setLoggedIn(true);
    } else {
      alert("Please enter email and password.");
    }
  };

  const logout = () => {
    setLoggedIn(false);
    setActivePage("dashboard");
    setSelectedFile(null);
    setPreview(null);
    setScanResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setScanResult(null);
  };

  const handleScan = async () => {
    if (!selectedFile) {
      alert("Please capture or upload a product image first.");
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();

      // "image" must match upload.single("image") in server.js
      formData.append("image", selectedFile);

      const response = await fetch(`${API_URL}/scan`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Backend returned ${response.status}: ${text}`);
      }

      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      console.error("Scan error:", error);
      alert("Scan failed: " + error.message);
    } finally {
      setScanning(false);
    }
  };

  /* ---------------- LOGIN SCREEN ---------------- */

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-background-shape shape-one"></div>
        <div className="login-background-shape shape-two"></div>

        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">
              <ShieldCheck size={32} />
            </div>

            <div>
              <h1>LegalMetricCheck</h1>
              <p>Legal Metrology Compliance Platform</p>
            </div>
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Sign in to inspect packaged commodities.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label>Email</label>

            <div className="input-wrapper">
              <User size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label>Password</label>

            <div className="input-wrapper">
              <ShieldCheck size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <button type="button" className="forgot">
                Forgot password?
              </button>
            </div>

            <button className="primary-button login-button">Sign In</button>
          </form>

          <div className="login-footer">
            <ShieldCheck size={17} />
            <span>Government Compliance Inspection System</span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN APP ---------------- */

  return (
    <div className="app-layout">
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon small">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2>LegalMetric</h2>
            <span>Compliance</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="sidebar-section-title">MAIN MENU</div>

        <nav>
          <SidebarButton
            icon={<LayoutDashboard size={19} />}
            text="Dashboard"
            active={activePage === "dashboard"}
            onClick={() => {
              setActivePage("dashboard");
              setMobileMenu(false);
            }}
          />

          <SidebarButton
            icon={<ScanLine size={19} />}
            text="Scan Product"
            active={activePage === "scan"}
            onClick={() => {
              setActivePage("scan");
              setMobileMenu(false);
            }}
          />

          <SidebarButton
            icon={<History size={19} />}
            text="Scan History"
            active={activePage === "history"}
            onClick={() => {
              setActivePage("history");
              setMobileMenu(false);
            }}
          />

          <SidebarButton
            icon={<FileText size={19} />}
            text="Reports"
            active={activePage === "reports"}
            onClick={() => {
              setActivePage("reports");
              setMobileMenu(false);
            }}
          />
        </nav>

        <div className="sidebar-section-title">SYSTEM</div>

        <nav>
          <SidebarButton
            icon={<Settings size={19} />}
            text="Settings"
            active={activePage === "settings"}
            onClick={() => {
              setActivePage("settings");
              setMobileMenu(false);
            }}
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">I</div>

            <div className="user-info">
              <strong>Inspector</strong>
              <span>Authorized User</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={23} />
          </button>

          <div className="breadcrumb">
            <span>LegalMetricCheck</span>
            <span>/</span>

            <strong>
              {activePage === "dashboard"
                ? "Dashboard"
                : activePage === "scan"
                ? "Scan Product"
                : activePage === "history"
                ? "Scan History"
                : activePage === "reports"
                ? "Reports"
                : "Settings"}
            </strong>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="topbar-user">
              <div className="user-avatar">I</div>

              <div>
                <strong>Inspector</strong>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "dashboard" && (
            <Dashboard setActivePage={setActivePage} />
          )}

          {activePage === "scan" && (
            <ScanPage
              preview={preview}
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
              handleScan={handleScan}
              scanning={scanning}
              scanResult={scanResult}
              setSelectedFile={setSelectedFile}
              setPreview={setPreview}
              setScanResult={setScanResult}
            />
          )}

          {activePage === "history" && <HistoryPage />}

          {activePage === "reports" && <ReportsPage />}

          {activePage === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   SIDEBAR BUTTON
===================================================== */

function SidebarButton({ icon, text, active, onClick }) {
  return (
    <button
      className={`sidebar-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard({ setActivePage }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INSPECTION OVERVIEW</div>

          <h1>Compliance Dashboard</h1>

          <p>
            Monitor packaged commodity inspections under Legal Metrology
            regulations.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setActivePage("scan")}
        >
          <ScanLine size={18} />
          Scan New Product
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Package />}
          title="Total Scans"
          value="128"
          change="+12.5%"
          text="this month"
        />

        <StatCard
          icon={<CheckCircle2 />}
          title="Compliant"
          value="104"
          change="+8.2%"
          text="this month"
        />

        <StatCard
          icon={<XCircle />}
          title="Non-Compliant"
          value="17"
          change="-4.1%"
          text="this month"
          danger
        />

        <StatCard
          icon={<AlertTriangle />}
          title="Needs Review"
          value="07"
          change="3 pending"
          text="manual verification"
          warning
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel quick-scan-panel">
          <div className="panel-header">
            <div>
              <h3>Quick Product Scan</h3>
              <p>Capture or upload a package image.</p>
            </div>

            <ScanLine size={22} />
          </div>

          <div
            className="dashboard-scan-box"
            onClick={() => setActivePage("scan")}
          >
            <div className="upload-icon">
              <Camera size={27} />
            </div>

            <h3>Start a new inspection</h3>

            <p>
              Capture an image using your camera or upload a product label.
            </p>

            <button className="secondary-button">Open Scanner</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Compliance Summary</h3>
              <p>Current inspection distribution</p>
            </div>
          </div>

          <div className="compliance-chart">
            <div className="donut">
              <div>
                <strong>81%</strong>
                <span>Compliant</span>
              </div>
            </div>

            <div className="chart-legend">
              <LegendItem label="Compliant" value="104" className="green" />
              <LegendItem label="Non-Compliant" value="17" className="red" />
              <LegendItem label="Needs Review" value="7" className="yellow" />
            </div>
          </div>
        </div>
      </div>

      <div className="panel recent-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Inspections</h3>
            <p>Latest products scanned by inspectors</p>
          </div>

          <button
            className="text-button"
            onClick={() => setActivePage("history")}
          >
            View all
          </button>
        </div>

        <InspectionTable />
      </div>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ icon, title, value, change, text, danger, warning }) {
  return (
    <div className="stat-card">
      <div
        className={`stat-icon ${
          danger ? "danger" : warning ? "warning" : ""
        }`}
      >
        {icon}
      </div>

      <div className="stat-content">
        <span>{title}</span>

        <strong>{value}</strong>

        <small
          className={
            danger
              ? "danger-text"
              : warning
              ? "warning-text"
              : "success-text"
          }
        >
          {change} <em>{text}</em>
        </small>
      </div>
    </div>
  );
}

/* =====================================================
   LEGEND
===================================================== */

function LegendItem({ label, value, className }) {
  return (
    <div className="legend-item">
      <span className={`legend-dot ${className}`}></span>

      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

/* =====================================================
   SCAN PAGE
===================================================== */

function ScanPage({
  preview,
  selectedFile,
  handleFileChange,
  handleScan,
  scanning,
  scanResult,
  setSelectedFile,
  setPreview,
  setScanResult,
}) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error(error);
      alert(
        "Camera access was denied or is not available. Please allow camera permission."
      );
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    setCameraStream(null);
    setCameraOpen(false);
  };

  const captureProduct = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `product-scan-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setScanResult(null);

        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const retake = () => {
    setSelectedFile(null);
    setPreview(null);
    setScanResult(null);
    openCamera();
  };

  return (
    <div>
      {/* PAGE HEADING */}

      <div className="page-heading">
        <div>
          <div className="eyebrow">PRODUCT INSPECTION</div>

          <h1>Scan Product</h1>

          <p>
            Capture or upload a product image and automatically check
            mandatory declarations.
          </p>
        </div>
      </div>

      {/* SCANNER AREA */}

      <div className="scan-layout">
        {/* LEFT SCANNER */}

        <div className="panel upload-panel">
          <div className="panel-header">
            <div>
              <h3>Product Scanner</h3>
              <p>Use your camera to capture the product label.</p>
            </div>

            <ScanLine size={22} />
          </div>

          {!preview && !cameraOpen && (
            <div className="scanner-choice">
              {/* CAMERA */}

              <button
                type="button"
                className="scanner-option"
                onClick={openCamera}
              >
                <div className="scanner-option-icon">
                  <span>📷</span>
                </div>

                <h3>Open Camera</h3>

                <p>Use your laptop or phone camera</p>
              </button>

              <div className="scanner-divider">
                <span></span>
                <strong>OR</strong>
                <span></span>
              </div>

              {/* UPLOAD */}

              <label className="scanner-option upload-option">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />

                <div className="scanner-option-icon">
                  <Upload size={30} />
                </div>

                <h3>Upload Image</h3>

                <p>JPG, JPEG or PNG</p>
              </label>
            </div>
          )}

          {/* CAMERA */}

          {cameraOpen && (
            <div className="camera-container">
              <div className="camera-view">
                <video ref={videoRef} autoPlay playsInline muted />

                <div className="camera-frame">
                  <span className="corner top-left"></span>
                  <span className="corner top-right"></span>
                  <span className="corner bottom-left"></span>
                  <span className="corner bottom-right"></span>

                  <div className="scan-line"></div>
                </div>

                <div className="camera-message">
                  Position the product label inside the frame
                </div>
              </div>

              <div className="camera-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCamera}
                >
                  <X size={18} />
                  Close Camera
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={captureProduct}
                >
                  <ScanLine size={19} />
                  Capture Product
                </button>
              </div>
            </div>
          )}

          {/* CAPTURED IMAGE */}

          {preview && !cameraOpen && (
            <div className="captured-product">
              <div className="captured-image-wrapper">
                <div className="captured-badge">
                  <CheckCircle2 size={15} />
                  Image Captured
                </div>

                <img
                  src={preview}
                  alt="Captured product"
                  className="captured-image"
                />
              </div>

              <div className="file-info">
                <div>
                  <strong>{selectedFile?.name}</strong>

                  <span>
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : ""}
                  </span>
                </div>

                <button
                  className="remove-button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setScanResult(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="scanner-bottom-actions">
                <button
                  className="secondary-button retake-button"
                  onClick={retake}
                  disabled={scanning}
                >
                  <RefreshCcw size={18} />
                  Retake
                </button>

                <button
                  className="primary-button scan-button"
                  onClick={handleScan}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <RefreshCcw className="spin" size={19} />
                      Analyzing Product...
                    </>
                  ) : (
                    <>
                      <ScanLine size={19} />
                      Scan & Check Compliance
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}

        <div className="panel scan-info-panel">
          <div className="panel-header">
            <div>
              <h3>How it works</h3>
              <p>Automated compliance inspection pipeline</p>
            </div>
          </div>

          <ProcessStep
            number="01"
            title="Capture Product"
            text="Use the camera to capture a clear image of the product label."
          />

          <ProcessStep
            number="02"
            title="Image Processing"
            text="The captured image is cleaned and prepared for analysis."
          />

          <ProcessStep
            number="03"
            title="OCR Extraction"
            text="Text is extracted from the label using Optical Character Recognition."
          />

          <ProcessStep
            number="04"
            title="Field Detection"
            text="MRP, quantity, date, manufacturer and other declarations are identified."
          />

          <ProcessStep
            number="05"
            title="Compliance Check"
            text="Extracted information is compared against applicable Legal Metrology rules."
          />

          <ProcessStep
            number="06"
            title="Inspection Report"
            text="The system generates a clear compliance result for the inspector."
          />
        </div>
      </div>

      {/* SCANNING */}

      {scanning && (
        <div className="panel scanning-panel">
          <div className="scanner-animation">
            <ScanLine size={35} />
          </div>

          <div>
            <h3>Analyzing product label...</h3>

            <p>
              OCR is extracting declarations and checking compliance rules.
            </p>
          </div>
        </div>
      )}

      {/* RESULT */}

      {scanResult && !scanning && (
        <ComplianceResult
          result={scanResult}
          onRetake={() => {
            setSelectedFile(null);
            setPreview(null);
            setScanResult(null);
          }}
        />
      )}
    </div>
  );
}

/* =====================================================
   PROCESS STEP
===================================================== */

function ProcessStep({ number, title, text }) {
  return (
    <div className="process-step">
      <div className="process-number">{number}</div>

      <div>
        <strong>{title}</strong>

        <p>{text}</p>
      </div>
    </div>
  );
}

/* =====================================================
   COMPLIANCE RESULT
===================================================== */

function ComplianceResult({ result, onRetake }) {
  return (
    <div className="result-section">
      <div className="result-header">
        <div>
          <div className="eyebrow">INSPECTION RESULT</div>

          <h2>Compliance Analysis</h2>

          <p>Automated analysis completed successfully.</p>
        </div>

        <button className="secondary-button">
          <Download size={18} />
          Download Report
        </button>
      </div>

      {result.lowQuality && (
        <div
          className="panel"
          style={{
            background: "#3a2a1a",
            border: "1px solid #E8A93A",
            padding: "20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <AlertTriangle size={28} color="#E8A93A" />

          <div style={{ flex: 1 }}>
            <strong style={{ color: "#E8A93A", fontSize: "15px" }}>
              Image quality too low for reliable analysis
            </strong>

            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#ccc" }}>
              The photo appears blurry, dark, or the label isn't clearly
              visible. Retake in good lighting with the label filling the
              frame for accurate results.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={onRetake}
            style={{ width: "auto", whiteSpace: "nowrap" }}
          >
            <RefreshCcw size={18} />
            Retake Photo
          </button>
        </div>
      )}

      <div className="result-summary">
        <div className="result-status">
          <div
            className="status-circle"
            style={{
              color:
                result.status === "Compliant"
                  ? "#2E6B4F"
                  : result.status === "Needs Review"
                  ? "#E8A93A"
                  : "#DC4C4C",
            }}
          >
            {result.status === "Compliant" ? (
              <CheckCircle2 size={40} />
            ) : result.status === "Needs Review" ? (
              <AlertTriangle size={40} />
            ) : (
              <XCircle size={40} />
            )}
          </div>

          <div>
            <span>OVERALL STATUS</span>

            <h2>{result.status}</h2>

            <p>
              {result.status === "Compliant"
                ? "All mandatory declarations detected and verified."
                : result.status === "Needs Review"
                ? "Some declarations had low OCR confidence and need manual verification."
                : "One or more mandatory declarations could not be verified."}
            </p>
          </div>
        </div>

        <div className="confidence">
          <span>OCR CONFIDENCE</span>

          <strong>{result.confidence}</strong>

          <div className="confidence-bar">
            <div style={{ width: result.confidence }}></div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <DetailCard
          icon={<Package />}
          label="Commodity"
          value={result.productName}
        />

        <DetailCard
          icon={<IndianRupee />}
          label="Maximum Retail Price"
          value={result.mrp}
        />

        <DetailCard
          icon={<Scale />}
          label="Net Quantity"
          value={result.netQuantity}
        />

        <DetailCard
          icon={<CalendarDays />}
          label="Date of Packing"
          value={result.packedDate}
        />

        <DetailCard
          icon={<MapPin />}
          label="Manufacturer"
          value={result.manufacturer}
        />

        <DetailCard
          icon={<Phone />}
          label="Consumer Care"
          value={result.consumerCare}
        />
      </div>

      <div className="panel compliance-checks">
        <div className="panel-header">
          <div>
            <h3>Declaration Compliance</h3>

            <p>Individual checks performed on the product label.</p>
          </div>
        </div>

        <div className="checks-list">
          {(result.checks || []).map((check, index) => (
            <div className="check-row" key={index}>
              <div className="check-left">
                <div className="check-icon">
                  {check.status === "pass" ? (
                    <CheckCircle2 size={19} color="#2E6B4F" />
                  ) : check.status === "review" ? (
                    <AlertTriangle size={19} color="#E8A93A" />
                  ) : (
                    <XCircle size={19} color="#DC4C4C" />
                  )}
                </div>

                <div>
                  <strong>{check.name}</strong>

                  <span>{check.value}</span>

                  {check.status === "review" && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#E8A93A",
                        marginTop: "3px",
                      }}
                    >
                      OCR confidence: {check.confidence}% — needs manual
                      verification
                    </div>
                  )}
                </div>
              </div>

              <span
                className={`status-badge ${
                  check.status === "pass"
                    ? "status-compliant"
                    : check.status === "review"
                    ? "status-warning"
                    : "status-danger"
                }`}
              >
                {check.status === "pass"
                  ? "PASS"
                  : check.status === "review"
                  ? "REVIEW"
                  : "FAIL"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   DETAIL CARD
===================================================== */

function DetailCard({ icon, label, value }) {
  return (
    <div className="detail-card">
      <div className="detail-icon">{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =====================================================
   HISTORY
===================================================== */

function HistoryPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INSPECTION RECORDS</div>

          <h1>Scan History</h1>

          <p>View and manage previous product compliance inspections.</p>
        </div>

        <button className="secondary-button">
          <Download size={18} />
          Export Records
        </button>
      </div>

      <div className="history-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input placeholder="Search products, batch numbers..." />
        </div>

        <select>
          <option>All Results</option>
          <option>Compliant</option>
          <option>Non-Compliant</option>
          <option>Needs Review</option>
        </select>
      </div>

      <div className="panel">
        <InspectionTable />
      </div>
    </div>
  );
}

/* =====================================================
   TABLE
===================================================== */

function InspectionTable() {
  const data = [
    {
      product: "Premium Basmati Rice",
      batch: "BR20260618",
      date: "24 Aug 2026",
      status: "Compliant",
      inspector: "Inspector",
    },
    {
      product: "Organic Wheat Flour",
      batch: "WF20260812",
      date: "23 Aug 2026",
      status: "Compliant",
      inspector: "Inspector",
    },
    {
      product: "Packaged Cooking Oil",
      batch: "CO20260804",
      date: "22 Aug 2026",
      status: "Non-Compliant",
      inspector: "Inspector",
    },
    {
      product: "Premium Sugar",
      batch: "SG20260729",
      date: "21 Aug 2026",
      status: "Needs Review",
      inspector: "Inspector",
    },
  ];

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>BATCH NUMBER</th>
            <th>DATE</th>
            <th>INSPECTOR</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="product-name">
                  <div className="mini-product-icon">
                    <Package size={17} />
                  </div>

                  <strong>{item.product}</strong>
                </div>
              </td>

              <td>{item.batch}</td>

              <td>{item.date}</td>

              <td>{item.inspector}</td>

              <td>
                <span
                  className={`status-badge ${
                    item.status === "Compliant"
                      ? "status-compliant"
                      : item.status === "Non-Compliant"
                      ? "status-danger"
                      : "status-warning"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              <td>
                <button className="table-action">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   REPORTS
===================================================== */

function ReportsPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DOCUMENT CENTER</div>

          <h1>Reports</h1>

          <p>Generated compliance reports from product inspections.</p>
        </div>
      </div>

      <div className="reports-grid">
        <ReportCard
          title="Premium Basmati Rice"
          batch="BR20260618"
          date="24 Aug 2026"
          status="Compliant"
        />

        <ReportCard
          title="Organic Wheat Flour"
          batch="WF20260812"
          date="23 Aug 2026"
          status="Compliant"
        />

        <ReportCard
          title="Packaged Cooking Oil"
          batch="CO20260804"
          date="22 Aug 2026"
          status="Non-Compliant"
        />
      </div>
    </div>
  );
}

/* =====================================================
   REPORT CARD
===================================================== */

function ReportCard({ title, batch, date, status }) {
  return (
    <div className="report-card">
      <div className="report-icon">
        <FileText size={25} />
      </div>

      <div className="report-content">
        <h3>{title}</h3>

        <span>Batch: {batch}</span>

        <span>{date}</span>
      </div>

      <span
        className={`status-badge ${
          status === "Compliant" ? "status-compliant" : "status-danger"
        }`}
      >
        {status}
      </span>

      <button className="download-report">
        <Download size={17} />
      </button>
    </div>
  );
}

/* =====================================================
   SETTINGS
===================================================== */

function SettingsPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SYSTEM CONFIGURATION</div>

          <h1>Settings</h1>

          <p>Manage your inspection system preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel settings-panel">
          <h3>Inspector Profile</h3>

          <div className="settings-field">
            <label>Name</label>
            <input value="Inspector" readOnly />
          </div>

          <div className="settings-field">
            <label>Role</label>
            <input value="Authorized Inspector" readOnly />
          </div>

          <div className="settings-field">
            <label>Email</label>
            <input value="inspector@legalmetric.gov" readOnly />
          </div>

          <button className="primary-button">Save Changes</button>
        </div>

        <div className="panel settings-panel">
          <h3>Compliance Engine</h3>

          <div className="setting-row">
            <div>
              <strong>OCR Analysis</strong>
              <span>Automatically extract text from images</span>
            </div>

            <div className="toggle active"></div>
          </div>

          <div className="setting-row">
            <div>
              <strong>Compliance Rules</strong>
              <span>Check mandatory declarations</span>
            </div>

            <div className="toggle active"></div>
          </div>

          <div className="setting-row">
            <div>
              <strong>Confidence Alerts</strong>
              <span>Flag low-confidence OCR results</span>
            </div>

            <div className="toggle active"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
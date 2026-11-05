import { useState } from "react";

const FIELD_ORDER = [
  "net_quantity",
  "mrp",
  "mfg_date",
  "manufacturer_address",
  "customer_care",
  "country_of_origin",
];

export default function ScanReport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setReport(null);
    setError(null);
  }

  async function handleScan() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/scan", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Scan failed");
      } else {
        setReport(data);
      }
    } catch (err) {
      setError("Could not reach backend. Is server.js running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Scan a Product Label</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ maxWidth: "100%", marginTop: 12, borderRadius: 4 }}
        />
      )}

      <button
        onClick={handleScan}
        disabled={!file || loading}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          background: "#1C2B3A",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: file && !loading ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Scanning..." : "Run Compliance Scan"}
      </button>

      {error && (
        <p style={{ color: "#A6392F", marginTop: 12 }}>{error}</p>
      )}

      {report && (
        <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 4, padding: 16 }}>
          <h3>
            Verdict:{" "}
            <span style={{ color: report.verdict === "pass" ? "#2E6B4F" : "#A6392F" }}>
              {report.verdict === "pass" ? "COMPLIANT" : "NON-COMPLIANT"}
            </span>{" "}
            ({report.score}/{report.max_score})
          </h3>

          {FIELD_ORDER.map((key) => {
            const f = report.fields[key];
            if (!f) return null;
            const color =
              f.status === "pass" ? "#2E6B4F" : f.status === "review" ? "#AD8A4A" : "#A6392F";
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px dotted #ddd",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {f.value || <em style={{ color: "#A6392F" }}>Not found</em>}
                  </div>
                  {f.confidence !== null && (
                    <div style={{ fontSize: 11, color: "#999" }}>
                      OCR confidence: {f.confidence}%
                    </div>
                  )}
                </div>
                <span
                  style={{
                    alignSelf: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color,
                  }}
                >
                  {f.status === "review" ? "Needs Review" : f.status}
                </span>
              </div>
            );
          })}

          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: "pointer", fontSize: 13 }}>Raw OCR text</summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#555" }}>
              {report.raw_text}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
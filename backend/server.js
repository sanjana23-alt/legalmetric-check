const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.json({ message: "Backend is running successfully!" });
});

// ---------------------------------------------------------------
// Run tesseract and get back word-level text + confidence scores
// ---------------------------------------------------------------
function runTesseractWithConfidence(imagePath) {
  return new Promise((resolve, reject) => {
    const tsvBase = imagePath.replace(/\.[^/.]+$/, "") + "_tsv";
    exec(`tesseract "${imagePath}" "${tsvBase}" tsv`, (err) => {
      if (err) return reject(err);

      const tsv = fs.readFileSync(`${tsvBase}.tsv`, "utf-8");
      const lines = tsv.trim().split("\n").slice(1);

      const words = lines
        .map((line) => {
          const cols = line.split("\t");
          return { text: cols[11], confidence: parseFloat(cols[10]) };
        })
        .filter((w) => w.text && w.text.trim() !== "" && !isNaN(w.confidence));

      const fullText = words.map((w) => w.text).join(" ");
      fs.unlink(`${tsvBase}.tsv`, () => {});

      resolve({ words, fullText });
    });
  });
}

function confidenceForMatch(words, matchedText) {
  if (!matchedText) return null;
  const matchWords = matchedText.trim().split(/\s+/);
  const relevant = words.filter((w) =>
    matchWords.some((mw) =>
      w.text.toLowerCase().includes(mw.toLowerCase().replace(/[^\w]/g, ""))
    )
  );
  if (relevant.length === 0) return null;
  const avg = relevant.reduce((sum, w) => sum + w.confidence, 0) / relevant.length;
  return Math.round(avg * 10) / 10;
}

const CONFIDENCE_THRESHOLD = 95;

function statusFor(value, confidence) {
  if (!value) return "fail";
  if (confidence !== null && confidence < CONFIDENCE_THRESHOLD) return "review";
  return "pass";
}

// ---------------------------------------------------------------
// Field extraction — regex rules against Legal Metrology Rule 6
// ---------------------------------------------------------------
function extractFields(fullText, words) {
  const fields = {};

  // Net Quantity (handles common OCR g/9 confusion)
  let m = fullText.match(/(\d+\.?\d*)\s*(ml|l|kg|gm|g|9)\b/i);
  let netQtyValue = null;
  if (m) {
    let unit = m[2].toLowerCase() === "9" ? "g" : m[2];
    netQtyValue = `${m[1]} ${unit}`;
  }
  fields.net_quantity = {
    value: netQtyValue,
    confidence: confidenceForMatch(words, m ? m[0] : null),
  };

  // MRP
  m = fullText.match(/(?:MRP|M\.R\.P\.?|Rs\.?|₹)[\s:]*([\d,]+\.?\d*)/i);
  fields.mrp = {
    value: m ? `Rs. ${m[1]}` : null,
    confidence: confidenceForMatch(words, m ? m[0] : null),
  };

  // Mfg / packed date (MM/YYYY or MM/YY)
  m = fullText.match(/\b(0[1-9]|1[0-2])\/(\d{2}|\d{4})\b/);
  fields.packed_date = {
    value: m ? m[0] : null,
    confidence: confidenceForMatch(words, m ? m[0] : null),
  };

  // Manufacturer / packer address
  m = fullText.match(
    /(?:Manufactured By|Mfd\.?\s*By|Marketed By|Packed By)[:\s]*(.*?)(?:Marketed By|Customer Care|$)/i
  );
  fields.manufacturer = {
    value: m ? m[1].trim().slice(0, 100) : null,
    confidence: confidenceForMatch(words, m ? m[1].slice(0, 30) : null),
  };

  // Customer care
  m = fullText.match(
    /(?:Customer Care|Consumer Care|Care of)[:\s]*([\d\-+]{6,}|\S+@\S+)/i
  );
  fields.consumer_care = {
    value: m ? m[1] : null,
    confidence: confidenceForMatch(words, m ? m[0] : null),
  };

  return fields;
}

// ---------------------------------------------------------------
// Shape the extracted fields into exactly what ComplianceResult expects
// ---------------------------------------------------------------
function buildFrontendResult(fields, originalFilename) {
  const checkDefs = [
    { key: "net_quantity", name: "Net Quantity" },
    { key: "mrp", name: "Maximum Retail Price" },
    { key: "packed_date", name: "Date of Packing" },
    { key: "manufacturer", name: "Manufacturer / Packer" },
    { key: "consumer_care", name: "Consumer Care" },
  ];

  const checks = checkDefs.map((def) => {
    const f = fields[def.key] || { value: null, confidence: null };
    return {
      name: def.name,
      value: f.value || "Not detected",
      status: statusFor(f.value, f.confidence),
      confidence: f.confidence,
    };
  });

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  let overallStatus;
  if (passCount === checks.length) {
    overallStatus = "Compliant";
  } else if (failCount > 0) {
    overallStatus = "Non-Compliant";
  } else {
    overallStatus = "Needs Review";
  }

  const confValues = checks.map((c) => c.confidence).filter((c) => c !== null);
  const avgConfidence =
    confValues.length > 0
      ? Math.round(confValues.reduce((a, b) => a + b, 0) / confValues.length)
      : 0;

  const lowQuality = confValues.length === 0 || avgConfidence < 20;

  return {
    status: overallStatus,
    confidence: `${avgConfidence}%`,
    lowQuality,
    productName: originalFilename.replace(/\.[^/.]+$/, ""),
    mrp: fields.mrp.value || "Not detected",
    netQuantity: fields.net_quantity.value || "Not detected",
    packedDate: fields.packed_date.value || "Not detected",
    manufacturer: fields.manufacturer.value || "Not detected",
    consumerCare: fields.consumer_care.value || "Not detected",
    checks,
  };
}

// ---------------------------------------------------------------
// Main scan route
// ---------------------------------------------------------------
app.post("/scan", upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image received" });
    }

    const file = req.files[0];
    const processedImage = `uploads/processed-${file.filename}.png`;

    await sharp(file.path)
      .resize({ width: 2000, withoutEnlargement: false })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toFile(processedImage);

    const { words, fullText } = await runTesseractWithConfidence(processedImage);
    const fields = extractFields(fullText, words);
    const result = buildFrontendResult(fields, file.originalname);

    res.json(result); // matches ComplianceResult's expected shape directly
  } catch (error) {
    console.error("SCAN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "OCR processing failed",
      error: error.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
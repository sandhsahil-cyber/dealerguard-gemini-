import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyzes a scanned document image and compares it with Tally records.
 * @param {File} imageFile - The scanned document image.
 * @param {Array} tallyRecords - Array of objects from Tally CSV.
 * @returns {Promise<Object>} Analysis result.
 */
export async function analyzeInvoice(imageFile, tallyRecords) {
  try {
    // Convert file to base64 for Gemini
    const base64Data = await fileToGenerativePart(imageFile);

    const prompt = `
      You are a fraud detection expert for automobile dealerships. 
      I am providing a scanned tax invoice image and a list of Tally ERP records in JSON format.
      
      TASK:
      1. Extract the Invoice Number, Date, Party Name, and Total Amount from the scanned image.
      2. Find the matching record in the provided Tally JSON list by Invoice Number.
      3. Compare the extracted data from the image with the Tally record.
      4. Identify any discrepancies in Amount, Party Name, or Date.
      5. Assign a risk score (0-100) where 100 is high fraud risk.
      6. Return a JSON object with the following fields:
         - invoice_no: String
         - party_name: String (from image)
         - tally_amount: Number (from Tally)
         - doc_amount: Number (from image)
         - match_status: String ('match', 'partial', 'fraud')
         - risk_score: Number
         - fraud_type: String (e.g., 'Amount Mismatch', 'Vendor Discrepancy', 'None')
         - notes: String (Brief explanation of findings)

      TALLY RECORDS:
      ${JSON.stringify(tallyRecords.slice(0, 50))} // Limit context to 50 records for tokens

      If no matching invoice is found in Tally, mark as 'fraud' with notes 'Invoice not found in Tally records'.
    `;

    const result = await model.generateContent([prompt, base64Data]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse Gemini response");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      invoice_no: "Error",
      party_name: "Unknown",
      tally_amount: 0,
      doc_amount: 0,
      match_status: "fraud",
      risk_score: 100,
      fraud_type: "Processing Error",
      notes: error.message
    };
  }
}

async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

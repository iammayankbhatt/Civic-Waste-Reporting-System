const { GoogleGenAI } = require('@google/genai');
const db = require('../config/db');

// Initialize the Google Gen AI SDK using your environment key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.askSummarizer = async (req, res, next) => {
  const { query, textToSummarize } = req.body;

  try {
    // Case 1: Simple single report text summarization request
    if (textToSummarize) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Summarize this civic complaint concisely in one or two short sentences, highlighting the main issue and location if mentioned: "${textToSummarize}"`,
      });
      return res.json({ answer: response.text.trim() });
    }

    // Case 2: Broad data querying ("How many complaints in Dehradun?")
    if (!query) return res.status(400).json({ error: "Provide either a query or text to summarize." });

    // Fetch all current database reports to build context
    const reportsResult = await db.query('SELECT category, description, status, latitude, longitude FROM reports');
    const rawReports = reportsResult.rows;

    // Enhance the dataset with human-readable location addresses using reverse-geocoding
    const enhancedReports = await Promise.all(
      rawReports.map(async (report) => {
        let city = "Unknown";
        let neighborhood = "Unknown";
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${report.latitude}&lon=${report.longitude}`,
            { headers: { 'User-Agent': 'CivicConnect-App' } }
          );
          const geoData = await geoRes.json();
          if (geoData.address) {
            city = geoData.address.city || geoData.address.town || geoData.address.village || "Unknown";
            neighborhood = geoData.address.suburb || geoData.address.neighbourhood || geoData.address.county || "Unknown";
          }
        } catch (e) {
          // Fallback if the geocoder rates out or fails
        }
        return {
          category: report.category,
          description: report.description,
          status: report.status,
          city,
          neighborhood
        };
      })
    );

    // Build the structural prompt context for Gemini
    const systemPrompt = `
You are an expert AI Municipal Analyst for the CivicConnect platform.
Below is the live, real-time JSON data representing all reported civic issues currently filed in the system:
---
${JSON.stringify(enhancedReports, null, 2)}
---
Answer the admin's query accurately using ONLY the data supplied above. 
- If they ask for counts, give exact numbers broken down by status (e.g., "3 reports: 2 resolved, 1 pending").
- If they ask about heavily affected parts of a city, evaluate which 'neighborhood' or 'category' appears most frequently for that city.
- Keep your answers highly concise, direct, and professional. Do not use conversational filler.
- If no data matches their query city, say "No complaints have been recorded for that location."

Admin Query: "${query}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
    });

    res.json({ answer: response.text.trim() });
  } catch (err) {
    next(err);
  }
};
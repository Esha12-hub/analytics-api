import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;

// Initialize GA client with service account credentials
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

export default async function handler(req, res) {
  try {
    // Run GA report for the last 7 days
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }]
    });

    // Return GA response as JSON
    res.status(200).json(response);
  } catch (error) {
    console.error("Analytics API Error:", error);
    res.status(500).json({ error: error.message });
  }
}

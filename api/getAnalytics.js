import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;

// Initialize GA client with service account credentials
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

export default async function handler(req, res) {
  try {
    const { role, writerId } = req.query;

    let dimensions = [{ name: 'date' }];
    let metrics = [{ name: 'activeUsers' }];

    if (role === 'writer' && writerId) {
      // Example: You can filter GA events by writer ID (custom dimension)
      dimensions.push({ name: 'customEvent:writer_id' });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions,
      metrics,
      ...(role === 'writer' && writerId
        ? { dimensionFilter: { filter: { fieldName: 'customEvent:writer_id', stringFilter: { value: writerId } } } }
        : {})
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Analytics API Error:", error);
    res.status(500).json({ error: error.message });
  }
}

import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;

// Initialize GA client with service account credentials
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

export default async function handler(req, res) {
  try {
    // Extract filters from query parameters
    const { dateRange, userRole, platform } = req.query;

    // Default date range mapping
    let startDate = '7daysAgo';
    let endDate = 'today';

    if (dateRange) {
      switch (dateRange) {
        case 'Last 7 Days':
          startDate = '7daysAgo';
          break;
        case 'Last 30 Days':
          startDate = '30daysAgo';
          break;
        case 'Last 90 Days':
          startDate = '90daysAgo';
          break;
        case 'Today':
          startDate = 'today';
          endDate = 'today';
          break;
        default:
          // If frontend sends a custom format like YYYY-MM-DD, split it
          const parts = dateRange.split('_'); // example: 2025-08-01_2025-08-14
          if (parts.length === 2) {
            startDate = parts[0];
            endDate = parts[1];
          }
          break;
      }
    }

    // Build dimension filters dynamically
    const filters = [];

    // IMPORTANT: These fieldName values must match your GA4 dimension names
    if (userRole && userRole !== 'All Users') {
      filters.push({
        filter: {
          fieldName: 'customUserRole', // Replace with your GA4 custom dimension name
          stringFilter: { value: userRole }
        }
      });
    }

    if (platform && platform !== 'All Platforms') {
      filters.push({
        filter: {
          fieldName: 'platform', // This could be 'deviceCategory' or 'operatingSystem' in GA4
          stringFilter: { value: platform }
        }
      });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
      ...(filters.length > 0 && {
        dimensionFilter: {
          andGroup: { expressions: filters }
        }
      })
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

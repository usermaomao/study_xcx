const EBBINGHAUS_INTERVALS = [
  { delay: 5 * 60 * 1000, label: '5 minutes' },        // 5 minutes
  { delay: 30 * 60 * 1000, label: '30 minutes' },       // 30 minutes
  { delay: 12 * 60 * 60 * 1000, label: '12 hours' },     // 12 hours
  { delay: 1 * 24 * 60 * 60 * 1000, label: '1 day' },      // 1 day
  { delay: 2 * 24 * 60 * 60 * 1000, label: '2 days' },     // 2 days
  { delay: 4 * 24 * 60 * 60 * 1000, label: '4 days' },     // 4 days
  { delay: 7 * 24 * 60 * 60 * 1000, label: '7 days' },     // 7 days
  { delay: 15 * 24 * 60 * 60 * 1000, label: '15 days' }    // 15 days
  // Add more intervals if needed, e.g., 1 month, 3 months
];

// Function to generate the initial review schedule for a content item
// For now, it just schedules the very first review.
function generateInitialReviewSchedule(contentItem) {
  if (!contentItem || typeof contentItem.createdAt !== 'number' || !EBBINGHAUS_INTERVALS.length) {
    return []; // Or handle error appropriately
  }
  const firstInterval = EBBINGHAUS_INTERVALS[0];
  return [
    {
      reviewAt: contentItem.createdAt + firstInterval.delay,
      completed: false,
      intervalLabel: firstInterval.label
    }
  ];
}

module.exports = {
  EBBINGHAUS_INTERVALS,
  generateInitialReviewSchedule
};

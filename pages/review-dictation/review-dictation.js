const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    currentChildId: null,
    allItems: [], // All content items for the child
    dueItems: [], // Items due for review in this session
    currentItem: null,
    currentIndex: 0,
    userInput: '',
    showAnswer: false,
    feedback: '', // 'Correct!', 'Incorrect.'
    isLoading: true,
  },

  onLoad: function (options) {
    this.setData({ isLoading: true });
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');

    if (!currentChildId) {
      wx.showModal({
        title: '错误',
        content: '未找到孩子信息，请重新选择。',
        showCancel: false,
        success: () => wx.redirectTo({ url: '/pages/parent-dashboard/parent-dashboard' })
      });
      this.setData({ isLoading: false });
      return;
    }
    this.setData({ currentChildId });
    this.loadAndPrepareReviewItems();
  },

  loadAndPrepareReviewItems: function() {
    const childContent = wx.getStorageSync('content_' + this.data.currentChildId) || { chinese: [], english: [] };
    const allItemsFromStorage = (childContent.chinese || []).concat(childContent.english || []);
    this.setData({ allItems: allItemsFromStorage });

    const now = Date.now();
    let dueItems = allItemsFromStorage.filter(item => {
      if (item.isMastered) return false;
      if (!item.reviewSchedule || item.reviewSchedule.length === 0) return false;
      const nextReview = item.reviewSchedule.find(review => !review.completed);
      return nextReview && nextReview.reviewAt <= now;
    });

    // Shuffle due items
    dueItems.sort(() => Math.random() - 0.5);

    this.setData({
      dueItems: dueItems,
      currentIndex: 0,
      isLoading: false
    });

    if (dueItems.length > 0) {
      this.loadCurrentItem();
    } else {
      this.setData({ currentItem: null }); // Explicitly set to null if no due items
    }
  },

  loadCurrentItem: function () {
    if (this.data.currentIndex < this.data.dueItems.length) {
      this.setData({
        currentItem: this.data.dueItems[this.data.currentIndex],
        userInput: '',
        showAnswer: false,
        feedback: ''
      });
    } else {
      // Session complete
      this.setData({ currentItem: null });
    }
  },

  handleInput: function (e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  submitAnswer: function () {
    if (!this.data.currentItem || this.data.showAnswer) return;

    const item = this.data.currentItem;
    let correctAnswer = '';
    if (item.type === 'chinese') {
      correctAnswer = item.character || item.phrase; // Prefer character if available, else phrase
    } else { // english
      correctAnswer = item.word;
    }

    const userAnswer = this.data.userInput.trim();
    let isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    // For Chinese, consider if strict equality is needed or if some variation is allowed.
    // For now, strict comparison (case-insensitive).

    this.setData({
      feedback: isCorrect ? '正确!' : '错误!',
      showAnswer: true
    });
    this.updateReviewSchedule(isCorrect);
  },

  updateReviewSchedule: function (isCorrect) {
    const currentItemId = this.data.currentItem.id;
    let allItems = JSON.parse(JSON.stringify(this.data.allItems)); // Deep copy to modify
    const itemIndex = allItems.findIndex(i => i.id === currentItemId);

    if (itemIndex === -1) {
      console.error("Error: Could not find item in allItems to update schedule.");
      return;
    }

    let itemToUpdate = allItems[itemIndex];
    itemToUpdate.lastReviewedAt = Date.now();

    // Find the first incomplete review in the schedule
    let reviewIdx = itemToUpdate.reviewSchedule.findIndex(r => !r.completed);

    if (reviewIdx === -1 && !itemToUpdate.isMastered) {
      // This case implies all scheduled items were completed, but item not mastered.
      // This might happen if mastering logic is solely based on learningStage exceeding intervals.
      // Or if an item somehow had its schedule cleared but not mastered.
      // For now, treat as if the learning process needs to restart or advance from current stage.
      // If learningStage is already high, this might mean it needs a new schedule from that stage.
      // If learningStage is 0, it means it needs its first schedule.
      console.warn("Item has no pending reviews but isn't mastered. Stage:", itemToUpdate.learningStage);
      // Fallback: if it has no schedule, try to generate one from current stage.
      if (itemToUpdate.reviewSchedule.length === 0 && itemToUpdate.learningStage < util.EBBINGHAUS_INTERVALS.length) {
         const nextInterval = util.EBBINGHAUS_INTERVALS[itemToUpdate.learningStage];
         itemToUpdate.reviewSchedule.push({
            reviewAt: Date.now() + nextInterval.delay,
            completed: false,
            intervalLabel: nextInterval.label
         });
         reviewIdx = 0; // Point to this newly added schedule
      } else if (itemToUpdate.reviewSchedule.length === 0 && itemToUpdate.learningStage >= util.EBBINGHAUS_INTERVALS.length) {
          itemToUpdate.isMastered = true; // Should be mastered if stage is beyond intervals
      }
    }


    if (isCorrect) {
      if (reviewIdx !== -1) {
        itemToUpdate.reviewSchedule[reviewIdx].completed = true;
      }
      itemToUpdate.learningStage += 1;

      if (itemToUpdate.learningStage >= util.EBBINGHAUS_INTERVALS.length) {
        itemToUpdate.isMastered = true;
        // No more reviews to schedule for this item.
      } else {
        // Schedule next review only if not mastered
        const nextInterval = util.EBBINGHAUS_INTERVALS[itemToUpdate.learningStage];
        itemToUpdate.reviewSchedule.push({
          reviewAt: Date.now() + nextInterval.delay,
          completed: false,
          intervalLabel: nextInterval.label
        });
      }
    } else { // Incorrect
      itemToUpdate.learningStage = 0; // Reset to the beginning
      // Reschedule the current (failed) review for the first interval from now.
      // Or, if no current review was found (reviewIdx === -1), create a new one.
      const firstInterval = util.EBBINGHAUS_INTERVALS[0];
      const newReview = {
          reviewAt: Date.now() + firstInterval.delay,
          completed: false,
          intervalLabel: firstInterval.label
      };
      if (reviewIdx !== -1) { // Update existing pending review
        itemToUpdate.reviewSchedule[reviewIdx] = newReview;
      } else { // Add a new review if none was pending (edge case)
        itemToUpdate.reviewSchedule.push(newReview);
      }
      // Ensure other future reviews are removed if stage is reset
      itemToUpdate.reviewSchedule = itemToUpdate.reviewSchedule.filter((r, idx) => r.completed || idx === reviewIdx || r.reviewAt >= newReview.reviewAt);

    }

    // Update the master list of items and save to storage
    this.setData({ allItems: allItems });
    let childContent = { chinese: [], english: [] };
    allItems.forEach(item => {
      if (item.type === 'chinese') childContent.chinese.push(item);
      else if (item.type === 'english') childContent.english.push(item);
    });
    wx.setStorageSync('content_' + this.data.currentChildId, childContent);
  },

  nextItem: function () {
    this.setData({
      currentIndex: this.data.currentIndex + 1
    });
    if (this.data.currentIndex < this.data.dueItems.length) {
      this.loadCurrentItem();
    } else {
      // End of session
      this.setData({ currentItem: null });
      // Optionally, refresh due items to see if any are immediately due again (e.g. failed items)
      // For now, just end. User can restart from hub.
    }
  },

  goBackToHub: function() {
    wx.navigateBack({ delta: 1 }); // Assumes review-hub is the previous page
  },
  goBackToIndex: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});

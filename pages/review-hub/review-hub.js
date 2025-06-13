const app = getApp();
const util = require('../../utils/util.js'); // For EBBINGHAUS_INTERVALS

Page({
  data: {
    currentChildId: null,
    childName: '',
    dueItems: [],
    isLoading: true,
    // debugDueItems: '' // For debugging
  },

  onShow: function () { // Use onShow to refresh when coming back
    this.setData({ isLoading: true });
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    if (!currentChildId) {
      wx.showModal({
        title: '提示',
        content: '请先选择一个孩子。',
        showCancel: false,
        confirmText: '去选择',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/parent-dashboard/parent-dashboard' });
          } else {
            wx.navigateBack(); // Or wx.switchTab({ url: '/pages/index/index' });
          }
        }
      });
      this.setData({ isLoading: false });
      return;
    }

    const children = wx.getStorageSync('children') || [];
    const currentChild = children.find(c => c.id === currentChildId);

    this.setData({
      currentChildId: currentChildId,
      childName: currentChild ? currentChild.name : '未知孩子'
    });

    this.loadDueItems(currentChildId);
  },

  loadDueItems: function(childId) {
    const childContent = wx.getStorageSync('content_' + childId) || { chinese: [], english: [] };
    const allItems = (childContent.chinese || []).concat(childContent.english || []);
    const now = Date.now();

    const dueItems = allItems.filter(item => {
      if (item.isMastered) return false;
      if (!item.reviewSchedule || item.reviewSchedule.length === 0) return false;

      // Find the first incomplete review
      const nextReview = item.reviewSchedule.find(review => !review.completed);
      if (!nextReview) return false; // All scheduled reviews completed, but not mastered? (Should be handled by mastering logic)

      return nextReview.reviewAt <= now;
    });

    this.setData({
      dueItems: dueItems,
      isLoading: false,
      // debugDueItems: JSON.stringify(dueItems.map(item => ({id: item.id, name: item.word || item.character || item.phrase, schedule: item.reviewSchedule }) ))
    });
  },

  startDictationReview: function () {
    if (this.data.dueItems.length === 0) {
      wx.showToast({
        title: '没有待复习内容',
        icon: 'none'
      });
      return;
    }
    // The review-dictation page will fetch its own items to ensure freshness
    // and handle its own logic if items become "not due" during the session (e.g. time passes)
    wx.navigateTo({
      url: '/pages/review-dictation/review-dictation'
    });
  },

  goToContentHub: function() {
    wx.navigateTo({ url: '/pages/content-hub/content-hub' });
  },

  goBack: function() {
    wx.navigateBack({ delta: 1 }); // Or wx.switchTab({ url: '/pages/index/index' });
  }
});

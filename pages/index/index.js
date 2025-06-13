const app = getApp();

Page({
  data: {
    message: '加载中...',
    chineseCount: 0,
    englishCount: 0,
    currentChildName: ''
  },
  onLoad: function () {
    // onLoad might be too early if app.js onLaunch hasn't finished setting globalData
    // this.updateChildMessage();
  },
  onShow: function() {
    // Use onShow to ensure globalData is potentially updated by app.js
    this.updateChildMessage();
  },
  updateChildMessage: function() {
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    let currentChildName = '';
    let chineseCount = 0;
    let englishCount = 0;
    let message = '';

    if (currentChildId) {
      const children = wx.getStorageSync('children') || [];
      const currentChild = children.find(child => child.id === currentChildId);
      currentChildName = currentChild ? currentChild.name : '未知';

      const childContent = wx.getStorageSync('content_' + currentChildId) || { chinese: [], english: [] };
      chineseCount = childContent.chinese ? childContent.chinese.length : 0;
      englishCount = childContent.english ? childContent.english.length : 0;

      message = `当前孩子: ${currentChildName}`;
      this.setData({
        currentChildName: currentChildName,
        chineseCount: chineseCount,
        englishCount: englishCount,
        message: message
      });
    } else {
      message = '请先在家长控制台选择一个孩子。';
      this.setData({
        currentChildName: '',
        chineseCount: 0,
        englishCount: 0,
        message: message
      });
    }
  },
  goToParentDashboard: function() {
    wx.navigateTo({
      url: '/pages/parent-dashboard/parent-dashboard'
    });
  },
  goToContentHub: function() {
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    if (!currentChildId) {
      wx.showToast({title: '请先选择孩子', icon: 'none'});
      return;
    }
    wx.navigateTo({
      url: '/pages/content-hub/content-hub'
    });
  },
  goToReviewHub: function() {
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    if (!currentChildId) {
      wx.showToast({title: '请先选择孩子开始复习', icon: 'none'});
      return;
    }
     if (this.data.chineseCount === 0 && this.data.englishCount === 0) {
      wx.showToast({title: '当前没有学习内容可复习', icon: 'none'});
      return;
    }
    wx.navigateTo({
      url: '/pages/review-hub/review-hub'
    });
  }
});

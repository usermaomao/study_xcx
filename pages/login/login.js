Page({
  data: {},
  parentLogin: function() {
    wx.setStorageSync('isLoggedIn', true);
    wx.setStorageSync('parentId', 'mockParentId123'); // Simulate setting a parentId
    wx.redirectTo({
      url: '/pages/parent-dashboard/parent-dashboard'
    });
  },
  onLoad: function() {
    // Optional: Check if already logged in and redirect
    // This logic might be better placed in app.js onLaunch or page onShow
    // For now, direct login action will handle redirection.
  }
});

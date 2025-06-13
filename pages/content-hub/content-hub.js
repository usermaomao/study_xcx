Page({
  data: {},
  onLoad: function (options) {
    // Ensure a child is selected
    const app = getApp();
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    if (!currentChildId) {
      wx.showModal({
        title: '提示',
        content: '请先在家长控制台选择一个孩子。',
        showCancel: false,
        confirmText: '去选择',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({ // Changed from redirectTo to navigateTo to allow coming back
              url: '/pages/parent-dashboard/parent-dashboard'
            });
          }
        }
      });
    }
  },
  navigateToPage: function (e) {
    const page = e.currentTarget.dataset.page;
    if (page) {
      wx.navigateTo({
        url: `/pages/${page}/${page}`
      });
    } else {
      wx.showToast({
        title: '页面路径错误',
        icon: 'none'
      });
    }
  }
});

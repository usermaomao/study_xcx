App({
  globalData: {
    currentChildId: null
  },
  onLaunch: function () {
    console.log('App Launch');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    const currentChildId = wx.getStorageSync('currentChildId');
    if (currentChildId) {
      this.globalData.currentChildId = currentChildId;
    }

    // Get current page
    const pages = getCurrentPages();
    const currentPage = pages.length > 0 ? pages[pages.length - 1].route : null;

    if (!isLoggedIn) {
      if (currentPage !== 'pages/login/login') {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    } else {
      // If logged in and somehow on the login page, redirect to dashboard
      if (currentPage === 'pages/login/login') {
        wx.redirectTo({
          url: '/pages/parent-dashboard/parent-dashboard'
        });
      }
    }
  }
});

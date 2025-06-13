const app = getApp();

Page({
  data: {
    currentChildId: null,
    chineseEntries: [],
    englishEntries: []
  },

  onShow: function () { // Use onShow to refresh data when coming back to this page
    this.loadLexiconData();
  },

  loadLexiconData: function() {
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    if (!currentChildId) {
      this.setData({ currentChildId: null, chineseEntries: [], englishEntries: [] });
      // Optional: Show a more prominent message or guide user
      return;
    }

    this.setData({ currentChildId: currentChildId });
    const childContent = wx.getStorageSync('content_' + currentChildId) || { chinese: [], english: [] };
    this.setData({
      chineseEntries: childContent.chinese || [],
      englishEntries: childContent.english || []
    });
  },

  goToParentDashboard: function() {
    wx.navigateTo({ // Can also use switchTab if it becomes a tab bar page
      url: '/pages/parent-dashboard/parent-dashboard'
    });
  },

  goToEntryPage: function(e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'chinese') {
      wx.navigateTo({ url: '/pages/entry-chinese/entry-chinese' });
    } else if (type === 'english') {
      wx.navigateTo({ url: '/pages/entry-english/entry-english' });
    }
  },

  editItem: function (e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    if (type === 'chinese') {
      wx.navigateTo({
        url: `/pages/entry-chinese/entry-chinese?id=${id}&edit=true`
      });
    } else if (type === 'english') {
      wx.navigateTo({
        url: `/pages/entry-english/entry-english?id=${id}&edit=true`
      });
    }
  },

  deleteItem: function (e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    const currentChildId = this.data.currentChildId;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个条目吗？',
      success: (res) => {
        if (res.confirm) {
          let childContent = wx.getStorageSync('content_' + currentChildId) || { chinese: [], english: [] };
          if (type === 'chinese') {
            childContent.chinese = childContent.chinese.filter(item => item.id !== id);
          } else if (type === 'english') {
            childContent.english = childContent.english.filter(item => item.id !== id);
          }
          wx.setStorageSync('content_' + currentChildId, childContent);
          wx.showToast({ title: '删除成功', icon: 'success' });
          this.loadLexiconData(); // Refresh the list
        }
      }
    });
  }
});

Page({
  data: {
    childNameInput: '',
    children: [],
    currentChildId: null
  },

  onLoad: function () {
    const children = wx.getStorageSync('children') || [];
    const currentChildId = wx.getStorageSync('currentChildId') || null;
    this.setData({
      children: children,
      currentChildId: currentChildId
    });
    // Ensure app.globalData is updated if it exists
    const app = getApp();
    if (app.globalData) {
      app.globalData.currentChildId = currentChildId;
    }
  },

  handleChildNameInput: function (e) {
    this.setData({
      childNameInput: e.detail.value
    });
  },

  addChild: function () {
    if (this.data.childNameInput.trim() === '') {
      wx.showToast({
        title: '孩子姓名不能为空',
        icon: 'none'
      });
      return;
    }
    const newChild = {
      id: Date.now(),
      name: this.data.childNameInput.trim()
    };
    const updatedChildren = [...this.data.children, newChild];
    this.setData({
      children: updatedChildren,
      childNameInput: ''
    });
    wx.setStorageSync('children', updatedChildren);
    wx.showToast({
      title: '孩子已添加',
      icon: 'success'
    });
  },

  switchChild: function (e) {
    const childId = e.currentTarget.dataset.id;
    const child = this.data.children.find(c => c.id === childId);
    if (child) {
      this.setData({
        currentChildId: childId
      });
      wx.setStorageSync('currentChildId', childId);
      // Update globalData
      const app = getApp();
      if (app.globalData) {
        app.globalData.currentChildId = childId;
      }
      wx.showToast({
        title: '已切换到 ' + child.name,
        icon: 'none'
      });
    }
  },

  deleteChild: function (e) {
    const childId = e.currentTarget.dataset.id;
    const updatedChildren = this.data.children.filter(c => c.id !== childId);
    this.setData({
      children: updatedChildren
    });
    wx.setStorageSync('children', updatedChildren);
    wx.showToast({
      title: '孩子已删除',
      icon: 'success'
    });

    if (this.data.currentChildId === childId) {
      this.setData({
        currentChildId: null
      });
      wx.removeStorageSync('currentChildId');
      // Update globalData
      const app = getApp();
      if (app.globalData) {
        app.globalData.currentChildId = null;
      }
    }
  },

  navigateToContentHub: function() {
    if (!this.data.currentChildId) {
      wx.showToast({
        title: '请先选择一个孩子',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/content-hub/content-hub'
    });
  }
});

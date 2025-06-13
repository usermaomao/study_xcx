const app = getApp();
// Import functions from util.js
const util = require('../../utils/util.js');

Page({
  data: {
    word: '',
    phonetic: '',
    definition: '',
    example: '',
    editingId: null // To store the id of the item being edited
  },

  onLoad: function (options) {
    if (options.id && options.edit === 'true') {
      const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
      if (currentChildId) {
        const childContent = wx.getStorageSync('content_' + currentChildId) || { chinese: [], english: [] };
        const itemToEdit = childContent.english.find(item => item.id == options.id); // Use == for potential type coercion
        if (itemToEdit) {
          this.setData({
            word: itemToEdit.word,
            phonetic: itemToEdit.phonetic,
            definition: itemToEdit.definition,
            example: itemToEdit.example,
            editingId: itemToEdit.id
          });
        } else {
          wx.showToast({ title: '未找到条目', icon: 'none' });
          wx.navigateBack();
        }
      } else {
        wx.showToast({ title: '无儿童ID', icon: 'none' });
        wx.navigateBack();
      }
    }
  },

  handleInput: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  saveContent: function () {
    const currentChildId = app.globalData.currentChildId || wx.getStorageSync('currentChildId');
    if (!currentChildId) {
      wx.showToast({
        title: '请先选择一个孩子',
        icon: 'none'
      });
      return;
    }

    // Basic validation
    if (!this.data.word.trim()) {
      wx.showToast({ title: '单词不能为空', icon: 'none' });
      return;
    }
    if (!this.data.definition.trim()) {
      wx.showToast({ title: '释义不能为空', icon: 'none' });
      return;
    }

    let childContent = wx.getStorageSync('content_' + currentChildId) || { chinese: [], english: [] };
    const contentData = {
      word: this.data.word.trim(),
      phonetic: this.data.phonetic.trim(),
      definition: this.data.definition.trim(),
      example: this.data.example.trim()
    };

    if (this.data.editingId) {
      // Update existing item
      const itemIndex = childContent.english.findIndex(item => item.id === this.data.editingId);
      if (itemIndex > -1) {
        childContent.english[itemIndex] = { ...childContent.english[itemIndex], ...contentData };
      }
    } else {
      // Add new item
      const createdAt = Date.now();
      const newItem = {
        id: createdAt, // Using createdAt as ID for simplicity
        type: 'english',
        ...contentData,
        createdAt: createdAt,
        learningStage: 0,
        lastReviewedAt: null,
        isMastered: false,
        reviewSchedule: [] // Initialize reviewSchedule
      };
      // Generate initial review schedule
      newItem.reviewSchedule = util.generateInitialReviewSchedule(newItem);

      childContent.english.push(newItem);
    }

    wx.setStorageSync('content_' + currentChildId, childContent);
    wx.showToast({
      title: this.data.editingId ? '更新成功' : '保存成功',
      icon: 'success'
    });

    if (this.data.editingId) {
      this.setData({ editingId: null }); // Clear editingId
      wx.navigateBack(); // Go back to manage lexicon page
    } else {
      // Clear form for next entry
      this.setData({
        word: '',
        phonetic: '',
        definition: '',
        example: ''
      });
    }
  }
});

const app = getApp();
Page({
  data: {
    help: [],
  },
  onLoad: function () {
    this.getHelp();
  },
  getHelp() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'base',
      data: {
        action: 'getHelp',
        version: app.globalData.version
      },
      success: res => {
        this.setData({
          help: res.result
        });
      },
      fail: err => {
        console.error('[云函数] [getHelp] 调用失败', err);
        wx.showToast({
          icon: "none",
          title: '加载失败，请下拉刷新',
          duration: 2000,
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  onPullDownRefresh() {
    this.getHelp();
    wx.stopPullDownRefresh();
  },
  onShareAppMessage() {
    return {
      title: '通话录音,点击体验',
      path: '/pages/index/index'
    }
  },
})
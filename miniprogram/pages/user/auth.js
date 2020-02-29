const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    userInfo: {},
    showGetUserInfo: true,
    showGetPhoneNumber: true,
    showOpenSetting: true,
  },
  onLoad(option) {
    if (option && option.setting) {
      this.setData({
        showGetUserInfo: false,
        showGetPhoneNumber: false,
        showOpenSetting: true
      });
      wx.showToast({
        title: '请点击授权设置开启权限',
        icon: 'none',
        duration: 3000,
      })
    }
  },
  onGetUserInfo: function (e) {
    if (e.detail && e.detail.userInfo) {
      wx.showToast({
        title: '微信登录成功',
        duration: 2000,
      })
      console.log(e.detail.userInfo)
      //app.globalData.userInfo = e.detail.userInfo;
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/user/user',
        })
      }, 2000);
    }
  },
  openSetting() {
    wx.openSetting()
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
    //reload
  }
});

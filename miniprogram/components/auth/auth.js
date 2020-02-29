var app = getApp();
Component({
  properties: {
    isShow: {
      type: Boolean,
      value: false
    }
  },
  data: {
    login:true
  },
  ready: function () {
    // console.log(this.data.buttonEvent,)
  },
  methods: {
    getPhoneNumber(e) {
      var cloudID = e.detail.cloudID;//基础库版本需大于2.7.0 微信版本7.0.10
      if (!cloudID) {
        wx.showToast({
          icon: "none",
          title: '登录失败',
          duration: 3000,
        })
        return;
      }
      var that = this;
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getPhone',
          userPhone: wx.cloud.CloudID(cloudID)
        },
        success: res => {
          var userData = res.result;
          console.log(userData);
          app.globalData.userInfo = userData;
          that.setData({
            isShow: false
          })
          that.triggerEvent('onAuthEvent', userData, {})
        },
        fail: err => {
          console.error('[云函数] [getPhone] 调用失败', err)
          wx.showToast({
            icon: "none",
            title: '登录失败:接口错误',
            duration: 3000,
          })
        }
      })
    },
    login(){
      var that=this
      wx.cloud.callFunction({
        name: 'user',
        data: { action: 'login' },
        success: res => {
          console.log('[云函数] [login] userInfo: ', res.result)
          app.globalData.userInfo = res.result;
          that.setData({
            isShow: false
          })
          that.triggerEvent('onAuthEvent', res.result, {})
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    },
    closeDialog(e) {
      console.log(e)
      this.setData({
        isShow: false
      })
    },
    stopEvent(e){
      console.log(e)
      return;
    }
  }
});
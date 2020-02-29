//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      wx.showToast({
        icon: 'none',
        title: '请更新微信版本',
        duration: 3000,
      })
    } else {
      wx.cloud.init({
        env: 'z-jjfw-jjocf',
        traceUser: true,
      })
    }
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.globalData = { version: 101, location: { name: "", latitude: 30.265551, longitude: 120.153603, city: "杭州市", address: "" } };
    // 登录
    wx.login({
      success: res => {
        // 登录注册接口
        if (res.code) {
          // 调用服务端登录接口，发送 res.code 到服务器端换取 openId, sessionKey, unionId并存入数据库中

        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
    // wx.cloud.callFunction({
    //   name: 'login',
    //   success: res => {
    //     console.log('[云函数] [login] userInfo: ', res.result)
    //     this.globalData.loginInfo=res.result.event.userInfo
    //   },
    //   fail: err => {
    //     console.error('[云函数] [login] 调用失败', err)
    //   }
    // })
    wx.cloud.callFunction({
      name: 'user',
      data: { action: 'login' },
      success: res => {
        console.log('[云函数] [login] userInfo: ', res.result)
        // this.globalData.userInfo = res.result;
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
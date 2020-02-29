import { formatTime } from '../../utils/util'
import { calDistance } from '../../utils/LocationUtils'
const app = getApp();
const chooseLocationPlugin = requirePlugin('chooseLocation');
const KEY = 'ZW4BZ-2DLCS-UX3OS-6I4RU-EO5V3-TOFKU'; //使用在腾讯位置服务申请的key
const referer = '居家服务'; //调用插件的app的名称
const location = JSON.stringify({
  latitude: 39.89631551,
  longitude: 116.323459711
});
let timer = null;
const category = '生活服务,娱乐休闲';
Page({
  data: {
    isShowSetting: false,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    location: app.globalData.location,
    markers: [],
    banner: [{
      id: 0,
      type: 'image',
      url: 'https://7a2d-z-jjfw-jjocf-1300407026.tcb.qcloud.la/service-platform/banner1.bmp'
    }],
    lastRecord: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    this.getBanner();
    this.getLocation();
    this.getLastRecord();
    this.getNearbyRecord();
    this.mapCtx = wx.createMapContext('homeMap');
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  async onShow(){
    wx.showLoading({
      title: '加载中',
    })
    await  this.getLastRecord();
    await  this.getNearbyRecord();
    await wx.hideLoading()
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  getBanner(){
    console.log('sss')
    wx.cloud.callFunction({
      name: 'base',
      data: {
        action: 'getBanner',
        // geo: app.globalData.location,
        // version: app.globalData.version
      },
      success: res => {
        console.log('[云函数] [getBanner] : ', res)
        if (res && res.result && res.result.code == 1) {
          this.setData({
            banner: res.result.data
          });
        }
      },
      fail(res){
        console.log('[云函数] [getBanner] : ', res)
      }
    })
  },
  getLastRecord(location) {
    console.log("ddd")
    const geo = location ? location : app.globalData.location;
    wx.cloud.callFunction({
      name: 'base',
      data: {
        action: 'getLastRecord',
        geo: geo,
        version: app.globalData.version
      },
      success: res => {
        console.log('[云函数] [getLastRecord] : ', res)
        if (res && res.result && res.result.code == 1) {
          let lastRecord = res.result.data;
          lastRecord.forEach((item, index) => {
            item.time = formatTime(item.createTime)
            item.distance = calDistance(item.location, app.globalData.location)
          })
          this.setData({
            lastRecord: lastRecord
          });
        }
      },
      fail(res) {
        console.log('[云函数] [getLastRecord] : ', res)
      }
    })
  },
  getNearbyRecord(location) {
    const geo = location ? location : app.globalData.location;
    wx.cloud.callFunction({
      name: 'base',
      data: {
        action: 'getNearbyRecord',
        geo: geo,
        version: app.globalData.version
      },
      success: res => {
        console.log('[云函数] [getNearbyRecord] : ', res)
        if (res && res.result && res.result.code == 1) {
          let markers = res.result.data;
          // markers.forEach((item, index) => {
          //   item.time = formatTime(item.createTime)
          // })
          this.setData({
            markers: markers
          });
        }
      },fail:(err)=>{
        console.log(err)
      }
    })
  },
  getLocation() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log(res)
        app.globalData.location = res;
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=${KEY}&get_poi=0`,
          success: ret => {
            console.log(ret)
            if (ret && ret.data && ret.data.status == 0) {
              const poi = ret.data.result;
              let location = { name: "", latitude: 30.265551, longitude: 120.153603, city: "杭州市", address: "" };
              location.city = poi.address_component.city;
              location.address = poi.address;
              location.latitude = res.latitude;
              location.longitude = res.longitude;
              that.setData({ location: location });
              app.globalData.location = location;
              that.getLastRecord(location);
              //that.getNearbyRecord(location); //通过mapRegionChange触发
            }
          }
        })
      },
      fail: err => {
        console.log(err);//无权限：getLocation:fail auth deny  || getLocation:fail authorize no response
        if (err && err.errMsg && err.errMsg.includes("auth")) {
          wx.navigateTo({
            url: '/pages/user/auth?setting=true'
          })
        }
      }
    })
  },
  mapRegionChange(e) {
    if (e.type == 'end') {
      this.mapCtx.getCenterLocation({
        success: res => {
          const location = {
            latitude: res.latitude,
            longitude: res.longitude,
          }
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => {
            //this.getLastRecord(location);
            this.getNearbyRecord(location);
          }, 500);
        }
      })
    }
  },
  chooseLocation(e) {
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${KEY}&referer=${referer}`
    });
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/post/detail?id=' + id
    })
  },
  tapMarker(e) {
    console.log(e.markerId);
    const markerId = e.markerId;
    const marker = this.data.markers.find((item) => {
      return item.id == markerId
    })
    const id = marker._id;
    wx.showModal({
      title: '查看求助',
      content: `打开${marker.title || 'TA'}的求助信息？`,
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/post/detail?id=' + id
          })
        }
      }
    })

  },
})

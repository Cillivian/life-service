var app = getApp();
const genDefDate = function () {
  const now = new Date()
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  return `${year}-${month}-${day}`;
}
Page({
  data: {
    id: 0,
    detail: {},
    isShowAuth: false,
    isMine: false,
    userInfo: [],
    content:'',
    comments:[],
  },
  onLoad(options) {
    this.checkLogin()
    let id = options.id;
    this.setData({
      id: id,
      userInfo:app.globalData.userInfo
    });
    this.getDetail();
    this.getComment();
  },
  //访问网络,请求数据  
  getDetail() {
    var that = this;
    let id = this.data.id;
    if (!id) {
      wx.showToast({
        icon: "none",
        title: '参数错误',
        duration: 3000,
      })
      return;
    }
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'post',
      data: { action: 'getRecordDetail', id: this.data.id },
      success: res => {
        console.log('[云函数] [getRecordDetail] : ', res.result)
        if (res.result && res.result.code === 1) {
          that.setData({
            detail: res.result.data,
          });
        } else {
          wx.showToast({
            icon: "none",
            title: res.result.msg,
            duration: 2000,
          })
        }
      },
      fail: err => {
        console.error('[云函数] [getRecordDetail] 调用失败', err)
        wx.showToast({
          icon: "none",
          title: "获取数据失败",
          duration: 2000,
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  makeCall() {
    wx.setClipboardData({
      data: this.data.detail.contact||'',
      success: res => {
        wx.showToast({
          title: '联系方式已复制',
          duration: 1000,
        })
      }
    })
  },
  delRecord() {
    wx.showLoading({
      title: '删除中',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'post',
      data: { action: 'delRecord', id: this.data.id },
      success: res => {
        console.log('[云函数] [delRecord] : ', res.result)
        if (res.result && res.result.code === 1) {
          wx.showToast({ title: '删除成功', duration: 2000 })
          setTimeout(() => {
            wx.navigateBack({
              delta:-1
            })
          }, 1500);
        } else {
          wx.showToast({
            icon: "none",
            title: res.result.msg,
            duration: 2000,
          })
        }
      },
      fail: err => {
        console.error('[云函数] [delRecord] 调用失败', err)
        wx.showToast({
          icon: "none",
          title: "删除失败",
          duration: 2000,
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  showLocation(e) {
    let location = this.data.detail.location;
    if (location && location.latitude && location.longitude) {
      location.scale = 18;
      wx.openLocation(location);
    }
  },
  viewImage(e) {
    wx.previewImage({
      urls: this.data.detail.imgList
    });
  },
  checkLogin() {
    let userInfo = app.globalData.userInfo || {};
    console.log(userInfo)
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请先登录帐号',
        duration: 1000,
      })
      this.showAuthDialog();
      return false;
    } else {
      return true;
    }
  },
  showAuthDialog() {
    this.setData({
      isShowAuth: true
    })
  },
  onAuthEvent: function (e) {
    console.log('onAuthEvent', e);
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  onPullDownRefresh() {
    this.getDetail();
    wx.stopPullDownRefresh();
    //reload
  },
  onShareAppMessage() {
    const detail = this.data.detail;
    const path = `/pages/record/detail?id=${detail._id}&from=share`;
    const title = `这里有一个${detail.type || ''}，快来${detail.location.name || ''}帮帮我`;
    const imageUrl = detail.imgList[0] || '/images/share.jpg';

    return {
      title: title,
      path: path,
      imageUrl: imageUrl
    }
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  bindKeyInput(e){
    const key = e.currentTarget.dataset.key;
    let data = {};
    data[key] = e.detail.value;
    this.setData(data);
  },
  addComment(){
    let errorMsg=''
    const data={}
    data.post_id=this.data.id;
    data.content=this.data.content;
    data.userInfo = this.data.userInfo;
    data.date=genDefDate();
    console.log(data)
    if(data.content==''){
      errorMsg="内容不能为空"
    }
    if (!data.userInfo){
      errorMsg = "请先登录"
    }
    if (data.post_id == ''||data.post_id==null) {
      errorMsg = "内容错误"
    } if (errorMsg) {
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
      return;
    }
    wx.showLoading({ title: '留言中...' });
    const db = wx.cloud.database();
    const resp = db.collection('comments').add({
      data: data
    }).then((res)=>{
      console.log('[addComment:success]')
      console.log(res)
      wx.hideLoading()
      wx.showToast({ title: '留言成功', icon: 'success', duration: 2000 })
      this.getComment()
    }).catch((err)=>{
      console.log(err)
      wx.hideLoading()
      wx.showToast({ title: '留言失败', icon: 'none', duration: 2000 })
    })
  },
  getComment(){
    wx.cloud.callFunction({
      name:'comment',
      data:{
        action:'getComment',
        id:this.data.id
      },
      success:(res)=>{
        console.log('[getComment:success]')
        console.log(res)
        this.setData({
          comments:res.result
        })
      },
      fail:(err)=>{
        console.log('[getComment:error]')
        console.log(err)
      }
    })
  }
});

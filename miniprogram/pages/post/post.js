const chooseLocationPlugin = requirePlugin('chooseLocation');
const app = getApp();
const genCloudFilePath = function (localFilePath) {
  const suffix = localFilePath.substring(localFilePath.length, localFilePath.lastIndexOf(".")) || '.jpg';//后缀名
  const now = new Date()
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  hour = hour < 10 ? '0' + hour : hour;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  const yyyyMMddHHmmss = `${year}${month}${day}${hour}${minutes}${seconds}`;
  return 'upload/' + year + month + '/' + yyyyMMddHHmmss + Math.random().toString(10).substr(2, 10) + suffix;
};
const genDefDate = function () {
  const now = new Date()
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  return `${year}-${month}-${day}`;
}
const key = 'ZW4BZ-2DLCS-UX3OS-6I4RU-EO5V3-TOFKU'; //使用在腾讯位置服务申请的key
//const key ='HMKBZ-EOIWP-7P2DW-V2KOS-W3CZT-Q5BQD'
const referer = '居家服务'; //调用插件的app的名称
const location = JSON.stringify({
  latitude: 39.89631551,
  longitude: 116.323459711
});
const category = '生活服务,娱乐休闲';
Page({
  data: {
    // StatusBar: app.globalData.StatusBar,
    // CustomBar: app.globalData.CustomBar,
    isShowAuth: false,
    userInfo: {},
    options: ['水电维修', '家电设备维修', '搬运服务', '接送服务', '清洁家务', '家教服务', '老幼照护服务', '其他服务'],
    index: 0,
    location: {},
    startDate: genDefDate(),
    endDate: genDefDate(),
    title: '',
    price: null,
    content: '',
    contact: '',
    imgList: [],
  },
  onShow() {
      this.setData({
        userInfo: app.globalData.userInfo
      })
      this.checkLogin();
  },
  // 标题，价格，需求
  bindKeyInput(e) {
    const key = e.currentTarget.dataset.key;
    let data = {};
    data[key] = e.detail.value;
    this.setData(data);
  },
  chooseLocation(e) {
     wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    });
  },
  //选择图片
  ChooseImage() {
    wx.chooseImage({
      count: 3, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '操作确认',
      content: '确定要删除这张照片吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  uploadImg(filePath) { // 调用wx.cloud.uploadFile上传文件
    return wx.cloud.uploadFile({
      cloudPath: genCloudFilePath(filePath),
      filePath: filePath
    })
  },
  // 选择类型
  bindPickerChange: function (e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  startDateChange(e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  endDateChange(e) {
    this.setData({
      endDate: e.detail.value
    })
  },
  tapPublish(){
  //  console.log("tapPublish");
    if (this.checkLogin() == false) {
      return;
    }
    let data = {};
    let errorMsg = "";
    data.userInfo=this.data.userInfo;
    data.title = this.data.title;
    data.type = this.data.options[this.data.index];
    data.price = this.data.price;
    data.content = this.data.content;
    data.contact=this.data.contact;
    data.startDate = this.data.startDate;
    data.endDate = this.data.endDate;
    data.imgList = this.data.imgList;
    data.location = this.data.location;
    data.deleteTime = '';
    data.publishTime = '';
    data.published = false;//待审核
    data.createTime = new Date().getTime();
    if (typeof (data.location.name) == 'undefined') {
      errorMsg = '请选择地址';
    }
    if (!data.userInfo){
      errorMsg='请先登录'
    }
    if (data.imgList.length < 1) {
      errorMsg = '至少上传一张照片';
    }
    if (data.title == "" || data.type == "") {
      errorMsg = '请完善信息';
    }
    if (data.contact == "") {
      errorMsg = '请留下联系方式';
    }
    if(data.startDate>data.endDate){
      errorMsg = '结束日期不能早于开始日期';
    }
    if (errorMsg) {
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
      return;
    }

    this.saveData(data);
  },
  saveData(data){
    wx.showLoading({ title: '发布中' });
    const uploadTasks = data.imgList.map(item => this.uploadImg(item))
    Promise.all(uploadTasks).then(result => {
      console.log(result);
      const imgList = result.map(img => (img.fileID));
      data.imgList = imgList;
      console.log(data);
      const db = wx.cloud.database();
      data.geo = db.Geo.Point(data.location.longitude, data.location.latitude);
      db.collection('posts').add({
        data: data
      }).then(result => {
        console.log('保存成功', result)
        wx.hideLoading()
        wx.showToast({ title: '发布成功审核中', icon: 'success', duration: 2000 })
        setTimeout(() => {
          this.setData({
            userInfo: {},
            index: 0,
            location: {},
            startDate: genDefDate(),
            endDate: genDefDate(),
            title: '',
            price: null,
            content: '',
            contact: '',
            imgList: [],
          })
          wx.switchTab({
            url: '/pages/index/index',
          })
        }, 2000);
      }).catch((e) => {
        console.log(e)
        wx.hideLoading()
        wx.showToast({ title: '发布失败', icon: 'none' })
      })

    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '上传图片错误', icon: 'none' })
    })
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
  }
})
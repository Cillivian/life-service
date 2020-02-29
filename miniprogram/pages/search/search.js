import { formatTime } from '../../utils/util'
var app = getApp();
var currentPage = 0 // 当前第几页,0代表第一页 
var pageSize = 10 //每页显示多少数据 
var loadAll = false;
var timer = null;

function formatDate(dateStr, justDate) {
  var str = '';
  if (dateStr && dateStr.length > 7) {
    str += dateStr.slice(0, 4);
    str += '-';
    str += dateStr.slice(4, 6);
    str += '-';
    str += dateStr.slice(6, 8);
    if (!justDate && dateStr.length > 11) {
      str += ' ';
      str += dateStr.slice(8, 10);
      str += ':';
      str += dateStr.slice(10, 12);
    }
  }
  return str;
}

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    dataList: [], //放置返回数据的数组  
    keyword: '',//搜索关键词
    picker: ['全部','水电维修', '家电设备维修', '搬运服务', '接送服务', '清洁家务', '家教服务', '老幼照护服务', '其他服务'],
    index:0
  },
  onLoad() {
    currentPage = 0;
    this.getData();
  },
 async PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
   await this.setData({
      dataList:[]
    })
   currentPage = 0;
   loadAll = false;
   this.getData();
  },
  searchRecord(e) {
    let key = e.detail.value.toLowerCase();
    this.setData({
      keyword: key
    })
    currentPage = 0;
    loadAll = false;
    var that = this;
    if (timer) {
      clearTimeout(timer);// 防止不停地发请求
    }
    timer = setTimeout(() => {
      this.getData();
    }, 500);
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    console.log("上拉触底事件")
    this.getData()
  },
  //访问网络,请求数据  
  getData() {
    if (loadAll) {
      console.log('全部加载完毕');
      return;
    }
    var that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
    console.log(that.data.picker[that.data.index])
    wx.cloud.callFunction({
      name: 'post',
      data: { action: 'getAllRecord', currentPage: currentPage, keyword: that.data.keyword,type:that.data.picker[that.data.index] },
      success: res => {
        console.log('[云函数] [getAllRecord] : ', res.result)
        if (res.result && res.result.code === 1) {
          if (currentPage == 0) {
            //that.data.dataList=[];
            that.setData({
              dataList: []
            });
          }
          if (res.result.data && res.result.data.length > 0) {
            currentPage++;
            loadAll = false;
            let lastRecord = res.result.data;
            lastRecord.forEach((item, index) => {
              item.time = formatTime(item.createTime)
            })
            let list = that.data.dataList.concat(lastRecord)
            that.setData({
              dataList: list
            });
          } else {
            loadAll = true;
          }
        }
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },
  goDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/post/detail?id=' + id
    })
  },
  formatPhoneNum(num) {
    // if(num.test(/^(86)?1\d{10}$/)){
    //   num = num.substr(2) ;
    // };
    return num;
  },
  onPullDownRefresh() {
    currentPage = 0;
    loadAll = false;
    this.getData();
    wx.stopPullDownRefresh();
    //reload
  }
});

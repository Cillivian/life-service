import { formatTime } from '../../utils/util'
const app = getApp()
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
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: true,
    dataList: {}
  },
  onShow() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getAll()
    const pickers = ['水电维修', '家电设备维修', '搬运服务', '接送服务', '清洁家务', '家教服务', '老幼照护服务', '其他服务']
    var list = pickers.map((item, index) => {
      return {
        name: item,
        id: index
      }
    })
    this.setData({
      list: list,
      listCur: list[0]
    })
    
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  getAll() {
    var that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'post',
      data: { action: 'getAllRecord', type: '全部' },
      success: res => {
        console.log('[云函数] [getAllRecord] : ', res.result)
        if (res.result && res.result.code === 1) {
          if (res.result.data && res.result.data.length > 0) {
            let record = res.result.data;
            let list = {
              '水电维修': [],
              '家电设备维修': [],
              '搬运服务': [],
              '接送服务': [],
              '清洁家务': [],
              '家教服务': [],
              '老幼照护服务': [],
              '其他服务': []
            }
            record.map((item,index)=>{
              let type=item.type;
              item.time = formatTime(item.createTime)
              list[type].push(item)
            })
            this.setData({
              dataList:list
            })

          }
        }
        wx.hideLoading()
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
})
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV});
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'getBanner': {
      return getBanner(event)
    }
    case 'getLastRecord': {
      return getLastRecord(event)
    }
    case 'getNearbyRecord': {
      return getNearbyRecord(event)
    }
    case 'getHelp': {
      return getHelp(event)
    }
    default: {
      return
    }
  }
}
async function getBanner(event) {
  let resp = { code: 0, msg: '', data: [] };
  let banners = await db.collection('banners').get({
    success(res){
      console.log(res)
    },
    fail(res){
      console.log(res)
    }
  });
  resp.code = 1;
  resp.data = banners.data;
  return resp;
}

async function getLastRecord(event) {
  let resp = { code: 0, msg: '', data: [] };
  let dbret = await db.collection('posts').where({
    // geo: _.geoNear({
    //   geometry: db.Geo.Point(geo.longitude, geo.latitude)
    // }),
    published: true,
    deleteTime: ''
  }).orderBy('createTime', 'desc').limit(3).get();
  //console.log(dbret);
  let list = dbret.data;
  // list.forEach((item) => {
  //   item.image = getCdnUrl(item.imgList[0]);
  // })
  resp.code = 1;
  resp.data = list;
  return resp;
}

async function getNearbyRecord(event) {
  let resp = { code: 0, msg: '', data: [] };
  const geo = event.geo;
  //const userInfo = event.userInfo;
  //const openid = userInfo.openId;
  //console.log("geo:", geo)
  const _ = db.command
  let dbret = await db.collection('posts').where({
    geo: _.geoNear({
      geometry: db.Geo.Point(geo.longitude, geo.latitude)
    }),
    published: true,
    deleteTime: ''
  }).orderBy('createTime', 'desc').limit(20).get();
  let list = dbret.data;
  let markers = [];
  list.forEach((item, index) => {
    let marker = {
      id: index,
      _id: item._id,
      latitude: item.location.latitude - ((item.createTime % 100) / 100000),
      longitude: item.location.longitude - ((item.createTime % 100) / 100000),
      width: 40,
      height: 40,
      iconPath: getCdnUrl(item.imgList[0]),
      title: item.title
    }
    markers.push(marker);
  })
  resp.code = 1;
  resp.data = markers;
  return resp;
}
function getCdnUrl(fileID) {
  const url = fileID ? fileID.replace(/cloud:\/\/z-jjfw-jjocf.7a2d-z-jjfw-jjocf-1300407026/, "https://7a2d-z-jjfw-jjocf-1300407026.tcb.qcloud.la") : '';
  return url;
}
function getHelp(event) {
  const list = [
    { q: '1.为什么我无法登录?', a: '请尝试升级微信版本后再重新登录。' },
    { q: '2.有虚假信息和欺骗行为怎么办?', a: '服务前一定要核对双方信息，发生欺骗行为及时报警。' },
    { q: '3.如何防止在服务过程发生纠纷?', a: '建议上门前与求助者做好充分沟通，留下双方身份信息，或请物业保安陪同上门并录像。' },
    { q: '4.为什么求助信息未出现在首页?', a: '求助信息须审核通过后才能在首页展示，审核期间可以在"我的-求助记录"里查看与分享。' },

  ];
  return list;
}

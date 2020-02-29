const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'login': {
      return login(event)
    }
    case 'getCount': {
      return getCount(event)
    }
    case 'getWXContext': {
      return getWXContext(event)
    }
    case 'getWXACode': {
      return getWXACode(event)
    }
    case 'getOpenData': {
      return getOpenData(event)
    }
    case 'getUserData': {
      return getUserData(event)
    }
    case 'getPhone': {
      return getPhone(event)
    }
    default: {
      return
    }
  }
}

async function login(event) {//1.0.1版本开始使用
  //const wxContext = event.userInfo();
  const appid = event.userInfo.appId;
  const openid = event.userInfo.openId;
  const dbret = await db.collection('users').where({
    openid: openid
  }).get();
  console.log('login dbret:', dbret);
  const dbdata = dbret.data;
  const userData = dbdata[0];
  if (userData) {
    userData.getDevice = true;
    return userData;
  } else {
    return {
      openid: openid,
      appid: appid,
      getDevice: true
    }
  }
}

async function getCount(event) {
  let count = [{
    id: 0,
    type: '发帖',
    icon: 'cuIcon-group_fill',
    color: 'text-orange',
    num: 0,
    unit: '次'
  }, {
      id: 1,
      type: '发起服务',
      icon: 'cuIcon-appreciatefill',
      color: 'text-green',
      num: 0,
      unit: '次'
    }, {
      id: 2,
      type: '收藏',
      icon: 'cuIcon-moneybag',
      color: 'text-blue',
      num: 0,
      unit: '贴'
    }];
  const openid = event.userInfo.openId;
  const recordCount = await db.collection('posts').where({
    _openid: openid,
    deleteTime:''
  }).count()
  count[0].num = recordCount.total;
  return count;
}

async function getWXContext(event) {
  const wxContext = cloud.getWXContext();
  const dbret = await db.collection('users').where({
    openid: wxContext.OPENID
  }).get();
  console.log('dbret', dbret);
  const dbdata = dbret.data;
  const userData = dbdata[0];
  if (userData) {
    return userData;
  } else {
    return {
      openid: wxContext.OPENID,
      env: wxContext.ENV,
    }
  }

}

async function getWXACode(event) {

  // 此处将获取永久有效的小程序码，并将其保存在云文件存储中，最后返回云文件 ID 给前端使用

  const wxacodeResult = await cloud.openapi.wxacode.get({
    path: 'pages/index/index',
  })

  const fileExtensionMatches = wxacodeResult.contentType.match(/\/([^\/]+)/)
  const fileExtension = (fileExtensionMatches && fileExtensionMatches[1]) || 'jpg'

  const uploadResult = await cloud.uploadFile({
    // 云文件路径，此处为演示采用一个固定名称
    cloudPath: `wxacode_default_openapi_page.${fileExtension}`,
    // 要上传的文件内容可直接传入图片 Buffer
    fileContent: wxacodeResult.buffer,
  })

  if (!uploadResult.fileID) {
    throw new Error(`upload failed with empty fileID and storage server status code ${uploadResult.statusCode}`)
  }

  return uploadResult.fileID
}

async function getOpenData(event) {
  // 需 wx-server-sdk >= 0.5.0
  return cloud.getOpenData({
    list: event.openData.list,
  })
}

async function getUserData(event) {
  const wxContext = cloud.getWXContext()
  return wxContext
}

async function getPhone(event) {
  const wxContext = cloud.getWXContext()
  var moblie = event.weRunData.data.phoneNumber;
  return moblie
  // const wxContext = cloud.getWXContext()
  // var userInfo = event.userInfo;
  // var userPhone = event.userPhone;

  // const openid = event.userInfo.openId;
  // const appid = event.userInfo.appId;
  // let mobile = '';
  // if (userPhone && userPhone.data && userPhone.data.purePhoneNumber) {
  //   mobile = userPhone.data.purePhoneNumber;
  // }
  // let userData = {
  //   openid: openid,
  //   appid: appid,
  //   mobile: mobile,
  //   regtime: new Date().getTime()
  // };

  // const dbret = await db.collection('users').where({
  //   openid: openid
  // }).get();

  // if (dbret && dbret.errMsg && dbret.errMsg == 'collection.get:ok') {
  //   let dbUserData = dbret.data[0];
  //   if (dbUserData) {
  //     if (dbUserData.mobile == userData.mobile) {
  //       userData = dbUserData;
  //     } else {//变更手机号
  //       console.log("getPhone update mobile, userData:", userData);
  //       console.log("getPhone update mobile, dbUserData:", dbUserData);
  //       dbUserData.lastmobile = dbUserData.mobile;
  //       dbUserData.mobile = mobile;
  //       delete dbUserData._id;
  //       await db.collection('users').where({
  //         openid: openid
  //       }).update({
  //         data: dbUserData
  //       })
  //     }

  //   } else {//第一次登录用户入库
  //     console.log('reg user');
  //     await db.collection('users').add({
  //       data: userData
  //     })
  //   }
  // }
  // return userData;
}

// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  switch (event.action) {
    case 'getComment': { return getComment(event) }
    case 'addComment': { return addComment(event) }
    default: return {}
  }
}
async function addComment(event) {
  const db = cloud.database();
  const resp=await db.collection('comments').add({
    data: event.data
  })
  return resp
}
async function getComment(event){
  const db = cloud.database();
  const resp = await db.collection('comments').where({
    post_id: event.id
  }).get();
  return resp.data
}
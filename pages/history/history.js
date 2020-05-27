// history.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    blank: '\n',
    openid: '',
    queryResult: '',
    user_name:'',
    isReady:false,
    dateTime:'',
    deleteIndex:'',
    origID:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.userInfo) {
      that.setData(
        {
          user_name:app.globalData.userInfo.nickName
        }
      );
      wx.cloud.init();
      const db = wx.cloud.database();
      this.getOpenid();//获得唯一id
      //下面进行查询
      db.collection('user_info').where(
        {
          _openid: this.data.openid
        }
      ).get(
        {
          success: res => {
            console.log('[数据库] [查询记录] 成功');
            var dateArray = new Array();//显示用时间
            var origDateM = new Array();//删除时用的查询id
            var i=0;
            console.log(res.data.length);
            for(i=0;i<res.data.length;i++)
            {
              dateArray[i]=res.data[i].addTime.toLocaleString();
              origDateM[i]=res.data[i]._id;
            }
            this.setData({
              queryResult:res.data,
              isReady: true,
              dateTime: dateArray,
              origID: origDateM,
            });
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        }
      );
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.cloud.init();
    const db = wx.cloud.database();
    this.getOpenid();//获得唯一id
    //下面进行查询
    db.collection('user_info').where(
      {
        _openid: this.data.openid
      }
    ).get(
      {
        success: res => {
          console.log('[数据库] [查询记录] 成功');
          var dateArray = new Array();
          var origDateM = new Array();
          var i = 0;
          console.log(res.data.length);
          for (i = 0; i < res.data.length; i++) {
            dateArray[i] = res.data[i].addTime.toLocaleString();
            origDateM[i] = res.data[i]._id;
          }
          this.setData({
            queryResult: res.data,
            isReady: true,
            dateTime: dateArray,
            origID: origDateM,
          });
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      }
    );
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getOpenid() {
    let that = this;
    wx.cloud.callFunction(
      {
        name: 'getOpenid',
        complete: res => {
          var openid = res.result.openId;
          that.setData(
            {
              openid: openid
            }
          )
        }
      }
    )
  },

  selectDelete: function(e){
    this.setData({
      deleteIndex:e.detail.value
    });
  },

  confirmDelete(){
    var dateArray = this.data.origID;
    var delIndex = this.data.deleteIndex;
    var isCheckedM = this.data.isChecked;
    var delDate = new Array();
    var i = 0, j = 0;
    for (i = 0; i < delIndex.length; i++) {
      for (j = 0; j < dateArray.length; j++) {
        if (Number(delIndex[i]) == j) {
          delDate[i]=dateArray[j];
          console.log(delDate[i].toLocaleString());
        }
      }
    }
    wx.cloud.init();
    const db = wx.cloud.database();
    if(delDate.length == 0)
    {
      wx.showToast({
        title: '无记录可供删除',
        icon: 'none',
      });
    }
    for(i=0;i<delDate.length;i++)
    {
      db.collection('user_info').doc(delDate[i]).remove({
        success: res=>{
          wx.showToast({
            title: '成功删除'+String(i)+'条记录，请下拉刷新',
          });
        },
        fail: err=>{
          wx.showToast({
            title: '删除失败',
            icon: 'none',
          })
          console.log(i);
        }
      })
    }
    this.onPullDownRefresh();
  }
})
// pages/suggestion/suggestion.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ctrl_type: 'showSignInButton',
    blank:'\n',
    recommandInfo: '您尚未测量！'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var cond = app.globalData.condition;
    var pDeg = app.globalData.deg;
    var pSideDeg = app.globalData.sideDeg;
    var ppos = app.globalData.leftOrRight;
    var user = app.globalData.userInfo;
    var rec = '感谢您的使用！';
    if (cond == 'unsignedin') {
      that.setData({ ctrl_type: 'showSignInButton' });
    }
    else if (cond == 'unconnected') {
      that.setData({ ctrl_type: 'showBtCnetButton' });
    }
    else if (cond == 'unmeasured') {
      that.setData({ ctrl_type: 'showMeasureButton' });
    }
    else {
      that.setData({ ctrl_type: 'showSuggestions' });
      if(pDeg>65)
      {
        rec+='大于某个角度的建议。';
      }
      else
      {
        rec += '一切正常！';
      }
      if(ppos!='n')
      {
        rec+='此外，我们还注意到了您的。。。向';
        if(ppos=='l')
        {
          rec += '左';
        }
        else
        {
          rec += '右';
        }
        rec+='倾斜。这。。。。一些建议'
      }
      else
      {
        rec += '我们并没有发现侧倾';
      }
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

  blueCnet: function()
  {
    wx.navigateTo({ url: '/pages/bluetoothcnet/bluetoothcnet' })
  },

  onGotUserInfo: function (e) {
    console.log("log in succcess");
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    if(e.detail.userInfo)
    {
      app.globalData.userInfo=e.detail.userInfo;
      app.globalData.condition = 'unconnected';
      this.onLoad()
    }
  },

})
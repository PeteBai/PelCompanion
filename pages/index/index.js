//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    blank:'\n',
    condition:'unmeasured',
    openid:'',
    queryResult:''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      app.globalData.condition = 'unconnected';
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        app.globalData.condition = 'unconnected';
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          app.globalData.condition = 'unconnected';
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  startMeasure: function()
  {
    if(this.data.condition=='unconnected')
    {
      wx.navigateTo({ url: '/pages/bluetoothcnet/bluetoothcnet'})
    }
    else if (this.data.condition == 'unmeasured')
    {
      //假设已经从蓝牙那里搞到了并且写入了globaldata里
      var sideChar = '左';
      if(app.globalData.leftOrRight == 'r')
      {
        sideChar = '右';
      }
      else if(app.globalData.leftOrRight == 'n' || app.globalData.leftOrRight == '未测量')
      {
        sideChar = '并不侧';
      }
      var measureData = '当前盆骨倾斜度为：'+app.globalData.deg+'，'+sideChar+'倾，其倾斜角度为'+app.globalData.sideDeg+'。确认要提交吗？';
      wx.showModal({
        cancelColor: 'cancelColor',
        title: '确认数据',
        content:measureData,
        success: function(res){
          if(res.cancel){
            return;
          }
        }
      })
      wx.cloud.init();
      const db = wx.cloud.database();
      //下面进行添加
        db.collection('user_info').add(
          {
            data: {
              addTime: new Date(),
              degree: app.globalData.deg,
              sidedegree: app.globalData.sideDeg,
              position: app.globalData.leftOrRight
            },
            success: function()
            {
              console.log('success add to db')
            }
          }
        );
    }
  },

  connectBlue: function()
  {
    wx.navigateTo({ url: '/pages/bluetoothcnet/bluetoothcnet'})
  },

  getOpenid()
  {
    let that = this;
    wx.cloud.callFunction(
      {
        name: 'getOpenid',
        complete: res =>
        {
          console.log(res)
          console.log('get daze:', res.result.openId);
          var openid = res.result.openId;
          that.setData(
            {
              openid:openid
            }
          )
        }
      }
    )
  }

})

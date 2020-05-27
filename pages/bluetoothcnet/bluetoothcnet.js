const app=getApp();

//查询元素是否在数组里
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices: [],
    connected: false,
    chs: [],
    _deviceId: null,
    _serviceId: null,
    _characteristicId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openBluetoothAdapter();
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
    openBluetoothAdapter();
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
  openBluetoothAdapter() {//打开蓝牙
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        wx.showToast({
          title: '请打开蓝牙定位',
          duration: 1000,
        })
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {//获得适配器（本机）状态
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {//开始查找
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.showToast({
      title: '正在查找',
      icon: 'loading',
    })
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {//停止查找
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {//找到了
    wx.hideToast()
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device;
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {//连接一哈
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
        wx.showToast({
          title: '已成功连接',
          icon: 'success',
          duration: 2000
        })
        wx.showModal({
          cancelColor: 'cancelColor',
          title:'注意',
          content:'设备连接成功，请在设备上完成测试。在整个过程中请不要离开页面。正在等待数据传入...',
          success: function(res){
            //do nothing
          }
        })
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {//获取服务
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true,
              _deviceId: deviceId,
              _serviceId: serviceId,
              _characteristicId: item.uuid,
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid//存下可以写的特征值uuid
            //this.writeBLECharacteristicValue()//调用写函数
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
              success: function(res)
              {
                console.log("notifyBLECharacteristicValueChange success"+res.errMsg)
              },
              fail: function(res){
                console.log("notifyBLECharacteristicValueChange fail" + res.errMsg + res.errCode)
              },
              complete: function(res){
                console.log("notifyBLECharacteristicValueChange complete")
              },
            });
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      //var gettedData = ab2hex(characteristic.value);
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value),
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value),
        }
        var disp = '已接受到：' + ab2hex(characteristic.value)
        app.globalData.condition = 'measured';
        console.log(ab2hex(characteristic.value));//确实收到了
        wx.showToast({
          title: disp,
          icon: 'success',
          duration: 2000
        })
      }
      this.setData(data)
    })
  },
  //如果需要单独使用，则需要配置各种id
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
    //var that = this;
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    //dataView.setUint8(0, Math.random() * 255 | 0)
    dataView.setUint8(0, 912)
    wx.writeBLECharacteristicValue({
      deviceId: this.data._deviceId,
      serviceId: this.data._serviceId,
      characteristicId: this.data._characteristicId,
      value: buffer,
      success: function(res){
        console.log("wrote:" + dataView.getUint8(0))
      },
      fail: function(res){
        console.log("write failed." + res.errMsg + res.errCode)
      },
      complete: function()
      {
        console.log("finished.")
      },
    })    
  },
  writeBLECharValStandAlone()
  {
    wx.getBLEDeviceCharacteristics({
      deviceId: this.data._deviceId,
      serviceId: this.data._serviceId,
      success: (res) => {
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId: this.data._deviceId,
              serviceId: this.data._serviceId,
              characteristicId: this.data._characteristicId,
            })
          }
          if(item.properties.write){
            this.setData({
              canWrite:true,
            })
            this.writeBLECharacteristicValue()
          }
        }
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
})

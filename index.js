const debug = require('electron-debug')
const path = require('path')
const {
  app,
  globalShortcut,
  BrowserWindow,
  ipcMain,
} = require('electron')
const Screenshots = require('electron-screenshots').default
const Baidu = require('./lib/direct-baidu')
const Menus = require('./lib/menus')
const config = {
  "direct": {
    "enable": true,
    "host": "https://aip.baidubce.com",
    "client_secret": "ADNU8yRYXluzLArkT7D7VxsMVaFjX6Qu",
    "grant_type": "client_credentials",
    "client_id": "zRS1pC2CfeYIfkjhxD8mthiM"
  },
  "proxy": {
    "enable": false,
    "host": ""
  }
}


function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'images/logo.png')
  })

  // 并且为你的应用加载index.html
  win.loadFile('index.html')
  win.webContents.openDevTools()

  return win
}


app.on('ready', () => {
  const win = createWindow()
  const screenshots = new Screenshots()
  const menus = new Menus(win,screenshots)
  menus.createMenu()

  const baidu = new Baidu(config.direct)

  // globalShortcut.register('ctrl+shift+f', () => screenshots.startCapture())
  // ipcMain.on('asynchronous-message', (event, arg) => {
  //   console.log(arg) // prints "ping"
  //   event.sender.send('asynchronous-reply', 'pong')
  // })

  // ipcMain.on('synchronous-message', (event, arg) => {
  //   console.log(arg) // prints "ping"
  //   event.returnValue = 'pong'
  // })

  // 点击确定按钮回调事件
  screenshots.on('ok', async (e, viewer) => {
    if (viewer.dataURL) {
      try {
        
        if (!baidu.isExpired()){
          await baidu.getToken()
        }
        win.webContents.send('origin-image',viewer.dataURL)
        let ocrCtx =  await baidu.ocrTrans(viewer.dataURL)
        let imageText = null
        if(ocrCtx && ocrCtx.words_result){
          imageText = baidu.transResult(ocrCtx.words_result)
          console.log(imageText)
          win.webContents.send('imageText',imageText)
        }
      } catch (error) {
        console.log('baiduApi:',error)
      }
      
    }
  })

  screenshots.on('cancel', e => {
    // 执行了preventDefault
    // 点击取消不会关闭截图窗口
    e.preventDefault()
    console.log('capture', 'cancel2')
  })
  // 点击保存按钮回调事件
  screenshots.on('save', async (e, {
    viewer
  }) => {
    if (viewer.dataURL) {
      try {
        
        if (!baidu.isExpired()){
          await baidu.getToken()
        }
        win.webContents.send('origin-image',viewer.dataURL)
        let ocrCtx =  await baidu.ocrTrans(viewer.dataURL)
        let imageText = null
        if(ocrCtx && ocrCtx.words_result){
          imageText = baidu.transResult(ocrCtx.words_result)
          console.log(imageText)
          win.webContents.send('imageText',imageText)
        }
      } catch (error) {
        console.log('baiduApi:',error)
      }
      
    }  })
  // debug({
  //   showDevTools: true,
  //   devToolsMode: 'undocked'
  // })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
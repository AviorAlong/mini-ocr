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
const FaasService = require('./lib/faas-service')
const Menus = require('./lib/menus')
const config = {
  "direct": {
    "host": "https://aip.baidubce.com",
    "client_secret": "ADNU8yRYXluzLArkT7D7VxsMVaFjX6Qu",
    "grant_type": "client_credentials",
    "client_id": "zRS1pC2CfeYIfkjhxD8mthiM"
  },
  "proxy": {
    "enable": true,
    "host": "https://1613606417303976.cn-huhehaote.fc.aliyuncs.com/2016-08-15/proxy/serverless-hello-world/accurate/"
  }
}

const baidu = new Baidu(config.direct)
const faasApi = new FaasService(config.proxy)

async function directOcr(viewer) {
  try {
    if (!baidu.isExpired()) {
      await baidu.getToken()
    }
    let ocrCtx = await baidu.ocrTrans(viewer.dataURL)
    let imageText = null
    if (ocrCtx && ocrCtx.words_result) {
      imageText = baidu.transResult(ocrCtx.words_result)
    }
    return imageText
  } catch (error) {
    console.log('baiduApi:', error)
  }
}

async function faasOcr(viewer) {
  try {
    let ocrCtx = await  faasApi.accurate(viewer.dataURL)
    console.log(ocrCtx)
    let imageText = null
    if (ocrCtx && ocrCtx.words_result) {
      imageText = faasApi.transResult(ocrCtx.words_result)
    }
    return imageText
  } catch (error) {
    console.log('faasApi:', error)
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
  const menus = new Menus(win, screenshots)
  menus.createMenu()


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
      win.webContents.send('origin-image', viewer.dataURL)
      let imageText = ''
      if (config.proxy.enable) {
        imageText = await faasOcr(viewer)
      } else {
        imageText = await directOcr(viewer)
      }
      win.webContents.send('imageText', imageText)
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
      win.webContents.send('origin-image', viewer.dataURL)
      let imageText = ''
      if (config.proxy.enable) {
        imageText = await faasOcr(viewer)
      } else {
        imageText = await directOcr(viewer)
      }
      win.webContents.send('imageText', imageText)
    }
  })
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
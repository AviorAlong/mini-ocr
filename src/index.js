const path = require('path')
const {
    app,
    globalShortcut,
    BrowserWindow,
    ipcMain
} = require('electron')
const Screenshots = require('electron-screenshots').default
const Baidu = require('./lib/direct-baidu.js')
const FaasService = require('./lib/faas-service.js')
const Menus = require('./lib/menus.js')
let config = require('./config/auth.json')

const baidu = new Baidu(config.direct)
const faasApi = new FaasService(config.proxy)

// 直接调用百度api
async function directOcr(image) {
    try {
        if (!baidu.isExpired()) {
            await baidu.getToken()
        }
        let ocrCtx = await baidu.ocrTrans(image)
        let imageText = null
        if (ocrCtx && ocrCtx.words_result) {
            imageText = baidu.transResult(ocrCtx.words_result)
        }
        return imageText
    } catch (error) {
        console.log('baiduApi:', error)
    }
}

// 通过faas转发
async function faasOcr(image) {
    try {
        let ocrCtx = await faasApi.accurate(image)
        let imageText = null
        if (ocrCtx && ocrCtx.words_result) {
            imageText = faasApi.transResult(ocrCtx.words_result)
        }
        return imageText
    } catch (error) {
        console.log('faasApi:', error)
    }
}

// 创建窗口
function createWindow() {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true
        },
        icon: path.join(__dirname, 'images/logo.png')
    })

    // 并且为你的应用加载index.html
    win.loadFile('./views/index.html')
    // win.webContents.openDevTools()

    return win
}


app.on('ready', () => {
    const win = createWindow()
    const screenshots = new Screenshots()
    const menus = new Menus(win, screenshots)
    menus.createMenu()
    console.log(config)
    if (config.proxy && !config.proxy.enable) {
        if (!(config.direct && config.direct.client_secret && config.direct.client_id)) {
            win.webContents.send('setting', '非代理模式，请设置百度Ocr认证信息', '1')
        }
    }


    ipcMain.on('stick-up', async (event,image) => {
        if (config.proxy.enable) {
            imageText = await faasOcr(image)
        } else {
            imageText = await directOcr(image)
        }
        // event.reply()
        win.webContents.send('imageText', imageText)

    })

    ipcMain.on('image-drop', async (event, image) => {
        if (config.proxy.enable) {
            imageText = await faasOcr(image)
        } else {
            imageText = await directOcr(image)
        }
        win.webContents.send('imageText', imageText)

    })

    ipcMain.on('update-config', async (event, conf) => {
        console.log(conf)
       config = conf;
       baidu.config = config.direct
       faasApi.config = config.proxy
    })

    // 点击确定按钮回调事件
    screenshots.on('ok', async (e, viewer) => {
        if (viewer.dataURL) {
            win.webContents.send('origin-image', viewer.dataURL)
            let imageText = ''
            if (config.proxy.enable) {
                imageText = await faasOcr(viewer.dataURL)
            } else {
                imageText = await directOcr(viewer.dataURL)
            }
            win.webContents.send('imageText', imageText)
        }

    })

    screenshots.on('cancel', e => {
        // 执行了preventDefault
        // 点击取消不会关闭截图窗口
        // e.preventDefault()
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
                imageText = await faasOcr(viewer.dataURL)
            } else {
                imageText = await directOcr(viewer.dataURL)
            }
            win.webContents.send('imageText', imageText)
        }
    })
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





const path = require('path')

const {
    app,
    ipcMain,
    MenuItem,
    Menu
} = require('electron')

class Menus {

    constructor(win, screenshots) {
        this.win = win
        this.screenshots = screenshots
    }
    createMenu() {
        const menuConf = this.conf()
        const dockMenu = Menu.buildFromTemplate(menuConf.dockTempalte);
        Menu.setApplicationMenu(dockMenu)
    }
    conf() {
        const that = this
        return {
            "dockTempalte": [{
                    label: '工具',
                    submenu: [{
                            label: '截图',
                            accelerator: 'ctrl+shift+x',
                            icon: path.join(__dirname, '../images/snap.png'),
                            click: () => {
                                that.screenshots.startCapture()
                            }
                        }
                        // },
                        // {
                        //     label: '上传图片',
                        //     accelerator: 'ctrl+alt+o',
                        //     icon: path.join(__dirname, '../images/file.png')
                        // }
                    ]
                },
                {
                    label: '设置',
                    submenu: [{
                            label: '密钥',
                            accelerator: 'ctrl+alt+s',
                            icon: path.join(__dirname, '../images/auth.png'),
                            click: () => {
                                let config = require('../config/auth.json')
                                if (config.proxy && !config.proxy.enable) {
                                    if (!(config.direct && config.direct.client_secret && config.direct.client_id)) {
                                        let msg = JSON.stringify({
                                            "msg": '非代理模式请设置百度Ocr信息',
                                            proxy: config.proxy.enable
                                        })
                                        that.win.webContents.send('setting', msg)
                                    } else {
                                        let msg = JSON.stringify(config.direct)
                                        that.win.webContents.send('setting', msg)
                                    }
                                } else {
                                    let msg = JSON.stringify({
                                        proxy: config.proxy.enable
                                    })
                                    that.win.webContents.send('setting', msg)
                                }
                            }
                        }
                        //  },
                        //  {
                        //      label: '快捷键',
                        //      accelerator: 'ctrl+alt+l',
                        //      icon: path.join(__dirname, '../images/link.png')
                        //  }
                    ]
                }, {
                    label: '管理',
                    submenu: [{
                            label: '退出',
                            role: 'quit',
                            accelerator: 'ctrl+alt+e',
                            icon: path.join(__dirname, '../images/exit.png')
                        },
                        {
                            label: '重启',
                            accelerator: 'ctrl+alt+r',
                            icon: path.join(__dirname, '../images/restart.png'),
                            click() {
                                app.quit();
                                app.relaunch();
                            }
                        }
                    ]
                }

            ]
        }
    }
}

module.exports = Menus
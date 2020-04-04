import { app, BrowserWindow, ipcMain } from 'electron'
// import '../renderer/store'
const path = require('path');
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  // 初始化截图
  // useCapture()
  mainWindow = new BrowserWindow({
    width: 810,
    height: 600,
    minWidth: 750,
    minHeight: 450,
    useContentSize: true,
    webPreferences: { webSecurity: false },
    frame: false
  })
  // Menu.setApplicationMenu(null)
  var trayMenuTemplate = [
    {
      label: '设置',
      click: function () { } //打开相应页面
    },
    {
      label: '意见反馈',
      click: function () { }
    },
    {
      label: '帮助',
      click: function () { }
    },
    {
      label: '关于聊天',
      click: function () { }
    },
    {
      label: '退出聊天',
      click: function () {
        //ipc.send('close-main-window');
        app.quit();
      }
    }
  ];

  //任务栏窗口闪烁通知
  // mainWindow.once('focus', () => mainWindow.flashFrame(false))
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
ipcMain.on('flashFrame', function () {
  mainWindow.flashFrame(true)
})
//登录窗口最小化
ipcMain.on('min', function () {
  mainWindow.minimize();
})
//登录窗口最大化
ipcMain.on('max', function () {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
})
ipcMain.on('close', function () {
  mainWindow.close();
})
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

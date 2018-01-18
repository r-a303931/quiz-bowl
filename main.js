const electron = require('electron')
// Module to control application life.
const app = electron.app
const {ipcMain} = electron;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, childWindow

function chclosed () {
  if (mainWindow) {
    childWindow = new BrowserWindow({width: width/2, height: height, x: 0, y: 0, frame: true, show: false});
    childWindow.once('ready-to-show', () => {
      childWindow.show();
    });
    childWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'scores.html'),
      protocol: 'file:',
      slashes: true
    }))

    childWindow.on('closed', chclosed);
  } else {
    childWindow = null
  }
}

ipcMain.on('score-update', (e, data) => childWindow && childWindow.webContents.send('score-update', data));
ipcMain.on('team-update', (e, data) => childWindow && childWindow.webContents.send('team-update', data));
ipcMain.on('qa-update', (e, data) => childWindow && childWindow.webContents.send('qa-update', data));

ipcMain.on('team-answer', (e, data) => mainWindow && mainWindow.webContents.send('team-answer', data));
ipcMain.on('team-answer-close', (e, data) => mainWindow && mainWindow.webContents.send('team-answer-close', data));
ipcMain.on('board-update', (e, data) => mainWindow && mainWindow.webContents.send('board-update', data));
ipcMain.on('scores-show', (e, data) => mainWindow && mainWindow.webContents.send('scores-show', data));

function createWindow () {
  var {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  mainWindow = new BrowserWindow({width: width/2, height: height, x: width/2, y: 0, frame: false, show: false})
  childWindow = new BrowserWindow({width: width/2, height: height, x: 0, y: 0, frame: true, show: false});

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  childWindow.once('ready-to-show', () => {
    childWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  childWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'scores.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    childWindow = null
    app.quit();
  });

  childWindow.on('closed', chclosed);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
})
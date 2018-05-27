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
let boardWindow, menuWindow

function chclosed () {
  if (boardWindow) {
    menuWindow = new BrowserWindow({width: width/2, height: height, x: 0, y: 0, frame: true, show: false});
    menuWindow.once('ready-to-show', () => {
      menuWindow.show();
    });
    menuWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'scores.html'),
      protocol: 'file:',
      slashes: true
    }))

    menuWindow.on('closed', chclosed);
  } else {
    menuWindow = null
  }
}

ipcMain.on('score-update', (e, data) => menuWindow && menuWindow.webContents.send('score-update', data));
ipcMain.on('qa-update', (e, data) => menuWindow && menuWindow.webContents.send('qa-update', data));

ipcMain.on('daily-double-update', (e, data) => boardWindow && boardWindow.webContents.send('daily-double-update', data));
ipcMain.on('table-select', (e, data) => boardWindow && boardWindow.webContents.send('table-select', data));
ipcMain.on('team-update', (e, data) => boardWindow && boardWindow.webContents.send('team-update', data));
ipcMain.on('team-answer', (e, data) => boardWindow && boardWindow.webContents.send('team-answer', data));
ipcMain.on('team-answer-close', (e, data) => boardWindow && boardWindow.webContents.send('team-answer-close', data));
ipcMain.on('board-update', (e, data) => boardWindow && boardWindow.webContents.send('board-update', data));
ipcMain.on('scores-show', (e, data) => boardWindow && boardWindow.webContents.send('scores-show', data));
ipcMain.on('question-select', (e, data) => boardWindow && boardWindow.webContents.send('question-select', data));

function createWindow () {
  var {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  
  var displays = electron.screen.getAllDisplays(), extDisplay = null;
  for (var i of displays) {
    if (i.bounds.x != 0 || i.bounds.y != 0) {
      extDisplay = i;
      break;
    }
  }
  
  if (extDisplay) {
    boardWindow = new BrowserWindow({width: extDisplay.size.width, height: extDisplay.size.height, x: extDisplay.bounds.x, y: extDisplay.bounds.y, frame: false, show: false});
    menuWindow =  new BrowserWindow({width: width,                 height: height,                 x: 0,                   y: 0,                   frame: true,  show: false});
  } else {
    boardWindow = new BrowserWindow({width: width/2, height: height, x: width/2, y: 0, frame: false, show: false});
    menuWindow =  new BrowserWindow({width: width/2, height: height, x: 0,       y: 0, frame: true,  show: false});
  }

  boardWindow.once('ready-to-show', () => {
    boardWindow.show();
    if (!!extDisplay) {
      boardWindow.maximize();
      if (boardWindow.setFullScreen) {
        boardWindow.setFullScreen(true);
      }
    }
  });
  menuWindow.once('ready-to-show', () => {
    menuWindow.show();
  });

  // and load the index.html of the app.
  boardWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  menuWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'scores.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // boardWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  boardWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    boardWindow = null
    menuWindow = null
    app.quit();
  });

  menuWindow.on('closed', chclosed);
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

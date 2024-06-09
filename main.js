const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { setupMenu } = require('./navigation');

let mainWindow;
let playlistWindow = null;
let aboutWindow = null;
let db = new sqlite3.Database('playlist.db');

db.run('CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');

    setupMenu(mainWindow, openPlaylistWindow, openAboutWindow);
}

function openPlaylistWindow() {
    if (playlistWindow === null || playlistWindow.isDestroyed()) {
        playlistWindow = new BrowserWindow({
            width: 400,
            height: 600,
            frame: true,
            backgroundColor: '#FFFFFF',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });

        playlistWindow.loadFile('playlist.html');

        playlistWindow.on('closed', () => {
            playlistWindow = null;
        });
    } else {
        playlistWindow.focus();
    }
}

function openAboutWindow() {
    if (aboutWindow === null || aboutWindow.isDestroyed()) {
        aboutWindow = new BrowserWindow({
            width: 640,
            height: 480,
            frame: true,
            backgroundColor: '#FFFFFF',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });

        aboutWindow.loadFile('about.html');

        aboutWindow.on('closed', () => {
            aboutWindow = null;
        });
    } else {
        aboutWindow.focus();
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('player-state-changed', (event, state) => {
    mainWindow.webContents.send('player-state', state);
});

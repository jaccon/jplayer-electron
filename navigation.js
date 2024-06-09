const { dialog, Menu } = require('electron');

function setupMenu(mainWindow, openPlaylistWindow, openAboutWindow) {
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click() {
                        dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'Media Files', extensions: ['mp4', 'ogg', 'mp3', 'mkv'] },
                            ],
                        }).then(result => {
                            if (!result.canceled) {
                                mainWindow.webContents.send('open-file', result.filePaths[0]);
                            }
                        });
                    },
                },
                {
                    label: 'Open YouTube URL',
                    click() {
                        mainWindow.webContents.send('open-youtube-url');
                    },
                },
                {
                    label: 'Close Player',
                    click() {
                        mainWindow.close();
                    },
                }
            ],
        },
        {
            label: 'Playlist',
            submenu: [
                {
                    label: 'Open Playlist',
                    click() {
                        openPlaylistWindow();
                    }
                }
            ]
        },
        {
            label: 'About',
            click() {
                openAboutWindow();
            }
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

module.exports = { setupMenu };

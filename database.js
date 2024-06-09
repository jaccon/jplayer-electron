const { ipcRenderer } = require('electron');
const sqlite3 = require('sqlite3').verbose();

// Abrir o banco de dados
const db = new sqlite3.Database('playlist.db');

// Array para armazenar os arquivos na playlist
let playlist = [];

// Função para adicionar um arquivo à playlist
function addToPlaylist(filePath) {
  db.all('SELECT * FROM files WHERE path = ?', [filePath], (err, rows) => {
    if (err) {
      console.error('Error checking file in database:', err);
      return;
    }
    if (rows.length === 0) {
      playlist.push(filePath);
      const playlistBody = document.getElementById('playlistBody');
      const newRow = document.createElement('tr');
      const fileName = filePath.split('/').pop();
      newRow.innerHTML = `<td><a href="#" data-filepath="${filePath}">${fileName}</a></td>
                          <td><button class="removeButton" data-filepath="${filePath}">Remove</button></td>`;
      newRow.addEventListener('dblclick', () => {
        ipcRenderer.send('play-file', filePath);
      });
      playlistBody.appendChild(newRow);

      // Adicionar o arquivo ao banco de dados
      db.run('INSERT INTO files (path) VALUES (?)', [filePath], (err) => {
        if (err) {
          console.error('Error inserting file into database:', err);
        }
      });
    } else {
      console.log('File already in playlist:', filePath);
    }
  });
}

// Função para remover um arquivo da playlist
function removeFromPlaylist(filePath) {
  playlist = playlist.filter(item => item !== filePath);
  const playlistBody = document.getElementById('playlistBody');
  const rows = playlistBody.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowFilePath = row.querySelector('a').getAttribute('data-filepath');
    if (rowFilePath === filePath) {
      row.remove();
      break;
    }
  }

  // Remover o arquivo do banco de dados
  db.run('DELETE FROM files WHERE path = ?', [filePath], (err) => {
    if (err) {
      console.error('Error removing file from database:', err);
    }
  });
}

// Adiciona um ouvinte para receber os arquivos da playlist
ipcRenderer.on('playlist-files', (event, files) => {
  files.forEach((filePath) => {
    addToPlaylist(filePath);
  });
});

// Adiciona um ouvinte para adicionar arquivos à playlist
ipcRenderer.on('add-to-playlist', (event, filePath) => {
  addToPlaylist(filePath);
});

// Adiciona um ouvinte para remover arquivos da playlist
document.addEventListener('click', (event) => {
  if (event.target && event.target.className === 'removeButton') {
    const filePath = event.target.getAttribute('data-filepath');
    ipcRenderer.send('remove-from-playlist', filePath);
    removeFromPlaylist(filePath);
  }
});

// Fechar o banco de dados quando a aplicação for encerrada
window.addEventListener('beforeunload', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
  });
});

// Lógica JavaScript para a página playlist.html

const { ipcRenderer } = require('electron');

// Função para adicionar um arquivo à playlist
function addToPlaylist(filePath) {
  const playlistBody = document.getElementById('playlistBody');
  const newRow = document.createElement('tr');
  const fileName = filePath.split('/').pop(); // Obtém apenas o nome do arquivo, removendo o caminho
  newRow.innerHTML = `<td><a href="#" data-filepath="${filePath}">${fileName}</a></td>`;
  newRow.addEventListener('dblclick', () => {
    ipcRenderer.send('open-file', filePath);
  });
  playlistBody.appendChild(newRow);
}

// Adicione um ouvinte para o botão "Add to Playlist"
document.getElementById('addButton').addEventListener('click', () => {
  // Abre um diálogo para selecionar arquivos
  ipcRenderer.invoke('open-file-dialog').then((result) => {
    // Adiciona os arquivos selecionados à playlist
    if (!result.canceled && result.filePaths.length > 0) {
      result.filePaths.forEach((filePath) => {
        addToPlaylist(filePath);
        ipcRenderer.send('add-to-playlist', filePath); // Envia o caminho do arquivo para o processo principal para adicionar à playlist
      });
    }
  });
});

// Adicione um ouvinte para reproduzir o arquivo quando o link na tabela é clicado
document.addEventListener('click', (event) => {
  if (event.target && event.target.tagName === 'A') {
    event.preventDefault();
    const filePath = event.target.getAttribute('data-filepath');
    ipcRenderer.send('open-file', filePath);
  }
});

// Adicione um ouvinte para remover um arquivo da playlist
document.addEventListener('contextmenu', (event) => {
  event.preventDefault(); // Impede o menu de contexto padrão de aparecer
  if (event.target && event.target.tagName === 'A') {
    const filePath = event.target.getAttribute('data-filepath');
    ipcRenderer.send('remove-from-playlist', filePath); // Envia o caminho do arquivo para o processo principal para remover da playlist
  }
});

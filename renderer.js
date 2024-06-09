const { ipcRenderer } = require('electron');
const video = document.getElementById('video');
const webview = document.getElementById('webview');
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const timeline = document.getElementById('timeline');
const inputDialog = document.getElementById('inputDialog');
const submitUrlButton = document.getElementById('submitUrl');
const youtubeUrlInput = document.getElementById('youtubeUrl');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileDuration = document.getElementById('fileDuration');
const voiceStatus = document.getElementById('voiceStatus'); // Novo elemento para exibir o status

// Adicione uma variável para controlar o estado da função de comando de voz
let isVoiceCommandActive = false;

// Adicione um ouvinte para atualizar o status da função de comando de voz
ipcRenderer.on('toggle-voice-command', (event, isActive) => {
  isVoiceCommandActive = isActive;
  updateVoiceStatus();
});

// Função para atualizar dinamicamente o texto do status
function updateVoiceStatus() {
  if (isVoiceCommandActive) {
    voiceStatus.textContent = 'Voice Command: Active';
  } else {
    voiceStatus.textContent = 'Voice Command: Inactive';
  }
}

// Adicione um ouvinte de evento para atualizar o status da função de comando de voz quando recebermos uma alteração de estado
voiceStatus.addEventListener('click', () => {
  isVoiceCommandActive = !isVoiceCommandActive;
  updateVoiceStatus();
  ipcRenderer.send('toggle-voice-command', isVoiceCommandActive);
});

playButton.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    playButton.textContent = 'Pause';
  } else {
    video.pause();
    playButton.textContent = 'Play';
  }
});

stopButton.addEventListener('click', () => {
  video.pause();
  video.currentTime = 0;
  playButton.textContent = 'Play';
});

video.addEventListener('timeupdate', () => {
  timeline.value = (video.currentTime / video.duration) * 100;
});

timeline.addEventListener('input', () => {
  video.currentTime = (timeline.value / 100) * video.duration;
});

ipcRenderer.on('open-file', (event, filePath) => {
  webview.style.display = 'none';
  video.style.display = 'block';
  video.src = filePath;
  video.load();
  video.onloadedmetadata = () => {
    fileName.textContent = `File: ${filePath.split('/').pop()}`;
    const duration = new Date(video.duration * 1000).toISOString().substr(11, 8);
    fileDuration.textContent = `Duration: ${duration}`;
    fileInfo.style.display = 'block';
  };
  video.play();
  playButton.textContent = 'Pause';
});

ipcRenderer.on('open-youtube-url', (event) => {
  inputDialog.style.display = 'block';
});

// Outro código...

submitUrlButton.addEventListener('click', () => {
  const url = youtubeUrlInput.value;
  if (url) {
    webview.style.display = 'block';
    webview.src = url;
    inputDialog.style.display = 'none';
  }
});

// Canais do 11 ao 20 da sua lista original
const canais = [
  "http://www.youtube.com/channel/UC-nr9CZ9LglgqMOqSSlzytg",
  "http://www.youtube.com/channel/UC-pFzKn6fG4M6H3-mR9R7_g",
  "http://www.youtube.com/channel/UC-uWjTclXwN_p1FpXmO0YSw",
  "http://www.youtube.com/channel/UC-v8_86Y6S_yY_R_v8_86Y6",
  "http://www.youtube.com/channel/UC0-L-8lR7G_p_G_R_lR7G_p",
  "http://www.youtube.com/channel/UC088_v6S_yY_R_v8_86Y6S_y",
  "http://www.youtube.com/channel/UC0N4m9S_yY_R_v8_86Y6S_y",
  "http://www.youtube.com/channel/UC0R_v8_86Y6S_yY_R_v8_86Y",
  "http://www.youtube.com/channel/UC0Y_R_v8_86Y6S_yY_R_v8_86",
  "http://www.youtube.com/channel/UC1-U-v8_86Y6S_yY_R_v8_86Y"
];

let index = 0;

// Carrega o progresso salvo
chrome.storage.local.get(['lastIndexTeste2'], (res) => {
  if (res.lastIndexTeste2) index = res.lastIndexTeste2;
  atualizarInterface();
});

function atualizarInterface() {
  const statusDiv = document.getElementById('status');
  const btn = document.getElementById('btnAbrir');
  
  if (index < canais.length) {
    statusDiv.innerText = `Próximo: Canal ${index + 1} de ${canais.length}`;
  } else {
    statusDiv.innerText = "Lote de teste concluído!";
    btn.innerText = "TODOS INSCRITOS!";
    btn.disabled = true;
    btn.style.background = "#555";
  }
}

document.getElementById('btnAbrir').addEventListener('click', () => {
  if (index < canais.length) {
    chrome.tabs.create({ url: canais[index], active: true });
    index++;
    chrome.storage.local.set({ lastIndexTeste2: index });
    atualizarInterface();
  }
});
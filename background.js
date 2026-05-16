chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.acao === "proximo_canal") {
    chrome.storage.local.get(['idx', 'modoAuto', 'limite', 'contadorLote', 'listaCanaisUsuario'], (res) => {
      const lista = res.listaCanaisUsuario || [];
      if (lista.length === 0) return;

      let proximoIdx = (res.idx || 0) + 1;
      let contador = (res.contadorLote || 0) + 1;
      let limiteMax = parseInt(res.limite) || 50;

      // Se atingiu o limite do lote definido
      if (res.modoAuto && contador >= limiteMax) {
        chrome.storage.local.set({ modoAuto: false, contadorLote: 0 });
        alert(`LIMITE ATINGIDO! O lote de ${limiteMax} inscrições foi concluído e o motor foi pausado.`);
        return;
      }

      if (proximoIdx < lista.length) {
        chrome.storage.local.set({ idx: proximoIdx, contadorLote: contador });
        chrome.tabs.create({ url: lista[proximoIdx] });
        chrome.tabs.remove(sender.tab.id);
      } else {
        chrome.storage.local.set({ idx: 0, modoAuto: false, contadorLote: 0 });
        alert("MISSÃO CUMPRIDA! Todos os canais salvos no painel foram processados.");
      }
    });
  }

  if (request.acao === "obter_info") {
    chrome.storage.local.get(['idx', 'modoAuto', 'limite', 'listaCanaisUsuario'], (res) => {
      const lista = res.listaCanaisUsuario || [];
      sendResponse({ 
        atual: (res.idx || 0) + 1, 
        total: lista.length,
        auto: res.modoAuto || false,
        limite: res.limite || 50
      });
    });
    return true; 
  }
});

// NOVO: Ao clicar no ícone da extensão, abre direto a tela de opções (Dashboard)
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
let motorAtivo = false;

// NOVA FUNÇÃO: Tradução automática na inicialização da Interface
function traduzirInterface() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const chaveTraducao = el.getAttribute('data-i18n');
    const mensagemTraduzida = chrome.i18n.getMessage(chaveTraducao);
    if (mensagemTraduzida) {
      // Se for um botão de motor, mantém o estado correto
      if (el.id === 'btnToggleMotor') return; 
      el.innerHTML = mensagemTraduzida;
    }
  });
}

// 1. Gravar a lista e o limite
document.getElementById('btnSalvar').addEventListener('click', () => {
  const texto = document.getElementById('txtLista').value;
  const limite = document.getElementById('numLimite').value;
  
  const linhas = texto.split('\n')
                      .map(linha => linha.trim())
                      .filter(linha => linha.length > 0 && linha.startsWith('http'));

  chrome.storage.local.set({ 
    listaCanaisUsuario: linhas,
    limite: limite,
    idx: 0, 
    contadorLote: 0 
  }, () => {
    const msg = document.getElementById('statusMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
  });
});

// 2. Alternar Estado com Alertas Internacionais
const btnToggle = document.getElementById('btnToggleMotor');
btnToggle.addEventListener('click', () => {
  chrome.storage.local.get(['listaCanaisUsuario', 'idx'], (res) => {
    const lista = res.listaCanaisUsuario || [];

    if (!motorAtivo && lista.length === 0) {
      // Alertas nativos dinâmicos baseados no idioma do sistema
      alert(chrome.i18n.getUILanguage().startsWith('ja') ? "❌ エラー：リストが空です。" : "❌ Operação abortada: Lista vazia.");
      return;
    }

    if (!motorAtivo) {
      let msgAlerta = "⚠️ ATENÇÃO:\n\nVocê já fez login com a sua CONTA NOVA no YouTube?";
      if (chrome.i18n.getUILanguage().startsWith('ja')) {
        msgAlerta = "⚠️ 注意：\n\nYouTubeで新しいアカウントにログインしましたか？";
      } else if (chrome.i18n.getUILanguage().startsWith('en')) {
        msgAlerta = "⚠️ WARNING:\n\nHave you already logged into your NEW YouTube account?";
      }

      const confirmacaoConta = confirm(msgAlerta);
      if (!confirmacaoConta) return;

      motorAtivo = true;
      chrome.storage.local.set({ modoAuto: true }, () => {
        atualizarInterfaceMotor(true);
        chrome.tabs.create({ url: lista[res.idx || 0] });
      });
      return;
    }

    motorAtivo = false;
    chrome.storage.local.set({ modoAuto: false }, () => {
      atualizarInterfaceMotor(false);
    });
  });
});

function atualizarInterfaceMotor(ativo) {
  if (ativo) {
    btnToggle.innerText = chrome.i18n.getMessage("motorOn");
    btnToggle.style.background = "#28a745";
  } else {
    btnToggle.innerText = chrome.i18n.getMessage("motorOff");
    btnToggle.style.background = "#6c757d";
  }
}

// 3. Carrega os dados existentes e traduz a tela
chrome.storage.local.get(['listaCanaisUsuario', 'limite', 'modoAuto'], (res) => {
  traduzirInterface(); // roda a tradução dos textos estáticos

  const campoLista = document.getElementById('txtLista');
  const campoLimite = document.getElementById('numLimite');
  
  if (campoLista && res.listaCanaisUsuario && res.listaCanaisUsuario.length > 0) {
    campoLista.value = res.listaCanaisUsuario.join('\n');
  }
  if (campoLimite && res.limite) {
    campoLimite.value = res.limite;
  }
  
  motorAtivo = res.modoAuto || false;
  atualizarInterfaceMotor(motorAtivo);
});

// 4. Extrair canais da aba aberta do YouTube
document.getElementById('btnExtrair').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ url: "https://www.youtube.com/feed/channels*" });
  
  if (tabs.length === 0) {
    alert("Erro: youtube.com/feed/channels não encontrado.");
    return;
  }

  const targetTab = tabs[0];

  chrome.scripting.executeScript({
    target: { tabId: targetTab.id },
    func: () => {
      const elementos = document.querySelectorAll('span, yt-formatted-string, a');
      const handlesEncontrados = new Set();
      
      elementos.forEach(el => {
        const texto = el.innerText ? el.innerText.trim() : "";
        if (texto.startsWith('@')) {
          const handleLimpo = texto.split(' ')[0].split('\n')[0];
          handlesEncontrados.add(handleLimpo);
        }
      });
      return Array.from(handlesEncontrados).map(h => `https://www.youtube.com/${h}`);
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const linksExtraidos = results[0].result;
      if (linksExtraidos.length > 0) {
        document.getElementById('txtLista').value = linksExtraidos.join('\n');
        alert("Canais importados com sucesso!");
      }
    }
  });
});
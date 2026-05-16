function injetarPainelControle() {
  if (document.getElementById('migrador-container')) return;

  chrome.runtime.sendMessage({ acao: "obter_info" }, (response) => {
    if (!response) return;

    // REGRA DE VISIBILIDADE: Se o piloto automático não estiver ativo, não exibe nada na página
    if (!response.auto) return;

    const container = document.createElement('div');
    container.id = 'migrador-container';
    container.style = "position:fixed; top:60px; left:50%; transform:translateX(-50%); z-index:999999; display:flex; flex-direction:column; align-items:center; background:#111; padding:14px; border-radius:0 0 15px 15px; border:2px solid #ff0000; box-shadow:0 10px 30px rgba(0,0,0,0.8); font-family: sans-serif; min-width: 220px; text-align: center;";

    // Injeta o ícone laranja alinhado ao contador e insere a assinatura no rodapé do painel
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
        <img src="${chrome.runtime.getURL('icon128.png')}" style="border-radius: 4px;">
        <span style="color: white; font-size: 12px; font-weight: bold; letter-spacing: 0.5px;">
            PROCESSANDO: ${response.atual} / ${response.total}
        </span>
      </div>
      <button id="btnPararForcado" style="padding:8px 16px; background:#ff0000; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px; width: 100%; text-transform: uppercase; letter-spacing: 0.5px;">
          PAUSAR AUTOMAÇÃO ⏸
      </button>
      <div style="color: #888; font-size: 9px; margin-top: 6px; font-weight: bold; letter-spacing: 0.3px;">
        by Fernando Tajiri (田尻)
      </div>
    `;

    document.body.appendChild(container);

    const btnPausa = document.getElementById('btnPararForcado');

    // Motor de Automação de Inscrição Inteligente (Sem alterar sua lógica original)
    const realizarInscricao = async () => {
      const viewModel = document.querySelector('yt-subscribe-button-view-model');
      let btnReal = viewModel ? viewModel.querySelector('button') : document.querySelector('button[aria-label*="Inscrever"], button[aria-label*="Subscribe"]');

      if (btnReal) {
        const label = btnReal.getAttribute('aria-label') || "";
        const jaInscrito = label.includes("cancelar") || label.includes("unsubscribe") || label.includes("inscrito");

        if (!jaInscrito) {
          btnReal.focus();
          ['mousedown', 'mouseup', 'click'].forEach(evt => {
            btnReal.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }));
          });
        }
      }

      setTimeout(() => {
        chrome.runtime.sendMessage({ acao: "proximo_canal" });
      }, 3000);
    };

    // Temporizador de segurança para dar o clique automático
    let timerExecucao = setTimeout(realizarInscricao, 4000);

    // Função do botão de Pausa Forçada
    btnPausa.onclick = () => {
      clearTimeout(timerExecucao); 
      
      chrome.runtime.sendMessage({ acao: "set_config", auto: false, limite: response.limite });
      
      btnPausa.innerHTML = "PAUSADO! FECHE A ABA";
      btnPausa.style.background = "#6c757d";
      btnPausa.disabled = true;
    };
  });
}

setTimeout(injetarPainelControle, 4000);
// carrinho.js — carrinho lateral do NULLWEAR
// Guarda os itens no localStorage, então eles continuam ao trocar de página.

(function () {
  const CHAVE = "nullwear_carrinho";

  // ---------- estado ----------
  function lerCarrinho() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || [];
    } catch (e) {
      return [];
    }
  }

  function salvarCarrinho(itens) {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  }

  let itens = lerCarrinho();

  // ---------- utilidades ----------
  function formatarPreco(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  // "R$ 89,90" -> 89.9
  function lerPreco(texto) {
    const limpo = String(texto)
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3})/g, "")
      .replace(",", ".");
    return parseFloat(limpo) || 0;
  }

  function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  // ---------- cria a gaveta no HTML ----------
  function criarGaveta() {
    const overlay = document.createElement("div");
    overlay.className = "carrinho-overlay";
    overlay.id = "carrinho-overlay";

    const gaveta = document.createElement("aside");
    gaveta.className = "carrinho-gaveta";
    gaveta.id = "carrinho-gaveta";
    gaveta.setAttribute("aria-label", "Carrinho de compras");
    gaveta.innerHTML = `
      <header class="carrinho-topo">
        <h2>Seu carrinho</h2>
        <button type="button" class="carrinho-fechar" id="carrinho-fechar" aria-label="Fechar carrinho">&times;</button>
      </header>
      <div class="carrinho-lista" id="carrinho-lista"></div>
      <footer class="carrinho-rodape">
        <div class="carrinho-total">
          <span>Total</span>
          <strong id="carrinho-total">R$ 0,00</strong>
        </div>
        <button type="button" class="carrinho-finalizar" id="carrinho-finalizar">Finalizar compra</button>
      </footer>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(gaveta);
  }

  // ---------- abrir / fechar ----------
  function abrir() {
    document.getElementById("carrinho-gaveta").classList.add("aberta");
    document.getElementById("carrinho-overlay").classList.add("aberta");
    document.body.classList.add("carrinho-aberto");
  }

  function fechar() {
    document.getElementById("carrinho-gaveta").classList.remove("aberta");
    document.getElementById("carrinho-overlay").classList.remove("aberta");
    document.body.classList.remove("carrinho-aberto");
  }

  // ---------- desenha os itens ----------
  function render() {
    const lista = document.getElementById("carrinho-lista");
    const totalEl = document.getElementById("carrinho-total");
    const btnFinalizar = document.getElementById("carrinho-finalizar");

    if (itens.length === 0) {
      lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
      totalEl.textContent = formatarPreco(0);
      btnFinalizar.disabled = true;
    } else {
      lista.innerHTML = itens
        .map(
          (item) => `
        <article class="carrinho-item" data-id="${escapar(item.id)}">
          ${item.img ? `<img src="${escapar(item.img)}" alt="${escapar(item.nome)}">` : ""}
          <div class="carrinho-info">
            <h3>${escapar(item.nome)}</h3>
            <span class="carrinho-preco">${formatarPreco(item.preco)}</span>
            <div class="carrinho-qtd">
              <button type="button" data-acao="menos" aria-label="Diminuir quantidade">−</button>
              <span>${item.qtd}</span>
              <button type="button" data-acao="mais" aria-label="Aumentar quantidade">+</button>
            </div>
          </div>
          <button type="button" class="carrinho-remover" data-acao="remover" aria-label="Remover item">&times;</button>
        </article>`
        )
        .join("");

      const total = itens.reduce((soma, i) => soma + i.preco * i.qtd, 0);
      totalEl.textContent = formatarPreco(total);
      btnFinalizar.disabled = false;
    }

    // atualiza o número do ícone do carrinho
    const quantidade = itens.reduce((soma, i) => soma + i.qtd, 0);
    document.querySelectorAll("#contador-carrinho").forEach((el) => {
      el.textContent = quantidade;
    });
  }

  // ---------- ações ----------
  function adicionar(produto) {
    const existente = itens.find((i) => i.id === produto.id);
    if (existente) {
      existente.qtd += 1;
    } else {
      itens.push({ ...produto, qtd: 1 });
    }
    salvarCarrinho(itens);
    render();
    abrir();
  }

  function alterarQtd(id, delta) {
    const item = itens.find((i) => i.id === id);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd <= 0) itens = itens.filter((i) => i.id !== id);
    salvarCarrinho(itens);
    render();
  }

  function remover(id) {
    itens = itens.filter((i) => i.id !== id);
    salvarCarrinho(itens);
    render();
  }

  // Lê os dados do produto: primeiro pelos data-*, senão tenta pegar do card
  function lerProduto(botao) {
    const card = botao.closest("article, .card, .produto") || document;
    const nome =
      botao.dataset.nome ||
      (card.querySelector("h2, h3, h4") || {}).textContent ||
      "Produto";
    const textoPreco =
      botao.dataset.preco ||
      (card.querySelector(".preco, .price") || {}).textContent ||
      "0";
    const imgEl = card.querySelector ? card.querySelector("img") : null;
    const img = botao.dataset.img || (imgEl ? imgEl.getAttribute("src") : "");

    return {
      id: botao.dataset.id || nome.trim().toLowerCase().replace(/\s+/g, "-"),
      nome: nome.trim(),
      preco: lerPreco(textoPreco),
      img: img,
    };
  }

  // ---------- inicialização ----------
  document.addEventListener("DOMContentLoaded", function () {
    criarGaveta();
    render();

    // botões "Comprar"
    document.querySelectorAll("[data-add-carrinho]").forEach((botao) => {
      botao.addEventListener("click", function (e) {
        e.preventDefault(); // impede de ir direto para conta.html
        adicionar(lerProduto(botao));
      });
    });

    // ícone do carrinho no cabeçalho
    const abrirBtn = document.getElementById("abrir-carrinho");
    if (abrirBtn) {
      abrirBtn.addEventListener("click", function (e) {
        e.preventDefault();
        abrir();
      });
    }

    // fechar
    document.getElementById("carrinho-fechar").addEventListener("click", fechar);
    document.getElementById("carrinho-overlay").addEventListener("click", fechar);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fechar();
    });

    // +, − e remover (delegação de eventos)
    document.getElementById("carrinho-lista").addEventListener("click", function (e) {
      const botao = e.target.closest("[data-acao]");
      if (!botao) return;
      const id = botao.closest(".carrinho-item").dataset.id;
      const acao = botao.dataset.acao;
      if (acao === "mais") alterarQtd(id, 1);
      if (acao === "menos") alterarQtd(id, -1);
      if (acao === "remover") remover(id);
    });

    // finalizar compra -> página conta
    document.getElementById("carrinho-finalizar").addEventListener("click", function () {
      if (itens.length === 0) return;
      window.location.href = "conta.html";
    });
  });
})();

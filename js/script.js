"use strict";

const CHAVE_SACOLA = "nullwear-sacola";
const CHAVE_MENSAGENS = "nullwear-mensagens";

let filtroAtual = "todos";
let textoBusca = "";
let timerToast;

function lerLocalStorage(chave, valorPadrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : valorPadrao;
  } catch (erro) {
    console.warn("Erro ao ler os dados salvos.", erro);
    return valorPadrao;
  }
}

function salvarLocalStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.warn("Erro ao salvar os dados.", erro);
    mostrarToast("O navegador não conseguiu salvar os dados.");
    return false;
  }
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.classList.add("visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove("visivel"), 2600);
}

function obterSacola() {
  const sacola = lerLocalStorage(CHAVE_SACOLA, []);
  return Array.isArray(sacola) ? sacola : [];
}

function atualizarContadorSacola() {
  const contador = document.getElementById("contador-sacola");
  const quantidade = obterSacola().reduce((total, item) => total + item.quantidade, 0);
  if (contador) contador.textContent = quantidade;
}

function adicionarSacola(nomeProduto) {
  const sacola = obterSacola();
  const produtoExistente = sacola.find(item => item.nome === nomeProduto);

  if (produtoExistente) {
    produtoExistente.quantidade += 1;
  } else {
    sacola.push({ nome: nomeProduto, quantidade: 1 });
  }

  if (salvarLocalStorage(CHAVE_SACOLA, sacola)) {
    atualizarContadorSacola();
    const aviso = document.getElementById("aviso-sacola");
    if (aviso) aviso.textContent = `${nomeProduto} foi adicionado à sua sacola.`;
    mostrarToast(`${nomeProduto} adicionado à sacola.`);
  }
}

function aplicarFiltros() {
  const produtos = document.querySelectorAll(".produto");
  let encontrados = 0;

  produtos.forEach(produto => {
    const categoria = produto.dataset.categoria;
    const nome = (produto.dataset.nome || "").toLocaleLowerCase("pt-BR");
    const combinaCategoria = filtroAtual === "todos" || categoria === filtroAtual;
    const combinaBusca = nome.includes(textoBusca.toLocaleLowerCase("pt-BR"));
    const mostrar = combinaCategoria && combinaBusca;

    produto.hidden = !mostrar;
    if (mostrar) encontrados++;
  });

  const resultado = document.getElementById("resultado-busca");
  const vazio = document.getElementById("sem-resultados");
  if (resultado) resultado.textContent = `${encontrados} ${encontrados === 1 ? "peça encontrada" : "peças encontradas"}`;
  if (vazio) vazio.hidden = encontrados !== 0;
}

function configurarFiltros() {
  const botoes = document.querySelectorAll(".filtro");
  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      filtroAtual = botao.dataset.filtro || "todos";
      botoes.forEach(outro => {
        const ativo = outro === botao;
        outro.classList.toggle("ativo", ativo);
        outro.setAttribute("aria-pressed", String(ativo));
      });
      aplicarFiltros();
    });
  });

  const busca = document.getElementById("busca-produtos");
  busca.addEventListener("input", event => {
    textoBusca = event.target.value.trim();
    aplicarFiltros();
  });

  document.getElementById("limpar-filtros").addEventListener("click", () => {
    filtroAtual = "todos";
    textoBusca = "";
    busca.value = "";
    botoes.forEach(botao => {
      const ativo = botao.dataset.filtro === "todos";
      botao.classList.toggle("ativo", ativo);
      botao.setAttribute("aria-pressed", String(ativo));
    });
    aplicarFiltros();
    busca.focus();
  });
}

function configurarMenuMobile() {
  const botao = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu-principal");
  if (!botao || !menu) return;

  botao.addEventListener("click", () => {
    const aberto = botao.getAttribute("aria-expanded") === "true";
    botao.setAttribute("aria-expanded", String(!aberto));
    botao.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
    menu.classList.toggle("aberto", !aberto);
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir menu");
    });
  });
}

function definirErro(campo, mensagem) {
  const entrada = document.getElementById(campo);
  const erro = document.getElementById(`erro-${campo}`);
  if (!entrada || !erro) return;
  entrada.classList.toggle("invalido", Boolean(mensagem));
  entrada.setAttribute("aria-invalid", String(Boolean(mensagem)));
  erro.textContent = mensagem;
}

function validarContato(dados) {
  let valido = true;
  const nomeValido = dados.nome.trim().length >= 3;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim());
  const assuntoValido = dados.assunto !== "";
  const mensagemValida = dados.mensagem.trim().length >= 10;

  definirErro("nome", nomeValido ? "" : "Digite seu nome completo (mínimo de 3 caracteres).");
  definirErro("email", emailValido ? "" : "Informe um e-mail válido.");
  definirErro("assunto", assuntoValido ? "" : "Selecione um assunto.");
  definirErro("mensagem", mensagemValida ? "" : "Escreva uma mensagem com pelo menos 10 caracteres.");

  if (!nomeValido || !emailValido || !assuntoValido || !mensagemValida) {
    valido = false;
  }
  return valido;
}

function configurarFormulario() {
  const formulario = document.getElementById("form-contato");
  if (!formulario) return;

  ["nome", "email", "assunto", "mensagem"].forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener("input", () => {
      if (campo.classList.contains("invalido")) {
        const dados = Object.fromEntries(new FormData(formulario).entries());
        validarContato({
          nome: dados.nome || "",
          email: dados.email || "",
          assunto: dados.assunto || "",
          mensagem: dados.mensagem || ""
        });
      }
    });
  });

  formulario.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(formulario);
    const dados = {
      nome: String(formData.get("nome") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      telefone: String(formData.get("telefone") || "").trim(),
      assunto: String(formData.get("assunto") || ""),
      mensagem: String(formData.get("mensagem") || "").trim(),
      newsletter: formData.get("newsletter") === "on",
      criadoEm: new Date().toISOString()
    };

    if (!validarContato(dados)) {
      const primeiroInvalido = formulario.querySelector(".invalido");
      if (primeiroInvalido) primeiroInvalido.focus();
      document.getElementById("status-contato").textContent = "Revise os campos destacados antes de enviar.";
      return;
    }

    const mensagens = lerLocalStorage(CHAVE_MENSAGENS, []);
    mensagens.push(dados);
    const salvou = salvarLocalStorage(CHAVE_MENSAGENS, mensagens);
    const status = document.getElementById("status-contato");

    if (salvou) {
      status.textContent = "Mensagem registrada neste navegador. O formulário não envia e-mails.";
      mostrarToast("Dados salvos neste navegador.");
      formulario.reset();
      ["nome", "email", "assunto", "mensagem"].forEach(id => definirErro(id, ""));
    }
  });
}

function configurarBotoesSacola() {
  document.querySelectorAll(".botao-adicionar").forEach(botao => {
    botao.addEventListener("click", () => adicionarSacola(botao.dataset.produto));
  });
}

function iniciarPagina() {
  configurarMenuMobile();
  configurarFiltros();
  configurarFormulario();
  configurarBotoesSacola();
  atualizarContadorSacola();
  aplicarFiltros();
}

document.addEventListener("DOMContentLoaded", iniciarPagina);

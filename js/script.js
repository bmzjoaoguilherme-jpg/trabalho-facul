"use strict";


const CHAVE_SACOLA = "nullwear-sacola";
const CHAVE_MENSAGENS = "nullwear-mensagens";
const IDIOMA = "pt-BR";

const CAMPOS_CONTATO = ["nome", "email", "assunto", "mensagem"];
const CAMPOS_LOGIN = ["login-email", "login-senha"];
const CAMPOS_CADASTRO = ["cad-nome", "cad-email", "cad-senha"];

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
  if (!contador) return;
  const quantidade = obterSacola().reduce((total, item) => total + (Number(item.quantidade) || 0), 0);
  contador.textContent = quantidade;
}

function adicionarSacola(nomeProduto) {
  if (!nomeProduto) return;
  const sacola = obterSacola();
  const produtoExistente = sacola.find(item => item.nome === nomeProduto);

  if (produtoExistente) {
    produtoExistente.quantidade = (Number(produtoExistente.quantidade) || 0) + 1;
  } else {
    sacola.push({ nome: nomeProduto, quantidade: 1 });
  }

  if (salvarLocalStorage(CHAVE_SACOLA, sacola)) {
    atualizarContadorSacola();
    mostrarToast(`${nomeProduto} adicionado à sacola.`);
  }
}

function configurarBotoesSacola() {
  document.querySelectorAll(".botao-adicionar").forEach(botao => {
    botao.addEventListener("click", () => {
      // O nome vem do próprio card; data-produto fica como reserva.
      const nome = botao.closest(".produto")?.dataset.nome || botao.dataset.produto;
      adicionarSacola(nome);
    });
  });
}


function normalizar(texto) {
  return texto
    .toLocaleLowerCase(IDIOMA)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function atualizarBotoesFiltro(valorAtivo) {
  document.querySelectorAll(".filtro").forEach(botao => {
    const ativo = botao.dataset.filtro === valorAtivo;
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
}

function aplicarFiltros() {
  const produtos = document.querySelectorAll(".produto");
  if (produtos.length === 0) return;

  const termo = normalizar(textoBusca);
  let encontrados = 0;

  produtos.forEach(produto => {
    const nome = normalizar(produto.dataset.nome || "");
    const combinaCategoria = filtroAtual === "todos" || produto.dataset.categoria === filtroAtual;
    const mostrar = combinaCategoria && nome.includes(termo);

    produto.hidden = !mostrar;
    if (mostrar) encontrados++;
  });

  const resultado = document.getElementById("resultado-busca");
  const vazio = document.getElementById("sem-resultados");
  if (resultado) {
    resultado.textContent = `${encontrados} ${encontrados === 1 ? "peça encontrada" : "peças encontradas"}`;
  }
  if (vazio) vazio.hidden = encontrados !== 0;
}

function configurarFiltros() {
  const busca = document.getElementById("busca-produtos");
  const botoes = document.querySelectorAll(".filtro");
  if (!busca || botoes.length === 0) return;

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      filtroAtual = botao.dataset.filtro || "todos";
      atualizarBotoesFiltro(filtroAtual);
      aplicarFiltros();
    });
  });

  busca.addEventListener("input", event => {
    textoBusca = event.target.value.trim();
    aplicarFiltros();
  });

  const limpar = document.getElementById("limpar-filtros");
  if (limpar) {
    limpar.addEventListener("click", () => {
      filtroAtual = "todos";
      textoBusca = "";
      busca.value = "";
      atualizarBotoesFiltro(filtroAtual);
      aplicarFiltros();
      busca.focus();
    });
  }
}


function configurarMenuMobile() {
  const botao = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu-principal");
  if (!botao || !menu) return;

  function definirMenu(aberto) {
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("aberto", aberto);
  }

  botao.addEventListener("click", () => {
    definirMenu(botao.getAttribute("aria-expanded") !== "true");
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => definirMenu(false));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.classList.contains("aberto")) {
      definirMenu(false);
      botao.focus();
    }
  });
}


const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const regraNome = valor =>
  valor.trim().length >= 3 || "Digite seu nome completo (mínimo de 3 caracteres).";
const regraEmail = valor =>
  REGEX_EMAIL.test(valor.trim()) || "Informe um e-mail válido.";

const REGRAS = {
  "nome": regraNome,
  "email": regraEmail,
  "assunto": valor => valor !== "" || "Selecione um assunto.",
  "mensagem": valor => valor.trim().length >= 10 || "Escreva uma mensagem com pelo menos 10 caracteres.",
  "login-email": regraEmail,
  "login-senha": valor => valor !== "" || "Digite sua senha.",
  "cad-nome": regraNome,
  "cad-email": regraEmail,
  "cad-senha": valor => valor.length >= 8 || "A senha precisa ter pelo menos 8 caracteres."
};

function definirErro(id, mensagem) {
  const entrada = document.getElementById(id);
  const erro = document.getElementById(`erro-${id}`);
  if (!entrada || !erro) return;

  entrada.classList.toggle("invalido", Boolean(mensagem));
  entrada.setAttribute("aria-invalid", String(Boolean(mensagem)));
  entrada.setAttribute("aria-describedby", erro.id);
  erro.textContent = mensagem;
}

function validarCampo(id) {
  const entrada = document.getElementById(id);
  const regra = REGRAS[id];
  if (!entrada || !regra) return true;

  const resultado = regra(entrada.value);
  definirErro(id, resultado === true ? "" : resultado);
  return resultado === true;
}

function limparErros(campos) {
  campos.forEach(id => definirErro(id, ""));
}

function configurarFormulario(idFormulario, campos, aoValidar) {
  const formulario = document.getElementById(idFormulario);
  if (!formulario) return;
  const status = formulario.querySelector(".status-formulario");

  campos.forEach(id => {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.addEventListener("blur", () => validarCampo(id));
    campo.addEventListener("input", () => {
      if (campo.classList.contains("invalido")) validarCampo(id);
    });
  });

  formulario.addEventListener("submit", event => {
    event.preventDefault();

 
    const todosValidos = campos.map(validarCampo).every(Boolean);

    if (!todosValidos) {
      formulario.querySelector(".invalido")?.focus();
      if (status) status.textContent = "Revise os campos destacados antes de enviar.";
      return;
    }
    aoValidar(formulario, status);
  });
}


function enviarContato(formulario, status) {
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

  const mensagens = lerLocalStorage(CHAVE_MENSAGENS, []);
  mensagens.push(dados);

  if (salvarLocalStorage(CHAVE_MENSAGENS, mensagens)) {
    if (status) status.textContent = "Mensagem registrada neste navegador. O formulário não envia e-mails.";
    mostrarToast("Dados salvos neste navegador.");
    formulario.reset();
    limparErros(CAMPOS_CONTATO);
  }
}


function simularConta(campos) {
  return (formulario, status) => {
    if (status) status.textContent = "Formulário demonstrativo: nenhum dado foi enviado ou salvo.";
    mostrarToast("Formulário validado (demonstração).");
    formulario.reset();
    limparErros(campos);
  };
}

/* ===== Inicialização ===== */
function iniciarPagina() {
  configurarMenuMobile();
  configurarFiltros();
  configurarBotoesSacola();
  configurarFormulario("form-contato", CAMPOS_CONTATO, enviarContato);
  configurarFormulario("form-login", CAMPOS_LOGIN, simularConta(CAMPOS_LOGIN));
  configurarFormulario("form-cadastro", CAMPOS_CADASTRO, simularConta(CAMPOS_CADASTRO));
  atualizarContadorSacola();
  aplicarFiltros();
}

document.addEventListener("DOMContentLoaded", iniciarPagina);

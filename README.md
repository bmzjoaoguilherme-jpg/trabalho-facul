# NULLWEAR

Landing page de uma loja de roupas para devs, desenvolvida como projeto da disciplina de **Linguagens de Programação para Web (LPW)**. A loja vende a coleção autoral **ES/TADS**, com estampas inspiradas em programação.

O objetivo foi aplicar HTML semântico, CSS e Flexbox na construção de uma identidade visual de marca.

## Identidade visual

| Elemento    | Cor                            |
|-------------|---------------------------------|
| Fundo       | `#0e0e0e` (preto)               |
| Fundo alt.  | `#161616`                       |
| Destaque    | `#8b5cf6` (roxo)                |
| Texto       | `#f5f0e6` (marfim)              |

A paleta em preto e roxo remete às cores das próprias estampas da coleção (tela de editor de código).

**Fontes:** Georgia (títulos) e Arial (textos), com `Courier New` (monoespaçada) nos preços e legendas, reforçando o tema de programação.

## Funcionalidades

- Cabeçalho fixo com navegação
- Seção de apresentação da marca (hero)
- Vitrine de produtos em cards (Flexbox), com botão de comprar
- Seção "Sobre" contando a história da marca
- Formulário de contato com campos de texto, e-mail, telefone, select, textarea e checkbox
- Página `conta.html` com formulários de login e cadastro, aberta ao clicar em "Comprar"
- Rodapé com redes sociais

> Os formulários (login, cadastro, contato) são apenas visuais/estáticos — não há back-end, então nenhum dado é realmente enviado ou salvo. Isso está fora do escopo da disciplina até aqui.

## Tecnologias

- HTML5 semântico (`header`, `nav`, `main`, `section`, `article`, `footer`, `form`, `fieldset`)
- CSS3 (seletores por classe, Box Model, Flexbox)

## Estrutura de pastas

```
trabalho-facul/
├── index.html
├── conta.html
├── css/
│   └── style.css
├── img/
│   └── (fotos dos produtos)
└── README.md
```

## Como executar

1. Clone este repositório
   ```bash
   git clone https://github.com/bmzjoaoguilherme-jpg/trabalho-facul.git
   ```
2. Abra o arquivo `index.html` no navegador (ou use a extensão *Live Server* do VS Code)

## Autor

João Guilherme de Araújo e João Vitor Vosgale, 2º período de TADS.

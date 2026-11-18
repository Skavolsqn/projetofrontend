"use strict";

/* ===== Configuração do envio =====
   Cole aqui o endpoint do Formspree (https://formspree.io/f/SEU_ID).
   Deixe vazio para apenas simular o envio. */
const FORM_ENDPOINT = "";

const ITENS = [
  { id: 1, nome: "Casaco azul-marinho", cat: "Roupas", status: "Achado", local: "Quadra", data: "10/11", emoji: "🧥", desc: "Casaco de moletom tamanho M, com capuz e zíper." },
  { id: 2, nome: "Fone de ouvido branco", cat: "Eletrônicos", status: "Achado", local: "Biblioteca", data: "12/11", emoji: "🎧", desc: "Fone sem fio, estojo com arranhão." },
  { id: 3, nome: "Garrafa térmica verde", cat: "Material", status: "Achado", local: "Cantina", data: "09/11", emoji: "🧴", desc: "Garrafa de 500 ml com adesivo de estrela." },
  { id: 4, nome: "Calculadora científica", cat: "Eletrônicos", status: "Perdido", local: "Sala 12", data: "13/11", emoji: "🧮", desc: "Procurada por aluno do 2º ano. Tem o nome na traseira." },
  { id: 5, nome: "Estojo vermelho", cat: "Material", status: "Achado", local: "Pátio", data: "11/11", emoji: "✏️", desc: "Estojo com canetas, régua e uma borracha em formato de gato." },
  { id: 6, nome: "Camiseta de educação física", cat: "Roupas", status: "Perdido", local: "Vestiário", data: "14/11", emoji: "👕", desc: "Camiseta branca do uniforme, tamanho P." },
  { id: 7, nome: "Pen drive preto", cat: "Eletrônicos", status: "Achado", local: "Lab. de informática", data: "15/11", emoji: "💾", desc: "Pen drive de 32 GB com chaveiro azul." },
  { id: 8, nome: "Caderno de matemática", cat: "Material", status: "Perdido", local: "Sala 5", data: "16/11", emoji: "📓", desc: "Capa roxa, nome escrito na primeira página." }
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ===== Efeito 1: modo claro/escuro (lembra a escolha) ===== */
const btnTema = $("#tema");
function aplicarTema(t) {
  document.documentElement.setAttribute("data-bs-theme", t);
  btnTema.textContent = t === "dark" ? "☀️ Modo claro" : "🌙 Modo escuro";
}
let temaSalvo = "light";
try { temaSalvo = localStorage.getItem("tema") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); } catch (e) {}
aplicarTema(temaSalvo);
btnTema.addEventListener("click", () => {
  const novo = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
  aplicarTema(novo);
  try { localStorage.setItem("tema", novo); } catch (e) {}
});

/* ===== Efeito 2: filtros dos itens + cards dinâmicos ===== */
const lista = $("#lista");
function renderItens(filtro = "todos") {
  const itens = ITENS.filter(i => filtro === "todos" || i.status === filtro || i.cat === filtro);
  lista.innerHTML = itens.map(i => `
    <div class="col-sm-6 col-lg-3">
      <article class="card item" tabindex="0" role="button" data-id="${i.id}" aria-label="Ver detalhes: ${i.nome}">
        <div class="thumb" aria-hidden="true">${i.emoji}</div>
        <div class="card-body">
          <span class="badge badge-st st-${i.status} mb-2">${i.status === "Perdido" ? "Procurado" : "Achado"}</span>
          <h3 class="h6 mb-1">${i.nome}</h3>
          <small>${i.local} · ${i.data}</small>
        </div>
      </article>
    </div>`).join("");
  $("#vazio").classList.toggle("d-none", itens.length > 0);
}
$("#filtros").addEventListener("click", e => {
  const b = e.target.closest("[data-filtro]");
  if (!b) return;
  $$(".btn-filter").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  renderItens(b.dataset.filtro);
});
renderItens();

/* ===== Modal de detalhes do item ===== */
const modal = new bootstrap.Modal($("#modalItem"));
function abrirItem(el) {
  const item = ITENS.find(i => i.id === Number(el.dataset.id));
  if (!item) return;
  $("#mTitulo").textContent = item.nome;
  $("#mCorpo").innerHTML = `<p class="display-4 mb-2">${item.emoji}</p><p>${item.desc}</p><p class="mb-0"><strong>Local:</strong> ${item.local}<br><strong>Data:</strong> ${item.data}<br><strong>Categoria:</strong> ${item.cat}</p>`;
  $("#mAcao").dataset.item = item.nome;
  modal.show();
}
lista.addEventListener("click", e => { const c = e.target.closest(".item"); if (c) abrirItem(c); });
lista.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { const c = e.target.closest(".item"); if (c) { e.preventDefault(); abrirItem(c); } }
});
$("#mAcao").addEventListener("click", e => {
  $("#assunto").value = "Quero retirar um item";
  $("#mensagem").value = `Olá! Acho que o item "${e.currentTarget.dataset.item}" é meu. `;
  setTimeout(() => $("#contato").scrollIntoView({ behavior: "smooth" }), 250);
});

/* ===== Efeito 3: contadores animados ===== */
function contar(el) {
  const alvo = Number(el.dataset.count);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = alvo; return; }
  const ini = performance.now(), dur = 1200;
  (function passo(t) {
    const p = Math.min((t - ini) / dur, 1);
    el.textContent = Math.round(alvo * p);
    if (p < 1) requestAnimationFrame(passo);
  })(ini);
}
const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { contar(e.target); obs.unobserve(e.target); } }), { threshold: .5 });
$$("[data-count]").forEach(el => obs.observe(el));

/* ===== Fecha o menu mobile ao clicar em um link ===== */
$$("#menu .nav-link").forEach(a => a.addEventListener("click", () => {
  const m = bootstrap.Collapse.getInstance($("#menu"));
  if (m && getComputedStyle($(".navbar-toggler")).display !== "none") m.hide();
}));

/* ===== Formulário: validação + envio ===== */
const form = $("#form"), retorno = $("#retorno"), btn = $("#enviar");
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
function campoOk(c) {
  const v = c.value.trim();
  let ok = v !== "" && (!c.minLength || c.minLength < 0 || v.length >= c.minLength);
  if (c.type === "email") ok = emailOk(v);
  c.classList.toggle("is-invalid", !ok);
  c.classList.toggle("is-valid", ok);
  return ok;
}
$$("input,select,textarea", form).forEach(c => c.addEventListener("blur", () => campoOk(c)));
form.addEventListener("submit", async e => {
  e.preventDefault();
  const campos = $$("input,select,textarea", form);
  const validos = campos.map(campoOk).every(Boolean);
  if (!validos) {
    retorno.innerHTML = `<div class="alert alert-danger">Revise os campos em vermelho e tente de novo.</div>`;
    $(".is-invalid", form).focus();
    return;
  }
  btn.disabled = true; btn.textContent = "Enviando...";
  const dados = { nome: $("#nome").value.trim(), email: $("#email").value.trim(), assunto: $("#assunto").value, mensagem: $("#mensagem").value.trim() };
  try {
    if (FORM_ENDPOINT) {
      const r = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(dados) });
      if (!r.ok) throw new Error("Falha no envio");
    } else {
      await new Promise(r => setTimeout(r, 900)); // simulação
    }
    retorno.innerHTML = `<div class="alert alert-success">Mensagem enviada, ${dados.nome.split(" ")[0]}! Responderemos em até 2 dias úteis.</div>`;
    form.reset();
    $$(".is-valid", form).forEach(c => c.classList.remove("is-valid"));
  } catch (err) {
    retorno.innerHTML = `<div class="alert alert-danger">Não foi possível enviar agora. Tente de novo ou fale com a secretaria.</div>`;
  } finally {
    btn.disabled = false; btn.textContent = "Enviar mensagem";
  }
});

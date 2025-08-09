class Pedido {
  constructor() {
    this.claves = ['bebidas', 'saladas', 'dulces'];
    this.storageKey = 'pedidoCafeteria';
    this.selecciones = { bebidas: [], saladas: [], dulces: [] };
    this.recuperarStorage();
  }
  agregarItem(categoria, item) {
    const arr = this.selecciones[categoria];
    const idx = arr.findIndex(i => i.nombre === item.nombre);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push({ nombre: item.nombre, precio: item.precio, imagen: item.imagen });
    localStorage.setItem(this.storageKey, JSON.stringify(this.selecciones));
  }
  calcularTotal() {
    return this.claves.flatMap(cat => this.selecciones[cat])
      .reduce((acc, it) => acc + (it?.precio || 0), 0);
  }
  recuperarStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      this.claves.forEach(cat => {
        if (Array.isArray(parsed?.[cat])) this.selecciones[cat] = parsed[cat];
      });
    } catch {}
  }
  reset() {
    this.selecciones = { bebidas: [], saladas: [], dulces: [] };
    localStorage.setItem(this.storageKey, JSON.stringify(this.selecciones));
  }
}

function setVis(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? 'block' : 'none';
}
function msg(texto) {
  const p = document.getElementById('mensaje-final');
  if (p) p.textContent = texto || '';
}
function seededImage(seed, w = 400, h = 300) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
function normalizeText(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const menuFallback = {
  bebidas: [
    { nombre: "Café con leche", precio: 149, imagen: seededImage('cafe-con-leche') },
    { nombre: "Cappuccino", precio: 169, imagen: seededImage('cappuccino') },
    { nombre: "Cappuccino vegano", precio: 189, imagen: seededImage('cappuccino-vegano') },
    { nombre: "Chocolate caliente", precio: 199, imagen: seededImage('chocolate-caliente') }
  ],
  saladas: [
    { nombre: "Tostado", precio: 219, imagen: seededImage('tostado') },
    { nombre: "Tostada con palta", precio: 249, imagen: seededImage('tostada-con-palta') },
    { nombre: "Scon de jamón crudo", precio: 279, imagen: seededImage('scon-crudo') },
    { nombre: "Sorpresa del día", precio: 229, imagen: seededImage('sorpresa-dia') }
  ],
  dulces: [
    { nombre: "Magdalena", precio: 120, imagen: seededImage('magdalena') },
    { nombre: "Cookie", precio: 130, imagen: seededImage('cookie') },
    { nombre: "Brownie", precio: 150, imagen: seededImage('brownie') },
    { nombre: "Torta de oro 18 kilates", precio: 40000, imagen: seededImage('torta-oro') }
  ]
};
let menu = menuFallback;

let filtroTexto = '';

function crearBotonItem(item, onClick, seleccionado) {
  const btn = document.createElement('button');
  const img = document.createElement('img');
  img.src = item.imagen;
  img.alt = item.nombre;
  img.loading = 'lazy';
  img.width = 120;
  img.height = 120;

  const label = document.createElement('span');
  label.textContent = `${item.nombre} - $${item.precio}`;

  btn.appendChild(img);
  btn.appendChild(label);

  if (seleccionado) btn.classList.add('seleccionado');
  btn.addEventListener('click', () => {
    onClick();
    btn.classList.toggle('seleccionado');
  });
  return btn;
}

function mostrarOpciones(categoria, contenedorId, pedido, filtro = '') {
  const cont = document.getElementById(contenedorId);
  if (!cont) return;
  cont.innerHTML = '';

  const norm = normalizeText(filtro);
  const lista = (menu[categoria] || []).filter(it =>
    normalizeText(it.nombre).includes(norm)
  );

  if (lista.length === 0) {
    const p = document.createElement('p');
    p.className = 'sin-resultados';
    p.textContent = 'Sin resultados';
    cont.appendChild(p);
    return;
  }

  lista.forEach(item => {
    const ya = pedido.selecciones[categoria].some(i => i.nombre === item.nombre);
    const boton = crearBotonItem(item, () => pedido.agregarItem(categoria, item), ya);
    cont.appendChild(boton);
  });
}

function requireSeleccion(pedido, categoria) {
  if (pedido.selecciones[categoria].length === 0) {
    msg(`Elegí al menos un ítem de ${categoria} antes de continuar.`);
    return false;
  }
  msg('');
  return true;
}

function renderResumen(pedido) {
  const cont = document.getElementById('detalle-pedido');
  const mf = document.getElementById('mensaje-final');
  if (cont) cont.innerHTML = '';

  const todas = pedido.claves.flatMap(cat => pedido.selecciones[cat]);
  if (todas.length === 0) {
    if (mf) mf.textContent = 'Bueno, no elegiste nada, me imagino que simplemente estás testeando el sitio.';
    return;
  }

  const ul = document.createElement('ul');
  todas.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nombre} - $${item.precio}`;
    ul.appendChild(li);
  });
  cont.appendChild(ul);

  const total = pedido.calcularTotal();
  const pTotal = document.createElement('p');
  pTotal.textContent = `Total: $${total}`;
  pTotal.style.fontWeight = 'bold';
  pTotal.style.marginTop = '1rem';
  cont.appendChild(pTotal);

  if (mf) mf.textContent = 'Esto no es un ecommerce, así que llevá esta factura al mostrador hipotético para que sea procesada por un humano hipotético.';
}

async function cargarBebidasViaSampleAPIs(limite = 12) {
  const [hot, iced] = await Promise.all([
    fetch('https://api.sampleapis.com/coffee/hot', { cache: 'no-store' }).then(r => r.json()),
    fetch('https://api.sampleapis.com/coffee/iced', { cache: 'no-store' }).then(r => r.json())
  ]);
  const datos = [...hot, ...iced]
    .filter(d => d?.title && d?.image)
    .slice(0, limite)
    .map(d => ({
      nombre: d.title,
      imagen: d.image,
      precio: 120 + (Array.isArray(d.ingredients) ? d.ingredients.length : 2) * 30
    }));
  if (!datos.length) throw new Error('Sin bebidas con imagen');
  return datos;
}

async function cargarSaladasViaDummyJSON(limite = 12) {
  const { recipes } = await fetch('https://dummyjson.com/recipes?limit=150', { cache: 'no-store' }).then(r => r.json());
  const esSalado = (name) =>
    /sandwich|toast|tostado|baguette|empanada|bagel|panini|salad|quiche|wrap|scone|pizza|burger|focaccia|arepa/i.test(name);
  const datos = recipes
    .filter(r => esSalado(r.name) && r.image)
    .slice(0, limite)
    .map((r, idx) => ({
      nombre: r.name,
      imagen: r.image,
      precio: 220 + Math.round((r.caloriesPerServing ?? 300) / 25) + (idx % 3) * 10
    }));
  if (!datos.length) throw new Error('Sin saladas con imagen');
  return datos;
}

async function cargarDulcesViaMealDB(limite = 24) {
  const { meals } = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert', { cache: 'no-store' })
    .then(r => r.json());
  const datos = (meals || [])
    .filter(m => m?.strMeal && m?.strMealThumb)
    .slice(0, limite)
    .map((m, i) => ({
      nombre: m.strMeal,
      imagen: m.strMealThumb,
      precio: 200 + (i % 8) * 25
    }));
  if (!datos.length) throw new Error('Sin dulces con imagen');
  return datos;
}

async function cargarMenuRemoto() {
  const [bebidas, saladas, dulces] = await Promise.all([
    cargarBebidasViaSampleAPIs(12),
    cargarSaladasViaDummyJSON(12),
    cargarDulcesViaMealDB(24)
  ]);
  if (!bebidas.length || !saladas.length || !dulces.length) throw new Error('Datos incompletos');
  return { bebidas, saladas, dulces };
}

async function cargarMenuLocal() {
  const r = await fetch('data/menu.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('menu.json no disponible');
  const data = await r.json();
  const addImgs = (arr, cat) => (arr || []).map((it, i) => ({
    ...it,
    imagen: it.imagen || seededImage(`${cat}-${i}-${it.nombre}`)
  }));
  if (!data.bebidas || !data.saladas || !data.dulces) throw new Error('menu.json inválido');
  return {
    bebidas: addImgs(data.bebidas, 'bebidas'),
    saladas: addImgs(data.saladas, 'saladas'),
    dulces:  addImgs(data.dulces,  'dulces')
  };
}

async function cargarMenu() {
  try {
    menu = await cargarMenuRemoto();
  } catch (e1) {
    console.warn('Fallo APIs, intento JSON local', e1);
    try {
      menu = await cargarMenuLocal();
    } catch (e2) {
      console.warn('Fallo JSON local, uso fallback embebido', e2);
      menu = menuFallback;
    }
  }
}

const STORAGE_CLIENTE = 'datosCliente';
function precargarCheckout() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_CLIENTE));
    if (data?.nombre) document.getElementById('nombre').value = data.nombre;
    if (data?.email) document.getElementById('email').value = data.email;
  } catch {}
}
function guardarCheckout(nombre, email) {
  localStorage.setItem(STORAGE_CLIENTE, JSON.stringify({ nombre, email }));
}

const THEME_KEY = 'tema';
function applyTheme(theme) {
  const isDark = theme === 'oscuro';
  document.body.classList.toggle('modo-oscuro', isDark);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById('btn-modo');
  if (btn) btn.textContent = isDark ? 'Modo claro' : 'Modo nocturno';
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const initial = saved ? saved :
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');
  applyTheme(initial);
}

function pasoVisible() {
  const p1 = getComputedStyle(document.getElementById('paso1') || {}).display !== 'none';
  const p2 = getComputedStyle(document.getElementById('paso2') || {}).display !== 'none';
  const p3 = getComputedStyle(document.getElementById('paso3') || {}).display !== 'none';
  if (p1) return 'paso1';
  if (p2) return 'paso2';
  if (p3) return 'paso3';
  return null;
}
function renderSegunPaso(pedido) {
  const paso = pasoVisible();
  if (paso === 'paso1') mostrarOpciones('bebidas', 'opciones-bebida', pedido, filtroTexto);
  if (paso === 'paso2') mostrarOpciones('saladas', 'opciones-salado', pedido, filtroTexto);
  if (paso === 'paso3') mostrarOpciones('dulces',  'opciones-dulce',  pedido, filtroTexto);
}
function limpiarBuscador(pedido) {
  const input = document.getElementById('buscador');
  if (input) input.value = '';
  filtroTexto = '';
  renderSegunPaso(pedido);
}

document.addEventListener('DOMContentLoaded', async () => {
  const pedido = new Pedido();

  initTheme();

  msg('Cargando menú...');
  await cargarMenu();
  msg('');

  mostrarOpciones('bebidas', 'opciones-bebida', pedido, filtroTexto);

  const btnPaso1 = document.getElementById('btn-paso1') || document.getElementById('btn-paso2');
  if (btnPaso1) {
    btnPaso1.addEventListener('click', () => {
      if (!requireSeleccion(pedido, 'bebidas')) return;
      setVis('paso1', false);
      setVis('paso2', true);
      limpiarBuscador(pedido);
      mostrarOpciones('saladas', 'opciones-salado', pedido, filtroTexto);
    });
  }
  const btnPaso2 = document.getElementById('btn-paso2-step2') || document.getElementById('btn-paso2');
  if (btnPaso2) {
    btnPaso2.addEventListener('click', () => {
      if (!requireSeleccion(pedido, 'saladas')) return;
      setVis('paso2', false);
      setVis('paso3', true);
      limpiarBuscador(pedido);
      mostrarOpciones('dulces', 'opciones-dulce', pedido, filtroTexto);
    });
  }
  const btnPaso3 = document.getElementById('btn-paso3');
  if (btnPaso3) {
    btnPaso3.addEventListener('click', () => {
      if (!requireSeleccion(pedido, 'dulces')) return;
      setVis('paso3', false);
      setVis('resumen', true);
      renderResumen(pedido);
      precargarCheckout();
    });
  }

  const input = document.getElementById('buscador');
  const btnClear = document.getElementById('btn-limpiar-busqueda');

  let timer = null;
  if (input) {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        filtroTexto = val;
        renderSegunPaso(pedido);
      }, 80);
    });
  }
  if (btnClear && input) {
    btnClear.addEventListener('click', () => {
      limpiarBuscador(pedido);
      input.focus();
    });
  }

  const btnModo = document.getElementById('btn-modo');
  if (btnModo) {
    btnModo.addEventListener('click', () => {
      const isDark = document.body.classList.contains('modo-oscuro');
      applyTheme(isDark ? 'claro' : 'oscuro');
    });
  }

  const form = document.getElementById('form-checkout');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nombre = document.getElementById('nombre').value.trim();
      const email  = document.getElementById('email').value.trim();
      if (!nombre || !email) {
        msg('Completá nombre y email para confirmar.');
        return;
      }
      guardarCheckout(nombre, email);
      const codigo = Math.random().toString(36).slice(2, 8).toUpperCase();
      msg(`Pedido confirmado para ${nombre} (${email}). Código: ${codigo}. ¡Gracias humano/a!`);
      const btnReinicio = document.getElementById('btn-reiniciar');
      if (btnReinicio) btnReinicio.style.display = 'block';
    });
  }

  const btnReinicio = document.getElementById('btn-reiniciar');
  if (btnReinicio) {
    btnReinicio.addEventListener('click', () => {
      pedido.reset();
      const resumen = document.getElementById('resumen');
      const detalle = document.getElementById('detalle-pedido');
      const msgEl = document.getElementById('mensaje-final');
      if (resumen) resumen.style.display = 'none';
      if (detalle) detalle.innerHTML = '';
      if (msgEl) msgEl.textContent = '';
      setVis('paso1', true);
      limpiarBuscador(pedido);
      mostrarOpciones('bebidas', 'opciones-bebida', pedido, filtroTexto);
      btnReinicio.style.display = 'none';
    });
    btnReinicio.style.display = 'none';
  }
});

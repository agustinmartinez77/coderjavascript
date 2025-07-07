class Pedido {
  constructor() {
    this.claves = ['bebidas', 'saladas', 'dulces'];
    this.storageKey = 'pedidoCafeteria';
    this.selecciones = {
      bebidas: [],
      saladas: [],
      dulces: []
    };
    this.recuperarStorage();
  }

  agregarItem(categoria, item) {
    const idx = this.selecciones[categoria].findIndex(i => i.nombre === item.nombre);
    if (idx >= 0) {
      this.selecciones[categoria].splice(idx, 1);
    } else {
      this.selecciones[categoria].push(item);
    }
    this.guardarStorage();
  }

  calcularTotal() {
    return this.claves.reduce((sum, cat) =>
      sum + this.selecciones[cat].reduce((s, it) => s + it.precio, 0)
    , 0);
  }

  reset() {
    this.claves.forEach(cat => this.selecciones[cat] = []);
    localStorage.removeItem(this.storageKey);
  }

  guardarStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.selecciones));
  }

  recuperarStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      const parsed = JSON.parse(data);
      this.claves.forEach(cat => {
        if (Array.isArray(parsed[cat])) {
          this.selecciones[cat] = parsed[cat];
        }
      });
    }
  }
}

const menu = {
  bebidas: [
    { nombre: "Café con leche", precio: 149 },
    { nombre: "Cappuccino", precio: 169 },
    { nombre: "Cappuccino vegano", precio: 189 },
    { nombre: "Chocolate caliente", precio: 199 }
  ],
  saladas: [
    { nombre: "Tostado", precio: 219 },
    { nombre: "Tostada con palta", precio: 249 },
    { nombre: "Scon de jamón crudo", precio: 279 },
    { nombre: "Sorpresa del día", precio: 229 }
  ],
  dulces: [
    { nombre: "Magdalena", precio: 120 },
    { nombre: "Cookie", precio: 130 },
    { nombre: "Brownie", precio: 150 },
    { nombre: "Torta de oro 18 kilates", precio: 40000 }
  ]
};

const pedido = new Pedido();

function mostrarOpciones(categoria, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = '';
  const items = menu[categoria];

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = `${item.nombre} - $${item.precio}`;

    // Marcar seleccionado si ya está en el pedido
    btn.classList.toggle('seleccionado',
      pedido.selecciones[categoria].some(i => i.nombre === item.nombre)
    );

    btn.addEventListener('click', () => {
      pedido.agregarItem(categoria, item);
      btn.classList.toggle('seleccionado');
    });

    contenedor.appendChild(btn);
  });
}

function avanzarPaso(actualId, siguienteId, categoria, contenedorId) {
  document.getElementById(actualId).style.display = 'none';
  document.getElementById(siguienteId).style.display = 'block';
  if (categoria) mostrarOpciones(categoria, contenedorId);
}

function mostrarResumen() {
  const contenedor = document.getElementById('detalle-pedido');
  const mensajeFinal = document.getElementById('mensaje-final');
  contenedor.innerHTML = '';

  const todas = [].concat(...pedido.claves.map(cat => pedido.selecciones[cat]));
  if (todas.length === 0) {
    mensajeFinal.textContent = 'Bueno, no elegiste nada, me imagino que simplemente estás testeando el sitio.';
    return;
  }

  const ul = document.createElement('ul');
  todas.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nombre} - $${item.precio}`;
    ul.appendChild(li);
  });
  contenedor.appendChild(ul);

  const total = pedido.calcularTotal();
  const pTotal = document.createElement('p');
  pTotal.textContent = `Total: $${total}`;
  pTotal.style.fontWeight = 'bold';
  pTotal.style.marginTop = '1rem';
  contenedor.appendChild(pTotal);

  mensajeFinal.textContent = 'Esto no es un ecommerce, así que llevá esta factura al mostrador hipotético para que sea procesada por un humano hipotético.';
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarOpciones('bebidas', 'opciones-bebida');

  document.getElementById('btn-paso1').addEventListener('click', () =>
    avanzarPaso('paso1', 'paso2', 'saladas', 'opciones-salado')
  );

  document.getElementById('btn-paso2').addEventListener('click', () =>
    avanzarPaso('paso2', 'paso3', 'dulces', 'opciones-dulce')
  );

  document.getElementById('btn-paso3').addEventListener('click', () => {
    document.getElementById('paso3').style.display = 'none';
    mostrarResumen();
    document.getElementById('resumen').style.display = 'block';
    document.getElementById('btn-empezar-nuevo').style.display = 'block';
  });

  document.getElementById('btn-empezar-nuevo').addEventListener('click', () => {
    pedido.reset();

    document.getElementById('resumen').style.display = 'none';
    document.getElementById('detalle-pedido').innerHTML = '';
    document.getElementById('mensaje-final').textContent = '';

    document.getElementById('paso1').style.display = 'block';
    mostrarOpciones('bebidas', 'opciones-bebida');

    document.getElementById('btn-empezar-nuevo').style.display = 'none';
  });

  document.getElementById('btn-empezar-nuevo').style.display = 'none';
});
// --- frontend/js/productos.js ---

const nombreUsuario = localStorage.getItem('clienteNombre');
if (!nombreUsuario) window.location.href = 'index.html';

let todosLosProductos = [];
let productosVisibles = [];
let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 8; 

async function cargarProductos() {
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        if (!res.ok) throw new Error('Error backend');
        
        todosLosProductos = await res.json();
        
        cambiarCategoria('todas');
        actualizarBadgeCarrito();

    } catch (error) {
        console.error(error);
        const lista = document.getElementById('lista-productos');
        if (lista) lista.innerHTML = '<p>Error al cargar datos.</p>';
    }
}

window.cambiarCategoria = (categoria) => {
    paginaActual = 1;
    
    const titulo = document.getElementById('titulo-seccion');
    if (titulo) {
        if (categoria === 'todas') {
            productosVisibles = todosLosProductos;
            titulo.textContent = "TODOS LOS PRODUCTOS";
        } else {
            productosVisibles = todosLosProductos.filter(p => p.categoria === categoria);
            titulo.textContent = categoria.toUpperCase(); // "CAMISETAS" or "ACCESORIOS"
        }
    }

    renderizarPaginaActual();
};

function renderizarPaginaActual() {
    const contenedor = document.getElementById('lista-productos');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    const productosDeEstaPagina = productosVisibles.slice(inicio, fin);

    if (productosDeEstaPagina.length === 0) {
        contenedor.innerHTML = '<p>No hay productos en esta categoría.</p>';
        actualizarControlesPaginacion();
        return;
    }

    productosDeEstaPagina.forEach((prod, index) => {
        let imagenSrc = prod.imagen;
        if (!imagenSrc.startsWith('http')) {
            imagenSrc = `http://localhost:3000/uploads/${prod.imagen}`;
        }

        const html = `
            <div class="producto-card" style="animation-delay: ${index * 0.05}s;">
                <div class="img-container">
                    <img src="${imagenSrc}" alt="${prod.nombre}">
                </div>
                <h3>${prod.nombre}</h3>
                <span class="precio">$${prod.precio}</span>
                <button onclick="agregarAlCarrito(${prod.id}, '${prod.nombre}', ${prod.precio}, '${prod.imagen}')">
                    AGREGAR
                </button>
            </div>
        `;
        contenedor.innerHTML += html;
    });

    actualizarControlesPaginacion();
}

function actualizarControlesPaginacion() {
    const totalPaginas = Math.ceil(productosVisibles.length / PRODUCTOS_POR_PAGINA);
    
    const texto = document.getElementById('info-pagina');
    const btnAnt = document.getElementById('btn-anterior');
    const btnSig = document.getElementById('btn-siguiente');

    if (texto) texto.textContent = `${paginaActual} / ${totalPaginas || 1}`;
    
    if (btnAnt) btnAnt.disabled = (paginaActual === 1);
    if (btnSig) btnSig.disabled = (paginaActual >= totalPaginas || totalPaginas === 0);
}

window.cambiarPagina = (delta) => {
    paginaActual += delta;
    renderizarPaginaActual();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = totalItems;
}

window.agregarAlCarrito = (id, nombre, precio, imagen) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carrito.find(item => item.id === id);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    alert(`✅ ${nombre} agregado!`);
};

cargarProductos();
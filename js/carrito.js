// --- frontend/js/carrito.js ---

const contenedor = document.getElementById('carrito-lista'); // Use correct ID from HTML
const subtotalSpan = document.getElementById('cart-subtotal');
const totalSpan = document.getElementById('cart-total');
const btnVaciar = document.getElementById('btn-vaciar');
const btnConfirmar = document.getElementById('btn-confirmar');
const panelResumen = document.getElementById('resumen-panel');

function renderCart() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag empty-icon" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                    <h3>Tu carrito está vacío</h3>
                    <a href="productos.html" style="color: var(--accent-color); text-decoration: underline;">Ir a la tienda</a>
                </div>
            `;
        }
        if (panelResumen) panelResumen.style.display = 'none';
        return;
    }

    if (panelResumen) panelResumen.style.display = 'block';
    if (contenedor) contenedor.innerHTML = '';
    let total = 0;

    carrito.forEach((prod, index) => {
        total += prod.precio * prod.cantidad;
        
        // ROBUST IMAGE LOGIC
        let imgDisplay = 'https://placehold.co/100?text=Sin+Foto'; // Default if everything fails

        if (prod.imagen) {
            if (prod.imagen.startsWith('http')) {
                imgDisplay = prod.imagen; // It's an internet URL
            } else {
                imgDisplay = `http://localhost:3000/uploads/${prod.imagen}`; // It's local
            }
        }

        if (contenedor) {
            contenedor.innerHTML += `
                <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid #eee;">
                    <div class="cart-item-info" style="display: flex; align-items: center; gap: 20px;">
                        <img src="${imgDisplay}" class="cart-img" alt="${prod.nombre}" 
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;"
                             onerror="this.src='https://placehold.co/100?text=Error'">
                        
                        <div>
                            <h4 class="cart-name" style="margin: 0; font-family: 'Oswald'; font-size: 1.1rem;">${prod.nombre}</h4>
                            <span class="cart-price" style="color: #666; font-weight: 600;">$${prod.precio}</span>
                        </div>
                    </div>
                    
                    <div style="display:flex; align-items:center;">
                        <div class="qty-box" style="display: flex; align-items: center; border: 1px solid #eee; border-radius: 4px;">
                            <button class="qty-btn" onclick="updateQty(${index}, -1)" style="background: transparent; border: none; width: 30px; cursor: pointer;">-</button>
                            <div class="qty-val" style="width: 30px; text-align: center;">${prod.cantidad}</div>
                            <button class="qty-btn" onclick="updateQty(${index}, 1)" style="background: transparent; border: none; width: 30px; cursor: pointer;">+</button>
                        </div>
                        <button class="btn-remove" onclick="removeItem(${index})" style="background: transparent; border: none; color: #ff4842; margin-left: 20px; cursor: pointer; font-size: 1.1rem;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    });

    if (subtotalSpan) subtotalSpan.textContent = `$${total}`;
    if (totalSpan) totalSpan.textContent = `$${total}`;
}

window.updateQty = (index, delta) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCart();
};

window.removeItem = (index) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCart();
};

if (btnVaciar) {
    btnVaciar.addEventListener('click', () => {
        if (confirm('¿Vaciar carrito?')) {
            localStorage.removeItem('carrito');
            renderCart();
        }
    });
}

if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const usuario = localStorage.getItem('clienteNombre');
        
        if (!usuario) return alert("Error: No estás logueado.");

        try {
            const res = await fetch('http://localhost:3000/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreUsuario: usuario, items: carrito })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('ultimoTicket', JSON.stringify(data.ticket));
                localStorage.removeItem('carrito');
                window.location.href = 'ticket.html';
            } else {
                alert("Error al procesar la compra");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        }
    });
}

// Initialize
renderCart();
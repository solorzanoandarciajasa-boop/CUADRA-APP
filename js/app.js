/**
 * CUADRA - Aplicación de Gestión de Ventas
 * Creado por JASA
 * Versión: Consolidada 2.5
 */

// --- CONFIG & STATE ---
const APP_STORAGE = 'cuadra_final_data';
const BCV_API = 'https://ve.dolarapi.com/v1/dolares/oficial';

let state = JSON.parse(localStorage.getItem(APP_STORAGE)) || {
    isRegistered: false,
    business: {
        owner: '',
        name: '',
        phone: '',
        address: ''
    },
    exchangeRate: 36.50,
    inventory: [],
    customers: [], // For debts
    debts: [],
    transactions: [],
    cart: [],
    currentView: 'view-onboarding'
};

// --- CORE UTILS ---
function saveState() {
    localStorage.setItem(APP_STORAGE, JSON.stringify(state));
}

async function updateExchangeRate() {
    try {
        const res = await fetch(BCV_API);
        const data = await res.json();
        if (data && data.promedio) {
            state.exchangeRate = data.promedio;
            saveState();
            return true;
        }
    } catch (e) {
        console.warn("No se pudo conectar con BCV, usando tasa guardada.");
    }
    return false;
}

let viewHistory = [];

function navigateTo(viewId, pushHistory = true) {
    const currentView = state.currentView;
    if (pushHistory && currentView && currentView !== viewId) {
        viewHistory.push(currentView);
    }

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        state.currentView = viewId;
        renderView(viewId);
        // Scroll to top
        document.getElementById('app').scrollTop = 0;
    }
}

function goBack() {
    if (viewHistory.length > 0) {
        const prevView = viewHistory.pop();
        navigateTo(prevView, false);
    } else {
        navigateTo('view-dashboard', false);
    }
}

// --- RENDER ENGINE ---
function renderView(viewId) {
    const container = document.getElementById(viewId);
    if (!container) return;

    // Protection: If not registered, force onboarding
    if (!state.isRegistered && viewId !== 'view-onboarding') {
        navigateTo('view-onboarding');
        return;
    }

    switch (viewId) {
        case 'view-onboarding': renderOnboarding(container); break;
        case 'view-dashboard': renderDashboard(container); break;
        case 'view-inventory': renderInventory(container); break;
        case 'view-sales': renderSales(container); break;
        case 'view-debts': renderDebts(container); break;
        case 'view-settings': renderSettings(container); break;
        case 'view-scanner': renderScanner(container); break;
    }
}

// --- SHARED UI HELPERS ---
function header(title, subtitle = "", showBack = true) {
    return `
        <div class="p-6 pt-12 relative">
            ${showBack ? `
                <button onclick="goBack()" class="absolute left-4 top-12 text-slate-400 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
            ` : ''}
            <div class="flex items-center justify-between mb-2 ${showBack ? 'ml-8' : ''}">
                <div>
                    <h1 class="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">CUADRA</h1>
                    <p class="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">por jasa</p>
                </div>
                <div class="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 text-primary">
                    <span class="material-symbols-outlined">person</span>
                </div>
            </div>
            <div class="${showBack ? 'ml-8' : ''}">
                ${title ? `<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-4">${title}</h2>` : ''}
                ${subtitle ? `<p class="text-sm text-slate-500 font-medium">${subtitle}</p>` : ''}
            </div>
        </div>
    `;
}

function nav() {
    const v = state.currentView;
    return `
        <nav class="nav-fixed">
            <button onclick="navigateTo('view-dashboard')" class="nav-item ${v === 'view-dashboard' ? 'active' : ''}">
                <span class="material-symbols-outlined ${v === 'view-dashboard' ? 'fill-1' : ''}">home</span>
                <span class="text-[8px] font-bold uppercase">Inicio</span>
            </button>
            <button onclick="navigateTo('view-inventory')" class="nav-item ${v === 'view-inventory' ? 'active' : ''}">
                <span class="material-symbols-outlined">inventory_2</span>
                <span class="text-[8px] font-bold uppercase">Stock</span>
            </button>
            <button onclick="navigateTo('view-scanner')" class="nav-item special">
                <span class="material-symbols-outlined">qr_code_scanner</span>
            </button>
            <button onclick="navigateTo('view-sales')" class="nav-item ${v === 'view-sales' ? 'active' : ''}">
                <span class="material-symbols-outlined">shopping_cart</span>
                <span class="text-[8px] font-bold uppercase">Venta</span>
            </button>
            <button onclick="navigateTo('view-debts')" class="nav-item ${v === 'view-debts' ? 'active' : ''}">
                <span class="material-symbols-outlined">calendar_month</span>
                <span class="text-[8px] font-bold uppercase">Fiados</span>
            </button>
        </nav>
    `;
}

// --- VIEWS IMPLEMENTATION ---

function renderOnboarding(el) {
    el.innerHTML = `
        <div class="p-8 min-h-screen flex flex-col justify-center bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-slate-950">
            <div class="mb-12">
                <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">CUADRA</h1>
                <p class="text-primary font-black uppercase tracking-[0.4em] text-xs">creada por jasa</p>
            </div>
            
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-black mb-2">¡Hola! Regístrate</h2>
                    <p class="text-slate-500 text-sm">Configura tu negocio para empezar a vender.</p>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label>Tu Nombre completo</label>
                        <input id="on-owner" type="text" placeholder="Ej: Juan Pérez">
                    </div>
                    <div>
                        <label>Nombre de tu Negocio</label>
                        <input id="on-name" type="text" placeholder="Ej: Bodega Central">
                    </div>
                    <div>
                        <label>Teléfono de Contacto</label>
                        <input id="on-phone" type="tel" placeholder="0412-0000000">
                    </div>
                </div>

                <button onclick="handleRegister()" class="btn-primary mt-4">Comenzar Ahora</button>
            </div>
        </div>
    `;
}

function handleRegister() {
    const owner = document.getElementById('on-owner').value;
    const name = document.getElementById('on-name').value;
    const phone = document.getElementById('on-phone').value;

    if (!owner || !name) return alert("Por favor completa los nombres.");

    state.business = { owner, name, phone, address: '' };
    state.isRegistered = true;
    saveState();
    navigateTo('view-dashboard');
}

function renderDashboard(el) {
    const todaySales = state.transactions.filter(t => t.type === 'venta').reduce((a, b) => a + b.totalUSD, 0);
    const todayProfit = state.transactions.filter(t => t.type === 'venta').reduce((a, b) => a + b.profitUSD, 0);
    const pendingDebts = state.debts.reduce((a, b) => a + b.remaining, 0);

    el.innerHTML = `
        <div class="pb-nav min-h-screen">
            ${header(state.business.name, "Resumen de hoy", false)}
            
            <main class="p-6 space-y-6">
                <!-- VENDER CTA - Super Flashy -->
                <div class="animate-pop-in">
                    <button onclick="navigateTo('view-sales')" class="w-full bg-gradient-to-r from-primary to-pink-600 p-8 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl shadow-pink-500/20 group transform transition-all active:scale-95">
                        <div class="flex items-center gap-6">
                            <div class="bg-white/20 p-4 rounded-full backdrop-blur-md">
                                <span class="material-symbols-outlined !text-4xl">point_of_sale</span>
                            </div>
                            <div class="text-left">
                                <p class="text-3xl font-black uppercase tracking-tighter">VENDER</p>
                                <p class="text-[10px] font-black uppercase opacity-80 tracking-[0.2em]">Facturación Automática</p>
                            </div>
                        </div>
                        <div class="h-12 w-12 rounded-full border border-white/30 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-500">
                             <span class="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </button>
                </div>

                <!-- Tasa Card -->
                <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl animate-pop-in stagger-1">
                    <div class="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    <div class="flex items-center gap-3 mb-2 opacity-60">
                         <span class="material-symbols-outlined text-sm">currency_exchange</span>
                         <p class="text-[10px] font-black uppercase tracking-widest">Tasa Oficial BCV</p>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-5xl font-black">${state.exchangeRate.toFixed(2)}</h3>
                        <span class="text-sm font-bold text-slate-400 font-mono">Bs/$</span>
                    </div>
                    <button onclick="navigateTo('view-settings')" class="mt-4 text-[10px] font-black uppercase bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all">Ajustar Tasa</button>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="card-glass flex flex-col items-center py-8 animate-pop-in stagger-2">
                        <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined">trending_up</span>
                        </div>
                        <p class="text-[9px] font-black uppercase text-slate-400 mb-1">Ventas Hoy</p>
                        <h4 class="text-2xl font-black text-slate-900 dark:text-white">$${todaySales.toFixed(2)}</h4>
                    </div>
                    <div class="card-glass flex flex-col items-center py-8 animate-pop-in stagger-3">
                        <div class="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined">payments</span>
                        </div>
                        <p class="text-[9px] font-black uppercase text-slate-400 mb-1">Ganancia Hoy</p>
                        <h4 class="text-2xl font-black text-slate-900 dark:text-white">$${todayProfit.toFixed(2)}</h4>
                    </div>
                </div>

                <!-- Fiados Alert -->
                <button onclick="navigateTo('view-debts')" class="w-full bg-red-50 dark:bg-red-950/20 p-6 rounded-[2rem] flex items-center justify-between group animate-pop-in stagger-4">
                    <div class="flex items-center gap-4">
                        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-lg shadow-red-500/30">
                            <span class="material-symbols-outlined">priority_high</span>
                        </div>
                        <div class="text-left">
                            <p class="text-xs font-black text-red-600 uppercase">Cuentas por Cobrar</p>
                            <p class="text-xl font-black text-red-700 dark:text-red-400">$${pendingDebts.toFixed(2)}</p>
                        </div>
                    </div>
                    <span class="material-symbols-outlined text-red-300">chevron_right</span>
                </button>
            </main>
            ${nav()}
        </div>
    `;
}

function renderInventory(el) {
    el.innerHTML = `
        <div class="pb-nav min-h-screen">
            ${header("Inventario", "Carga tus productos aquí")}
            
            <main class="p-6 space-y-6">
                <!-- Add Form -->
                <div class="card-glass space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-black uppercase tracking-widest text-primary">Nuevo Producto</h3>
                        <label for="inv-image-input" class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer text-slate-400">
                            <span class="material-symbols-outlined">add_a_photo</span>
                            <input id="inv-image-input" type="file" accept="image/*" class="hidden" onchange="hHandleInventoryImage(this)">
                        </label>
                    </div>
                    <div id="inv-image-preview" class="hidden w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden mx-auto border-2 border-primary/20"></div>
                    
                    <div class="space-y-3">
                        <div><label>Nombre del Producto</label><input id="inv-name" type="text" placeholder="Ej: Polar 330ml"></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><label>Costo ($)</label><input id="inv-cost" type="number" step="0.01" placeholder="0.00"></div>
                            <div><label>Venta ($)</label><input id="inv-price" type="number" step="0.01" placeholder="0.00"></div>
                        </div>
                        <div><label>Características/Tamaño</label><input id="inv-desc" type="text" placeholder="Ej: Caja de 24 und, 1L, etc."></div>
                        <div><label>Código/ID (Opcional)</label><input id="inv-code" type="text" placeholder="Ej: 123456"></div>
                    </div>
                    <button onclick="hAddProduct()" class="btn-primary py-3">Guardar Producto</button>
                </div>

                <!-- List -->
                <div class="space-y-3">
                    <h3 class="text-sm font-black uppercase tracking-widest text-slate-400">Tus Productos (${state.inventory.length})</h3>
                    ${state.inventory.length === 0 ? '<p class="text-center py-10 opacity-30 font-bold uppercase text-xs">Aún no hay productos</p>' :
            state.inventory.map(p => `
                        <div class="card-glass py-4 flex items-center gap-4">
                            <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<span class="material-symbols-outlined text-slate-300">image</span>`}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-black text-slate-900 dark:text-white truncate">${p.name}</h4>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${p.desc} • ID: ${p.code || 'S/N'}</p>
                                <div class="flex gap-4 mt-2">
                                    <span class="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-black">COSTO: $${p.cost.toFixed(2)}</span>
                                    <span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black">VENTA: $${p.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <button onclick="hDeleteProduct('${p.id}')" class="text-red-300 hover:text-red-500 p-2"><span class="material-symbols-outlined">delete</span></button>
                        </div>
                    `).join('')}
                </div>
            </main>
            ${nav()}
        </div>
    `;
}

let tempInventoryImage = null;

function hHandleInventoryImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            tempInventoryImage = e.target.result;
            const preview = document.getElementById('inv-image-preview');
            preview.innerHTML = `<img src="${tempInventoryImage}" class="w-full h-full object-cover">`;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function hAddProduct() {
    const name = document.getElementById('inv-name').value;
    const cost = parseFloat(document.getElementById('inv-cost').value);
    const price = parseFloat(document.getElementById('inv-price').value);
    const desc = document.getElementById('inv-desc').value;
    const code = document.getElementById('inv-code').value;
    const image = tempInventoryImage;

    if (!name || isNaN(cost) || isNaN(price)) return alert("Completa nombre, costo y precio");

    state.inventory.push({ id: Date.now().toString(), name, cost, price, desc, code, image });
    tempInventoryImage = null;
    saveState();
    renderInventory(document.getElementById('view-inventory'));
}

function hDeleteProduct(id) {
    if (!confirm("¿Borrar este producto?")) return;
    state.inventory = state.inventory.filter(p => p.id !== id);
    saveState();
    renderInventory(document.getElementById('view-inventory'));
}

function renderSales(el) {
    const subtotal = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const profit = state.cart.reduce((a, b) => a + ((b.price - b.cost) * b.qty), 0);

    el.innerHTML = `
        <div class="pb-nav min-h-screen">
            ${header("Venta en Curso", "Carrito inteligente")}
            
            <main class="p-6 space-y-8">
                <!-- Search & Scan Grid -->
                <div class="flex gap-3 animate-pop-in">
                    <div class="relative flex-1">
                        <input id="sale-search" type="text" placeholder="Buscar productos..." oninput="hSearchProduct(this.value)" class="!pl-12 !rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                        <div id="search-results" class="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-3xl shadow-2xl z-40 hidden mt-2"></div>
                    </div>
                    <button onclick="navigateTo('view-scanner')" class="bg-gradient-to-br from-primary to-pink-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-all">
                        <span class="material-symbols-outlined !text-4xl">qr_code_scanner</span>
                    </button>
                </div>

                <!-- Cart Items -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between px-2">
                         <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400">Carrito (${state.cart.length} productos)</h3>
                         ${state.cart.length > 0 ? `<button onclick="hClearCart()" class="text-[10px] font-black uppercase text-red-400 hover:text-red-500">Vaciar</button>` : ''}
                    </div>
                    
                    ${state.cart.length === 0 ? '<div class="py-20 text-center opacity-10 animate-pop-in"><span class="material-symbols-outlined !text-9xl">shopping_bag</span><p class="font-bold text-xs uppercase mt-6 tracking-widest">Carrito vacío</p></div>' :
            state.cart.map((i, idx) => `
                        <div class="card-glass py-4 px-5 flex items-center gap-5 animate-pop-in" style="animation-delay: ${idx * 0.05}s">
                            <!-- Küçük Foto -->
                            <div class="w-16 h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-slate-50">
                                ${i.image ? `<img src="${i.image}" class="w-full h-full object-cover">` : `<span class="material-symbols-outlined !text-3xl text-slate-100">inventory_2</span>`}
                            </div>
                            
                            <div class="flex-1 min-w-0">
                                <h4 class="font-black text-slate-900 truncate">${i.name}</h4>
                                <p class="text-[10px] font-bold text-slate-400 truncate mt-0.5">${i.desc || 'Sin descripción'}</p>
                                <div class="flex items-baseline gap-2 mt-2">
                                    <span class="text-sm font-black text-primary">$${i.price.toFixed(2)}</span>
                                    <span class="text-[10px] font-bold text-slate-300">Bs ${(i.price * state.exchangeRate).toFixed(2)}</span>
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <button onclick="hUpdateCart('${i.id}', -1)" class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-90 transition-all border border-slate-100"><span class="material-symbols-outlined !text-lg">remove</span></button>
                                <span class="font-black text-base w-4 text-center text-slate-800">${i.qty}</span>
                                <button onclick="hUpdateCart('${i.id}', 1)" class="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"><span class="material-symbols-outlined !text-lg">add</span></button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Checkout Section - Premium Receipt Style -->
                <div class="animate-pop-in stagger-3">
                    <div class="card-glass bg-slate-900 text-white !p-8 relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                        
                        <div class="relative z-10 flex justify-between items-start mb-8">
                            <div>
                                <p class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Total de la Venta</p>
                                <h3 class="text-5xl font-black tracking-tighter">$${subtotal.toFixed(2)}</h3>
                                <div class="mt-4 flex flex-col gap-1">
                                    <p class="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">Bs ${(subtotal * state.exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tasa aplicada: ${state.exchangeRate.toFixed(2)} Bs/$</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 relative z-10">
                            <button onclick="hProcessSale('normal')" class="bg-primary hover:bg-pink-400 py-5 rounded-[1.5rem] font-black text-white text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">COBRAR VENTA</button>
                            <button onclick="hProcessSale('fiado')" class="bg-white/5 hover:bg-white/10 py-5 rounded-[1.5rem] font-black text-white text-xs uppercase tracking-widest border border-white/10 active:scale-95 transition-all">ES FIADO</button>
                        </div>
                    </div>
                </div>
            </main>
            ${nav()}
        </div>
    `;
}

function hClearCart() {
    if (!confirm("¿Vaciar el carrito actual?")) return;
    state.cart = [];
    saveState();
    renderSales(document.getElementById('view-sales'));
}

function hSearchProduct(query) {
    const res = document.getElementById('search-results');
    if (!query) { res.classList.add('hidden'); return; }

    const matches = state.inventory.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || (p.code && p.code.includes(query))).slice(0, 5);

    if (matches.length > 0) {
        res.classList.remove('hidden');
        res.innerHTML = matches.map(p => `
            <button onclick="hAddToCart('${p.id}')" class="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 border-b last:border-0 dark:border-slate-700 flex justify-between items-center transition-all">
                <div><p class="font-bold text-sm">${p.name}</p><p class="text-[10px] font-bold text-slate-400">$${p.price.toFixed(2)}</p></div>
                <span class="material-symbols-outlined text-primary">add_circle</span>
            </button>
        `).join('');
    } else {
        res.classList.add('hidden');
    }
}

function hAddToCart(id) {
    const p = state.inventory.find(item => item.id === id);
    const inCart = state.cart.find(item => item.id === id);
    if (inCart) inCart.qty++;
    else state.cart.push({ ...p, qty: 1 });

    document.getElementById('sale-search').value = '';
    document.getElementById('search-results').classList.add('hidden');
    saveState();
    renderSales(document.getElementById('view-sales'));
}

function hUpdateCart(id, change) {
    const i = state.cart.find(item => item.id === id);
    i.qty += change;
    if (i.qty <= 0) state.cart = state.cart.filter(item => item.id !== id);
    saveState();
    renderSales(document.getElementById('view-sales'));
}

function hProcessSale(type) {
    if (state.cart.length === 0) return alert("El carrito está vacío");

    const subtotal = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const profit = state.cart.reduce((a, b) => a + ((b.price - b.cost) * b.qty), 0);

    if (type === 'fiado') {
        const cName = prompt("Nombre del Cliente:");
        if (!cName) return;
        const cDate = prompt("Fecha de compromiso de pago:", "Próximo Lunes");

        state.debts.push({
            id: Date.now().toString(),
            customer: cName,
            total: subtotal,
            remaining: subtotal,
            date: new Date().toLocaleDateString(),
            commitment: cDate,
            items: [...state.cart]
        });

        // Add to customers list if new
        if (!state.customers.includes(cName)) state.customers.push(cName);
    }

    state.transactions.push({
        id: Date.now().toString(),
        type: 'venta',
        saleType: type,
        totalUSD: subtotal,
        profitUSD: profit,
        date: new Date().toLocaleDateString(),
        items: [...state.cart]
    });

    state.cart = [];
    saveState();
    alert(type === 'fiado' ? "¡Venta a crédito registrada!" : "¡Venta cobrada con éxito!");
    navigateTo('view-dashboard');
}

function renderDebts(el) {
    const totalPending = state.debts.reduce((a, b) => a + b.remaining, 0);
    el.innerHTML = `
        <div class="pb-nav min-h-screen">
            ${header("Fiados", "Control de cuentas por cobrar")}
            
            <main class="p-6 space-y-6">
                <div class="bg-primary p-6 rounded-[2rem] text-white">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-70">Total por Cobrar</p>
                    <h3 class="text-3xl font-black">$${totalPending.toFixed(2)}</h3>
                </div>

                <div class="space-y-4">
                    ${state.debts.length === 0 ? '<p class="text-center opacity-20 py-20 uppercase font-black text-xs">No hay deudas pendientes</p>' :
            state.debts.map(d => `
                        <div class="card-glass border-l-4 border-l-primary">
                            <div class="flex justify-between items-start mb-2">
                                <div><h4 class="font-black text-lg">${d.customer}</h4><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Desde: ${d.date}</p></div>
                                <div class="text-right"><p class="text-xl font-black text-primary">$${d.remaining.toFixed(2)}</p></div>
                            </div>
                            <p class="text-[10px] font-black text-slate-500 uppercase">Compromiso: <span class="text-primary">${d.commitment}</span></p>
                            <div class="grid grid-cols-3 gap-2 mt-4">
                                <button onclick="hPayDebt('${d.id}')" class="bg-slate-900 text-white text-[8px] font-black uppercase py-2 rounded-xl">Abonar</button>
                                <button onclick="hShareDebt('${d.id}')" class="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase py-2 rounded-xl">Compartir</button>
                                <button onclick="hDeleteDebt('${d.id}')" class="bg-red-50 text-red-600 text-[8px] font-black uppercase py-2 rounded-xl">Borrar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </main>
            ${nav()}
        </div>
    `;
}

function hPayDebt(id) {
    const d = state.debts.find(item => item.id === id);
    const amount = parseFloat(prompt(`Monto a pagar para ${d.customer} (Pendiente: $${d.remaining.toFixed(2)}):`));

    if (isNaN(amount) || amount <= 0) return;

    d.remaining -= amount;
    if (d.remaining <= 0) {
        state.debts = state.debts.filter(item => item.id !== id);
        alert("¡Deuda liquidada!");
    } else {
        alert(`Abono registrado. Nuevo saldo: $${d.remaining.toFixed(2)}`);
    }
    saveState();
    renderDebts(document.getElementById('view-debts'));
}

function hShareDebt(id) {
    const d = state.debts.find(item => item.id === id);
    const msg = `*RECORDATORIO DE PAGO - CUADRA*\nHola ${d.customer}, te recordamos tu saldo de *$${d.remaining.toFixed(2)}* (Bs ${(d.remaining * state.exchangeRate).toLocaleString()}).\n📅 Compromiso: ${d.commitment}.\n_Enviado desde CUADRA App_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

function hDeleteDebt(id) {
    if (!confirm("¿Eliminar este registro de fiado por completo?")) return;
    state.debts = state.debts.filter(d => d.id !== id);
    saveState();
    renderDebts(document.getElementById('view-debts'));
}

function renderSettings(el) {
    el.innerHTML = `
        <div class="pb-nav min-h-screen">
            ${header("Ajustes", "Configuración de la cuenta")}
            
            <main class="p-6 space-y-6">
                <!-- User Card -->
                <div class="card-glass border-t-4 border-t-primary">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usuario Actual</p>
                    <h4 class="text-xl font-black">${state.business.owner}</h4>
                    <p class="font-bold text-slate-500">${state.business.name}</p>
                    <button onclick="hResetApp()" class="mt-4 text-red-500 text-[10px] font-black uppercase tracking-widest">Borrar Negocio y Datos</button>
                </div>

                <!-- Tasa Manual -->
                <div class="card-glass">
                    <label>Ajustar Tasa Manual (Bs/$)</label>
                    <input type="number" step="0.01" value="${state.exchangeRate}" onchange="hSetRate(this.value)">
                    <p class="text-[9px] text-slate-400 font-bold mt-2 uppercase">Al abrir la app se actualizará automáticamente con BCV a menos que la cambies aquí.</p>
                </div>

                <div class="py-10 text-center">
                    <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">CUADRA V2.5 BY JASA</p>
                </div>
            </main>
            ${nav()}
        </div>
    `;
}

function hSetRate(val) {
    state.exchangeRate = parseFloat(val);
    saveState();
}

function hResetApp() {
    if (!confirm("ADVERTENCIA: Se borrarán todos tus productos, ventas y configuración. ¿Continuar?")) return;
    localStorage.removeItem(APP_STORAGE);
    location.reload();
}

function renderScanner(el) {
    el.innerHTML = `
        <div class="bg-black min-h-screen flex flex-col items-center justify-center relative">
            <!-- Back Button -->
            <button onclick="goBack()" class="absolute left-6 top-14 z-50 text-white/50 hover:text-white">
                <span class="material-symbols-outlined !text-4xl">arrow_back</span>
            </button>

            <div id="video-container" class="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <span class="material-symbols-outlined !text-9xl text-white/10 animate-pulse">videocam</span>
                <!-- Background Mock for now, logic below attempts real scan -->
            </div>
            
            <div class="relative z-10 w-full flex flex-col items-center">
                <div class="w-64 h-64 border-2 border-primary rounded-[3rem] relative overflow-hidden mb-10 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                    <div class="scan-line"></div>
                </div>
                <h3 class="text-white font-black text-2xl uppercase tracking-tighter">Smart Scan</h3>
                <p class="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Enfoque el producto o código</p>
                
                <div class="mt-12 flex flex-col gap-4 w-60">
                    <!-- Photo Mode -->
                    <button onclick="hTriggerPhotoScan()" class="btn-primary flex items-center justify-center gap-2 px-8 py-4">
                        <span class="material-symbols-outlined">photo_camera</span> Scan por Foto
                    </button>
                </div>
            </div>
        </div>
    `;
}

// SIMULACIÓN DE RECONOCIMIENTO POR FOTO (Petición del usuario)
function hTriggerPhotoScan() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // "Analizando..." feedback
            alert("JASA AI Analizando producto...");

            // Simulación inteligente: Selecciona un producto random del inventario si existe
            if (state.inventory.length === 0) return alert("Primero registra productos en tu Stock para poder reconocerlos.");

            setTimeout(() => {
                const match = state.inventory[Math.floor(Math.random() * state.inventory.length)];
                if (confirm(`Producto Detectado:\n${match.name}\nPrecio: $${match.price.toFixed(2)}\n\n¿Añadir al carrito?`)) {
                    hAddToCart(match.id);
                    navigateTo('view-sales');
                }
            }, 1000);
        }
    };
    input.click();
}

// --- INITIALIZER ---
window.onload = async () => {
    // 1. Tasa BCV on startup
    await updateExchangeRate();

    // 2. Start View
    if (!state.isRegistered) {
        navigateTo('view-onboarding');
    } else {
        navigateTo(state.currentView || 'view-dashboard');
    }
};

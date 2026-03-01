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

// --- AI & SCANNER STATE ---
let aiModel = null;
let knnClassifier = null;
let html5QrcodeScanner = null;
let currentScannerMode = 'sales'; // 'sales' or 'inventory'
let isAiLoading = true;
let isAiScanning = false;
let aiScanInterval = null;

// --- CORE UTILS ---
function saveState() {
    try {
        localStorage.setItem(APP_STORAGE, JSON.stringify(state));
    } catch (e) {
        console.error("Storage Error", e);
        alert("Atención: El almacenamiento local está lleno. La imagen puede ser muy pesada o tienes demasiados productos.");
    }
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
                        <div class="flex gap-2">
                             <button onclick="hOpenScanner('inventory')" class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center cursor-pointer text-primary">
                                 <span class="material-symbols-outlined">psychology</span>
                             </button>
                             <label for="inv-image-input" class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer text-slate-400 hover:text-primary transition-colors">
                                 <span class="material-symbols-outlined">add_a_photo</span>
                                 <input id="inv-image-input" type="file" accept="image/*" class="hidden" onchange="hHandleInventoryImage(this)">
                             </label>
                        </div>
                    </div>
                    <div id="inv-image-preview" class="hidden w-24 h-24 rounded-[1.5rem] bg-slate-50 overflow-hidden mx-auto border-[3px] border-primary/20 shadow-inner"></div>
                    
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
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 200;
                let w = img.width, h = img.height;
                if (w > h) { h *= maxSize / w; w = maxSize; } else { w *= maxSize / h; h = maxSize; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                tempInventoryImage = canvas.toDataURL('image/jpeg', 0.6);

                const preview = document.getElementById('inv-image-preview');
                preview.innerHTML = `<img src="${tempInventoryImage}" class="w-full h-full object-cover">`;
                preview.classList.remove('hidden');
            }
            img.src = e.target.result;
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

    const newId = Date.now().toString();
    state.inventory.push({ id: newId, name, cost, price, desc, code, image });

    // ¿Hubo una activación de IA en progreso? (Foto recién tomada por AI Scanner)
    if (window.tempAiActivation && knnClassifier) {
        // Enseñar al KNNClassifier que esta activación es de este producto (newId)
        try {
            knnClassifier.addExample(window.tempAiActivation, newId);
            persistKnn(); // Guardar aprendizaje matemático
        } catch (e) {
            console.error(e);
        }
        window.tempAiActivation.dispose(); // Limpiar memoria de WebGL
        window.tempAiActivation = null;
    }

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
                    <button onclick="hOpenScanner('sales')" class="bg-gradient-to-br from-primary to-pink-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-all">
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

// --- SCANNER & AI LOGIC ---

async function initAI() {
    try {
        if (!aiModel) {
            console.log("Cargando MobileNet...");
            aiModel = await mobilenet.load({ version: 2, alpha: 1.0 });
            console.log("MobileNet cargado.");
        }
        if (!knnClassifier) {
            console.log("Inicializando KNN Classifier...");
            knnClassifier = knnClassifier || window.knnClassifier.create();
            console.log("KNN listo.");
            // Restaurar dataset de LocalStorage si existe
            const dataset = localStorage.getItem('knn_dataset');
            if (dataset) {
                try {
                    const tensorObj = JSON.parse(dataset);
                    const tensorMap = {};
                    Object.keys(tensorObj).forEach(key => {
                        tensorMap[key] = tf.tensor(tensorObj[key], [tensorObj[key].length / 1024, 1024]);
                    });
                    knnClassifier.setClassifierDataset(tensorMap);
                    console.log("Dataset KNN restaurado.");
                } catch (e) {
                    console.error("Error cargando KNN dataset", e);
                }
            }
        }
        isAiLoading = false;

        // Si el escáner está abierto, actualizamos la vista para quitar el loader
        if (state.currentView === 'view-scanner') {
            renderScanner(document.getElementById('view-scanner'));
        }
    } catch (e) {
        console.error("Error al cargar IA:", e);
        isAiLoading = false;
        if (state.currentView === 'view-scanner') {
            renderScanner(document.getElementById('view-scanner'));
        }
        alert("Aviso: El motor de IA Visual podría no estar disponible offline en este momento.");
    }
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
        <div class="bg-black min-h-screen flex flex-col relative z-50">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 pt-12 absolute top-0 w-full z-20">
                <button onclick="hCloseScanner()" class="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div class="bg-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    Modo: ${currentScannerMode === 'sales' ? 'Ventas' : 'Inventario'}
                </div>
            </div>

            <!-- Scanner Feed Area -->
            <div class="flex-1 relative bg-slate-900 rounded-b-[3rem] overflow-hidden shadow-2xl">
                <!-- QR/Barcode Reader Container -->
                <div id="reader" class="w-full h-full object-cover"></div>
                
                <!-- UI Overlay for scanning -->
                <div class="absolute inset-0 pointer-events-none border-[6px] border-primary/20 m-6 rounded-[2rem] z-10 flex items-center justify-center">
                    <div class="w-64 h-64 border-2 border-primary rounded-3xl relative">
                        <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl -translate-x-1 -translate-y-1"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl translate-x-1 -translate-y-1"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl -translate-x-1 translate-y-1"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl translate-x-1 translate-y-1"></div>
                        <div class="scan-line absolute left-0 w-full h-1 bg-primary shadow-[0_0_15px_#ec4899] animate-[scan_3s_infinite_ease-in-out]"></div>
                    </div>
                </div>

                ${isAiLoading ? `
                <div class="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-white">
                    <span class="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">autorenew</span>
                    <p class="font-black text-xs uppercase tracking-widest">Iniciando Motor IA...</p>
                </div>
                ` : ''}
            </div>
            
            <!-- Controls Area -->
            <div class="p-8 flex flex-col items-center justify-center min-h-[160px] bg-black text-white relative z-20">
                ${currentScannerMode === 'inventory' ? `
                    <p class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Toma una foto para enseñarle a la IA</p>
                    <button onclick="hTriggerAiScan()" class="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-transform disabled:opacity-50" ${isAiLoading ? 'disabled' : ''}>
                        <div class="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center">
                            <span class="material-symbols-outlined text-black !text-3xl">psychology</span>
                        </div>
                    </button>
                ` : `
                    <p class="text-[10px] font-black uppercase text-primary animate-pulse tracking-widest mb-2 flex items-center gap-2">
                        <span class="material-symbols-outlined !text-sm">psychology</span> Escaneo de IA Activo
                    </p>
                    <p class="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Apunta al producto y lo reconoceremos solitos</p>
                `}
            </div>
        </div>
    `;

    // Start scanner after render
    setTimeout(startScanner, 100);
}

function hOpenScanner(mode) {
    currentScannerMode = mode;
    navigateTo('view-scanner');
}

function hCloseScanner() {
    stopScanner();
    goBack();
}

// Inicializar lector y lógica de captura
function startScanner() {
    if (html5QrcodeScanner) return;

    html5QrcodeScanner = new Html5Qrcode("reader");

    html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText, decodedResult) => {
            // QR detectado
            handleScanResult(decodedText);
        },
        (errorMessage) => {
            // ignorar errores continuos de escaneo
        }
    ).then(() => {
        // La cámara inició, si es modo Ventas arranca la IA en loop
        if (currentScannerMode === 'sales' && !isAiLoading && knnClassifier.getNumClasses() > 0) {
            isAiScanning = true;
            aiScanLoop();
        }
    }).catch((err) => {
        console.error("Error iniciando cámara", err);
    });
}

function stopScanner() {
    isAiScanning = false;
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }).catch(err => console.error("Fallo al detener cámara", err));
    }
}

// Lazo de escaneo continuo para IA (Modo Ventas)
async function aiScanLoop() {
    if (!isAiScanning) return;

    const videoObj = document.querySelector("#reader video");

    if (videoObj && videoObj.readyState === 4 && aiModel && knnClassifier && knnClassifier.getNumClasses() > 0) {
        try {
            const activation = aiModel.infer(videoObj, true);
            const result = await knnClassifier.predictClass(activation);

            // Si la IA está más de 85% segura
            if (result.confidences[result.label] > 0.85) {
                const product = state.inventory.find(p => p.id === result.label);
                if (product) {
                    isAiScanning = false;
                    stopScanner();
                    hAddToCart(product.id);
                    alert(`IA Detectó Automáticamente: ${product.name} ✅`);
                    goBack();
                    return;
                }
            }
        } catch (e) { }
    }

    // Repetir ciclo
    if (isAiScanning) {
        setTimeout(aiScanLoop, 800);
    }
}

// Manejador del QR/Barras
function handleScanResult(code) {
    // Evitar múltiples lecturas
    stopScanner();

    if (currentScannerMode === 'sales') {
        const product = state.inventory.find(p => p.code === code);
        if (product) {
            hAddToCart(product.id);
            alert(`Escaneado: ${product.name} ✅`);
            goBack();
        } else {
            alert(`El código ${code} no está en el inventario.`);
            goBack();
        }
    } else if (currentScannerMode === 'inventory') {
        goBack();
        // Esperamos que la vista cambie y luego rellenamos
        setTimeout(() => {
            const codeInput = document.getElementById('inv-code');
            if (codeInput) {
                codeInput.value = code;
                codeInput.classList.add('animate-pop-in');
            }
        }, 300);
    }
}

// Acción del Botón de Inteligencia Artificial (Solo en Inventario)
async function hTriggerAiScan() {
    if (!aiModel || !knnClassifier) return alert("La IA aún se está cargando. Espera un momento.");
    if (currentScannerMode !== 'inventory') return;

    // El video de la cámara
    const videoObj = document.querySelector("#reader video");
    if (!videoObj) return alert("Cámara no disponible.");

    try {
        // Pausar UI (Feedback visual)
        document.querySelector("#reader").style.opacity = "0.5";

        // Extraer "huella digital" visual del video en vivo
        const activation = aiModel.infer(videoObj, true);

        // Modo "Agregar al Inventario": Entrenamos a la IA para que recuerde esto

        // 1. Obtener predicción genérica de MobileNet para sugerir un nombre
        const predictions = await aiModel.classify(videoObj);
        let suggestedName = predictions[0].className.split(',')[0];
        // Traducción básica sugerida (simplificada)
        const suggestion = `Sugerencia IA: ${suggestedName}`;

        // 2. Pasamos el Tensor a la vista de inventario para guardarlo si el usuario confirma
        stopScanner();
        goBack();

        setTimeout(() => {
            const nameInput = document.getElementById('inv-name');
            if (nameInput && !nameInput.value) {
                nameInput.value = suggestedName; // Ponemos el valor real para no perderlo
            }

            // Extraer imagen para el preview MUY PEQUEÑA para no romper localStorage
            const canvas = document.createElement('canvas');
            const maxSize = 200;
            const aspect = videoObj.videoWidth / videoObj.videoHeight;
            canvas.width = maxSize;
            canvas.height = maxSize / aspect;

            canvas.getContext('2d').drawImage(videoObj, 0, 0, canvas.width, canvas.height);
            tempInventoryImage = canvas.toDataURL('image/jpeg', 0.6);

            const preview = document.getElementById('inv-image-preview');
            if (preview) {
                preview.innerHTML = `<img src="${tempInventoryImage}" class="w-full h-full object-cover">`;
                preview.classList.remove('hidden');
            }

            // Guardaremos temporalmente la activación (feature map) para asociarla al ID al guardar
            // Para que no se pierda si hay delay
            window.tempAiActivation = activation;

        }, 500); // 500ms para asegurar que el render de Inventory ocurrió

    } catch (e) {
        console.error("Error en AI Scan:", e);
        alert("Ocurrió un error al procesar la imagen con IA.");
        document.querySelector("#reader").style.opacity = "1";
    }
}

// Persistir KNN Model a LocalStorage
function persistKnn() {
    if (!knnClassifier) return;
    try {
        let dataset = knnClassifier.getClassifierDataset();
        let datasetObj = {};
        Object.keys(dataset).forEach((key) => {
            let data = dataset[key].dataSync();
            datasetObj[key] = Array.from(data);
        });
        localStorage.setItem('knn_dataset', JSON.stringify(datasetObj));
    } catch (e) { console.error("Could not persist KNN", e) }
}

// Al añadir un producto en Inventario, guardamos la imagen y entrenamos KNN
function hAddProduct() {
    const name = document.getElementById('inv-name').value;
    const cost = parseFloat(document.getElementById('inv-cost').value);
    const price = parseFloat(document.getElementById('inv-price').value);
    const desc = document.getElementById('inv-desc').value;
    const code = document.getElementById('inv-code').value;
    const image = tempInventoryImage;

    if (!name || isNaN(cost) || isNaN(price)) return alert("Completa nombre, costo y precio");

    const newId = Date.now().toString();
    state.inventory.push({ id: newId, name, cost, price, desc, code, image });

    // ¿Hubo una activación de IA en progreso? (Foto recién tomada por AI Scanner)
    if (window.tempAiActivation && knnClassifier) {
        // Enseñar al KNNClassifier que esta activación es de este producto (newId)
        knnClassifier.addExample(window.tempAiActivation, newId);
        window.tempAiActivation.dispose(); // Limpiar memoria de WebGL
        window.tempAiActivation = null;
    }

    tempInventoryImage = null;
    saveState();
    renderInventory(document.getElementById('view-inventory'));
}

// --- INITIALIZER ---
window.onload = async () => {
    // 1. Start AI Load in background
    initAI();

    // 2. Tasa BCV on startup
    await updateExchangeRate();

    // 3. Start View
    if (!state.isRegistered) {
        navigateTo('view-onboarding');
    } else {
        navigateTo(state.currentView || 'view-dashboard');
    }
};


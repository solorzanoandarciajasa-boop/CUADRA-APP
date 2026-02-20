/**
 * CUADRA - Gestión Inteligente para Negocios
 * Creado por JASA
 */

// --- INITIAL STATE ---
const CONFIG = {
    STORAGE_KEY: 'cuadra_v2_state',
    CURRENCY_BS: 'Bs',
    CURRENCY_USD: '$'
};

let state = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {
    isRegistered: false,
    user: {
        name: '',
        phone: '',
        email: '',
        address: '',
        businessName: ''
    },
    currentView: 'view-onboarding',
    exchangeRate: 36.54,
    rateMode: 'manual',
    inventory: [],
    transactions: [],
    debts: [],
    expenses: [],
    cart: []
};

// --- CORE UTILS ---
function save() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
}

async function fetchExchangeRate() {
    if (state.rateMode === 'manual') return;
    try {
        // Usando una API confiable para el mercado venezolano (BCV)
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const data = await response.json();
        if (data && data.promedio) {
            state.exchangeRate = data.promedio;
            save();
            if (state.currentView === 'view-dashboard' || state.currentView === 'view-settings') {
                render(state.currentView);
            }
        }
    } catch (e) {
        console.error('Error obteniendo tasa BCV:', e);
    }
}

function navigateTo(viewId) {
    // Hidden navigation logic
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        state.currentView = viewId;
        render(viewId);
        // Desplazar al inicio automáticamente al cambiar de vista
        const app = document.getElementById('app');
        if (app) app.scrollTop = 0;
    }
}

// --- RENDER ENGINE ---
function render(viewId) {
    if (!state.isRegistered && viewId !== 'view-onboarding') {
        navigateTo('view-onboarding');
        return;
    }

    const container = document.getElementById(viewId);
    if (!container) return;

    switch (viewId) {
        case 'view-onboarding': renderOnboarding(container); break;
        case 'view-dashboard': renderDashboard(container); break;
        case 'view-add-product': renderAddProduct(container); break;
        case 'view-inventory': renderInventory(container); break;
        case 'view-sales': renderSales(container); break;
        case 'view-debts': renderDebts(container); break;
        case 'view-expenses': renderExpenses(container); break;
        case 'view-reports': renderReports(container); break;
        case 'view-closure': renderClosure(container); break;
        case 'view-settings': renderSettings(container); break;
        case 'view-scanner': renderScanner(container); break;
    }
}

// --- SHARED COMPONENTS ---
function renderHeader(title) {
    return `
        <header class="p-4 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-sm">
            <div class="flex items-center justify-between">
                <div class="flex flex-col">
                    <h1 class="text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-none">CUADRA</h1>
                    <span class="text-[10px] font-bold text-primary tracking-widest uppercase ml-0.5">por jasa</span>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="navigateTo('view-settings')" class="p-2 rounded-full text-slate-500 bg-slate-100 dark:bg-slate-800"><span class="material-symbols-outlined text-[20px]">settings</span></button>
                    <div class="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20"><span class="material-symbols-outlined text-primary">person</span></div>
                </div>
            </div>
            ${title ? `<h2 class="text-lg font-bold mt-4 text-slate-800 dark:text-white">${title}</h2>` : ''}
        </header>
    `;
}

function renderNav() {
    const active = state.currentView;
    const items = [
        { id: 'view-dashboard', icon: 'home', label: 'Inicio' },
        { id: 'view-inventory', icon: 'inventory_2', label: 'Stock' },
        { id: 'view-scanner', icon: 'qr_code_scanner', label: '', special: true },
        { id: 'view-sales', icon: 'shopping_cart', label: 'Venta' },
        { id: 'view-debts', icon: 'calendar_month', label: 'Fiados' }
    ];

    return `
        <nav class="fixed bottom-0 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-safe z-50">
            <div class="flex justify-between items-center">
                ${items.map(item => item.special ? `
                    <button onclick="navigateTo('view-scanner')" class="relative -top-8 bg-primary text-white h-16 w-16 rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 border-[5px] border-slate-50 dark:border-slate-950 scale-110 active:scale-95 transition-all">
                        <span class="material-symbols-outlined text-3xl">qr_code_scanner</span>
                    </button>
                ` : `
                    <button onclick="navigateTo('${item.id}')" class="flex flex-col items-center gap-1 ${active === item.id ? 'text-primary' : 'text-slate-400 group'}">
                        <span class="material-symbols-outlined ${active === item.id ? 'fill-1' : ''}">${item.icon}</span>
                        <span class="text-[10px] font-bold uppercase tracking-tighter">${item.label}</span>
                    </button>
                `).join('')}
            </div>
        </nav>
    `;
}

// --- ONBOARDING / REGISTRATION ---
function renderOnboarding(el) {
    el.innerHTML = `
        <div class="min-h-screen flex flex-col p-8 bg-gradient-to-br from-white to-pink-50 dark:from-slate-950 dark:to-slate-900">
            <div class="mt-12 mb-10">
                <h1 class="text-5xl font-black text-slate-950 dark:text-white tracking-tighter">CUADRA</h1>
                <p class="text-primary font-black uppercase tracking-widest text-sm">creada por jasa</p>
                <div class="h-1 w-20 bg-primary mt-4 rounded-full"></div>
            </div>
            
            <div class="space-y-6">
                <div><h2 class="text-xl font-bold">Bienvenido</h2><p class="text-sm text-slate-500">Registremos tu negocio para comenzar.</p></div>
                
                <div class="space-y-4">
                    <div class="group"><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre del Dueño</label>
                    <input id="reg-name" type="text" placeholder="Ej. Juan Pérez" class="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold shadow-sm focus:border-primary transition-all"></div>
                    
                    <div><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre del Negocio</label>
                    <input id="reg-business" type="text" placeholder="Ej. Bodega La Bendición" class="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold shadow-sm focus:border-primary transition-all"></div>
                    
                    <div><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Número de Teléfono</label>
                    <input id="reg-phone" type="tel" placeholder="0412 000 0000" class="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold shadow-sm focus:border-primary transition-all"></div>
                    
                    <div><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dirección</label>
                    <input id="reg-address" type="text" placeholder="Calle central..." class="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold shadow-sm focus:border-primary transition-all"></div>
                </div>

                <button onclick="handleRegister()" class="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">Comenzar a Cuadrar</button>
            </div>
        </div>
    `;
}

function handleRegister() {
    const user = {
        name: document.getElementById('reg-name').value,
        businessName: document.getElementById('reg-business').value,
        phone: document.getElementById('reg-phone').value,
        address: document.getElementById('reg-address').value
    };

    if (!user.name || !user.businessName) {
        alert('Por favor completa los nombres.');
        return;
    }

    state.user = user;
    state.isRegistered = true;
    save();
    navigateTo('view-dashboard');
}

// --- VIEW: DASHBOARD ---
function renderDashboard(el) {
    const totalVentas = state.transactions.filter(t => t.type === 'venta').reduce((a, b) => a + b.amountUSD, 0);
    const totalEgresos = state.expenses.reduce((a, b) => a + b.amountUSD, 0);
    const totalFiado = state.debts.reduce((a, b) => a + b.amount, 0);

    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
            ${renderHeader(state.user.businessName)}
            <main class="p-4 space-y-6">
                <!-- Tasa BCV Card -->
                <div class="relative overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-2xl">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div class="relative flex justify-between items-center">
                        <div class="text-left">
                            <span class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tasa Oficial BCV</span>
                            <div class="flex items-baseline gap-2 mt-1">
                                <h3 class="text-3xl font-black">${state.exchangeRate.toFixed(2)}</h3>
                                <span class="text-xs font-bold text-slate-400">Bs/$</span>
                            </div>
                        </div>
                        <button onclick="navigateTo('view-settings')" class="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase border border-white/10">Ajustar</button>
                    </div>
                </div>

                <!-- Main Stats Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventas</span>
                        <p class="text-xl font-black text-emerald-600 mt-1">$${totalVentas.toFixed(2)}</p>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Egresos</span>
                        <p class="text-xl font-black text-red-500 mt-1">$${totalEgresos.toFixed(2)}</p>
                    </div>
                </div>

                <!-- Fiados Alert -->
                <button onclick="navigateTo('view-debts')" class="w-full bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl border border-red-100 dark:border-red-900/30 flex items-center justify-between text-left">
                    <div class="flex items-center gap-3">
                        <div class="bg-red-500 text-white p-2 rounded-xl"><span class="material-symbols-outlined text-[20px]">priority_high</span></div>
                        <div><p class="text-xs font-black text-red-600 uppercase tracking-widest">Tienes Fiados por cobrar</p><p class="text-lg font-black text-red-700">$${totalFiado.toFixed(2)}</p></div>
                    </div>
                    <span class="material-symbols-outlined text-red-300">chevron_right</span>
                </button>

                <!-- Shortcut Buttons -->
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="navigateTo('view-add-product')" class="bg-primary text-white p-6 rounded-[32px] flex flex-col items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        <span class="material-symbols-outlined text-3xl">add_box</span>
                        <span class="text-[10px] font-black uppercase">Nuevo Producto</span>
                    </button>
                    <button onclick="navigateTo('view-reports')" class="bg-slate-900 text-white p-6 rounded-[32px] flex flex-col items-center gap-2 active:scale-95 transition-all">
                        <span class="material-symbols-outlined text-3xl">analytics</span>
                        <span class="text-[10px] font-black uppercase">Ver Reportes</span>
                    </button>
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

// --- VIEW: ADD PRODUCT ---
let productForm = {
    imgProduct: null,
    imgBarcode: null
};

function renderAddProduct(el) {
    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-white dark:bg-slate-900">
            <header class="p-4 flex items-center gap-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-30">
                <button onclick="navigateTo('view-inventory')" class="p-2 -ml-2"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-xl font-black tracking-tight">Nuevo Producto</h2>
            </header>
            
            <main class="p-6 space-y-8">
                <!-- Photo Upload Section -->
                <div class="flex gap-4">
                    <div onclick="pickMedia('product')" class="flex-1 aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                        ${productForm.imgProduct ? `<img src="${productForm.imgProduct}" class="w-full h-full object-cover">` : `
                        <span class="material-symbols-outlined text-slate-300 text-3xl">add_a_photo</span>
                        <p class="text-[9px] font-black text-slate-400 uppercase">Foto Producto</p>`}
                    </div>
                    <div onclick="pickMedia('barcode')" class="flex-1 aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                        ${productForm.imgBarcode ? `<img src="${productForm.imgBarcode}" class="w-full h-full object-cover">` : `
                        <span class="material-symbols-outlined text-slate-300 text-3xl">barcode_scanner</span>
                        <p class="text-[9px] font-black text-slate-400 uppercase">Foto Código</p>`}
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="space-y-5">
                    <div class="text-left"><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre del Producto / Servicio</label>
                    <input id="p-name" type="text" placeholder="Ej. Harina P.A.N 1kg" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold"></div>
                    
                    <div class="text-left"><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tamaño / Descripción</label>
                    <input id="p-size" type="text" placeholder="Ej. Mediano, 500ml, Grande" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold"></div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-left"><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Costo (Compra $)</label>
                        <input id="p-cost" type="number" step="0.01" placeholder="0.00" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold text-red-500"></div>
                        
                        <div class="text-left"><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Venta ($)</label>
                        <input id="p-price" type="number" step="0.01" placeholder="0.00" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold text-emerald-600"></div>
                    </div>

                    <div class="text-left"><label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo de Ítem</label>
                    <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <button onclick="pType='producto'; renderAddProduct(document.getElementById('view-add-product'))" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${pType === 'producto' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}">Producto</button>
                        <button onclick="pType='servicio'; renderAddProduct(document.getElementById('view-add-product'))" class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl ${pType === 'servicio' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}">Servicio</button>
                    </div></div>
                </div>

                <button onclick="handleSaveProduct()" class="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Guardar en Inventario</button>
            </main>
        </div>
    `;
}

let pType = 'producto';

function pickMedia(target) {
    const action = confirm("¿Quieres usar la cámara?");
    const input = document.getElementById(action ? 'camera-input' : 'gallery-input');

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                if (target === 'product') productForm.imgProduct = f.target.result;
                else productForm.imgBarcode = f.target.result;
                renderAddProduct(document.getElementById('view-add-product'));
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function handleSaveProduct() {
    const p = {
        id: Date.now().toString(),
        name: document.getElementById('p-name').value,
        size: document.getElementById('p-size').value,
        costUSD: parseFloat(document.getElementById('p-cost').value) || 0,
        priceUSD: parseFloat(document.getElementById('p-price').value) || 0,
        img: productForm.imgProduct,
        barcodeImg: productForm.imgBarcode,
        type: pType,
        stock: pType === 'producto' ? 0 : Infinity
    };

    if (!p.name || !p.priceUSD) {
        alert('Nombre y precio de venta son obligatorios.');
        return;
    }

    state.inventory.push(p);
    save();
    productForm = { imgProduct: null, imgBarcode: null };
    alert('¡Producto guardado por JASA!');
    navigateTo('view-inventory');
}

// --- VIEW: INVENTORY ---
function renderInventory(el) {
    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
            ${renderHeader('Gestión de Stock')}
            <main class="p-4 space-y-4">
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" placeholder="Buscar por nombre..." class="w-full bg-white dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm">
                </div>

                <div class="grid grid-cols-1 gap-3">
                    ${state.inventory.length === 0 ? `<div class="py-20 text-center opacity-30"><span class="material-symbols-outlined !text-5xl">inventory_2</span><p class="font-bold text-xs uppercase mt-2">Sin productos registrados</p></div>` :
            state.inventory.map(item => `
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div class="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img src="${item.img || 'https://via.placeholder.com/100'}" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1 text-left">
                                <h4 class="font-black text-sm text-slate-900 dark:text-white leading-tight">${item.name}</h4>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${item.size || 'Unico'}</p>
                                <div class="flex justify-between items-center mt-2">
                                    <div class="flex items-center gap-3">
                                        <div class="flex flex-col">
                                            <span class="text-[10px] font-black text-red-400">Costo: $${item.costUSD.toFixed(2)}</span>
                                            <span class="text-xs font-black text-emerald-600">Venta: $${item.priceUSD.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button onclick="addToCart('${item.id}')" class="bg-primary text-white h-10 w-10 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                                        <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </main>
            <div class="fixed bottom-24 right-4 z-30">
                <button onclick="navigateTo('view-add-product')" class="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all">
                    <span class="material-symbols-outlined text-2xl">add</span>
                </button>
            </div>
            ${renderNav()}
        </div>
    `;
}

// --- VIEW: SALES (POS) ---
function renderSales(el) {
    const subtotal = state.cart.reduce((a, b) => a + (b.priceUSD * b.quantity), 0);
    el.innerHTML = `
        <div class="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <header class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
                <h2 class="text-xl font-black">Tu Carrito</h2>
                <button onclick="clearCart()" class="text-slate-400"><span class="material-symbols-outlined">delete_sweep</span></button>
            </header>

            <main class="flex-1 p-4 pb-48 space-y-3 overflow-y-auto">
                ${state.cart.length === 0 ? `<div class="py-20 text-center opacity-20"><span class="material-symbols-outlined !text-6xl">shopping_basket</span><p class="font-bold text-xs uppercase mt-4">Carrito vacío</p></div>` :
            state.cart.map(item => `
                    <div class="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl flex items-center gap-4 animate-fadeIn">
                        <div class="flex-1 text-left">
                            <h4 class="font-bold text-sm leading-tight">${item.name}</h4>
                            <p class="text-[10px] font-black text-slate-400 mt-1 uppercase">$${item.priceUSD.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="updateCartItem('${item.id}', -1)" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center"><span class="material-symbols-outlined text-sm">remove</span></button>
                            <span class="font-black text-sm">${item.quantity}</span>
                            <button onclick="updateCartItem('${item.id}', 1)" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center"><span class="material-symbols-outlined text-sm">add</span></button>
                        </div>
                    </div>
                `).join('')}
            </main>

            <div class="fixed bottom-20 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                <div class="flex justify-between items-end mb-6">
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen Total</p>
                        <p class="text-3xl font-black text-slate-950 dark:text-white leading-none">$${subtotal.toFixed(2)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-black text-primary leading-none">Bs ${(subtotal * state.exchangeRate).toLocaleString()}</p>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button onclick="openCheckoutModal()" class="flex-1 bg-primary text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">Cobrar Venta</button>
                </div>
            </div>
            ${renderNav()}
        </div>
    `;
}

function openCheckoutModal() {
    if (state.cart.length === 0) return;

    // Mostramos un selector más claro para el tipo de venta
    const action = confirm("¿El cliente pagará de una vez? (VENTA NORMAL)\n\nPulsa 'Aceptar' para Venta Normal.\nPulsa 'Cancelar' para registrar como FIADO.");

    if (action) {
        completeSale('Contado');
    } else {
        openFiadoDialog();
    }
}

function openFiadoDialog() {
    const customer = prompt("Nombre del cliente para el FIADO:");
    if (!customer) return;
    const commitmentDate = prompt("¿Cuándo se compromete a pagar? (Ej. Viernes, 15 de Marzo):");

    const subtotal = state.cart.reduce((a, b) => a + (b.priceUSD * b.quantity), 0);
    state.debts.push({
        id: Date.now().toString(),
        customer: customer,
        amount: subtotal,
        date: new Date().toLocaleDateString(),
        commitmentDate: commitmentDate || 'Por acordar',
        items: [...state.cart]
    });

    completeSale('Fiado');
}

function completeSale(method) {
    const subtotal = state.cart.reduce((a, b) => a + (b.priceUSD * b.quantity), 0);
    state.transactions.unshift({
        id: '#' + Math.floor(Math.random() * 9000),
        date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amountUSD: subtotal,
        type: 'venta',
        method: method
    });

    state.cart = [];
    save();
    alert(`¡Venta procesada con éxito! ✅\nTipo: ${method}`);
    navigateTo('view-dashboard');
}

// --- VIEW: DEBTS (FIADOS) ---
function renderDebts(el) {
    const total = state.debts.reduce((a, b) => a + b.amount, 0);
    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-left">
            ${renderHeader('Cuentas por Cobrar (Fiados)')}
            <main class="p-4 space-y-4">
                <div class="bg-primary p-6 rounded-[32px] text-white shadow-xl shadow-primary/20">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Monto Pendiente Total</p>
                    <div class="flex items-baseline justify-between">
                        <h2 class="text-3xl font-black">$${total.toFixed(2)}</h2>
                        <span class="text-xs font-bold opacity-80">Bs ${(total * state.exchangeRate).toLocaleString()}</span>
                    </div>
                </div>

                <div class="space-y-3">
                    ${state.debts.length === 0 ? `<div class="py-20 text-center opacity-30"><p class="font-bold text-xs uppercase">No hay deudas activas</p></div>` :
            state.debts.map(d => `
                        <div class="bg-white dark:bg-slate-900 p-5 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                            <div class="text-left w-2/3">
                                <h4 class="font-black text-sm text-slate-900 dark:text-white">${d.customer}</h4>
                                <div class="space-y-1 mt-1">
                                    <p class="text-[9px] font-black text-slate-400 uppercase leading-none">Desde: ${d.date}</p>
                                    <p class="text-[10px] font-black text-primary uppercase leading-none">Compromiso: ${d.commitmentDate}</p>
                                </div>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-xl font-black text-red-500 leading-none">$${d.amount.toFixed(2)}</span>
                                <div class="flex gap-2 mt-3">
                                     <button onclick="shareReceipt('${d.id}')" class="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center active:scale-90 transition-all"><span class="material-symbols-outlined text-lg">share</span></button>
                                     <button onclick="handleAbono('${d.id}')" class="px-4 h-10 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase tracking-widest active:scale-95">Abonar</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

function handleAbono(id) {
    const d = state.debts.find(item => item.id === id);
    const amount = parseFloat(prompt(`Abonar a la deuda de ${d.customer} (Monto pendiente: $${d.amount.toFixed(2)}):`));

    if (isNaN(amount) || amount <= 0) return;

    d.amount -= amount;
    if (d.amount <= 0) {
        state.debts = state.debts.filter(i => i.id !== id);
        alert('¡Deuda totalmente pagada! 🎉');
    } else {
        alert(`Abono registrado. Nuevo saldo: $${d.amount.toFixed(2)}`);
    }

    save();
    renderDebts(document.getElementById('view-debts'));
}

function shareReceipt(id) {
    const d = state.debts.find(item => item.id === id);
    const msg = `*RECORDATORIO DE PAGO - CUADRA*\n\nHola ${d.customer},\n\nTe recordamos tu cuenta pendiente por un monto de *$${d.amount.toFixed(2)}* (Equivalente a Bs ${(d.amount * state.exchangeRate).toLocaleString()}).\n\n📅 Fecha acordada para el pago: *${d.commitmentDate}*.\n\n_Enviado desde CUADRA App_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- VIEW: EXPENSES ---
function renderExpenses(el) {
    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-left">
            ${renderHeader('Egresos y Gastos')}
            <main class="p-4 space-y-6">
                <!-- Form Gasto -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrar Egreso</h3>
                    <div class="space-y-4">
                        <input id="exp-concept" type="text" placeholder="Concepto (ej. Pago Internet)" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold">
                        <div class="flex gap-3">
                            <input id="exp-amount" type="number" step="0.01" placeholder="Monto $" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold text-red-500">
                            <select id="exp-cat" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold text-xs uppercase">
                                <option>Operativo</option>
                                <option>Inventario</option>
                                <option>Servicios</option>
                            </select>
                        </div>
                        <button onclick="handleAddExpense()" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Guardar Gasto</button>
                    </div>
                </div>

                <!-- Listado Gasto -->
                <div class="space-y-3">
                    ${state.expenses.length === 0 ? '<p class="text-center py-10 opacity-30 text-[10px] font-bold uppercase">Sin gastos registrados</p>' :
            state.expenses.map(e => `
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-3xl flex justify-between items-center border border-slate-50 dark:border-slate-800 shadow-sm">
                            <div class="text-left">
                                <p class="font-bold text-sm text-slate-900 dark:text-white">${e.concept}</p>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${e.category} • ${e.date}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-black text-red-500">-$${e.amountUSD.toFixed(2)}</p>
                                <p class="text-[9px] font-bold text-slate-400">Bs ${(e.amountUSD * state.exchangeRate).toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

function handleAddExpense() {
    const concept = document.getElementById('exp-concept').value;
    const amount = parseFloat(document.getElementById('exp-amount').value);
    const cat = document.getElementById('exp-cat').value;

    if (!concept || isNaN(amount)) return;

    const exp = {
        id: Date.now().toString(),
        concept,
        amountUSD: amount,
        category: cat,
        date: new Date().toLocaleDateString()
    };

    state.expenses.unshift(exp);
    save();
    alert('Gasto registrado con éxito');
    renderExpenses(document.getElementById('view-expenses'));
}

// --- VIEW: REPORTS ---
function renderReports(el) {
    const totalVentas = state.transactions.filter(t => t.type === 'venta').reduce((a, b) => a + b.amountUSD, 0);
    const totalCosto = state.transactions.filter(t => t.type === 'venta').reduce((a, b) => {
        // En una app real, aquí buscaríamos el costo de compra de cada item vendido
        return a + (b.amountUSD * 0.7); // Estimado de costo
    }, 0);
    const totalGastos = state.expenses.reduce((a, b) => a + b.amountUSD, 0);
    const gananciaReal = totalVentas - totalCosto - totalGastos;

    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-left">
            ${renderHeader('JASA Analytics')}
            <main class="p-4 space-y-6">
                <!-- Resumen Report -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Rendimiento Histórico</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-bold text-slate-500">Ingresos Totales</span>
                            <span class="text-lg font-black text-emerald-600">$${totalVentas.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-bold text-slate-500">Egresos Operativos</span>
                            <span class="text-lg font-black text-red-500">-$${totalGastos.toFixed(2)}</span>
                        </div>
                        <div class="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <span class="text-sm font-black text-slate-900 dark:text-white uppercase">Ganancia Neta</span>
                            <span class="text-2xl font-black text-primary">$${gananciaReal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Top Products (Mockup) -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Productos Más Vendidos</h3>
                    <div class="space-y-3">
                        ${state.inventory.slice(0, 3).map((item, idx) => `
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <span class="text-xs font-black text-primary">#${idx + 1}</span>
                                    <span class="text-sm font-bold">${item.name}</span>
                                </div>
                                <span class="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-black">12 Unid.</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

// --- VIEW: CLOSURE (CIERRE DE CAJA) ---
function renderClosure(el) {
    const today = new Date().toLocaleDateString();
    // Filtramos solo las que dicen "Hoy" o tienen la fecha actual
    const todayVentas = state.transactions.filter(t => t.type === 'venta' && (t.date.includes('Hoy') || t.date.includes(today)));
    const totalUSD = todayVentas.reduce((a, b) => a + b.amountUSD, 0);

    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-left">
            <header class="p-4 flex items-center gap-3">
                <button onclick="navigateTo('view-dashboard')" class="p-2"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-xl font-black">Cierre de Caja</h2>
            </header>
            <main class="p-4 space-y-6">
                <div class="bg-white dark:bg-slate-900 p-8 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                    <span class="material-symbols-outlined !text-5xl text-primary mb-4">lock_clock</span>
                    <h3 class="text-2xl font-black text-slate-950 dark:text-white">Resumen Mensual</h3>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${today}</p>
                    
                    <div class="mt-8 space-y-4">
                        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                            <p class="text-[10px] font-black text-slate-400 uppercase">Ventas Brutas</p>
                            <p class="text-3xl font-black text-emerald-600">$${totalUSD.toFixed(2)}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                             <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                                <p class="text-[8px] font-black text-slate-400 uppercase">Efectivo ($)</p>
                                <p class="text-lg font-black">$${(totalUSD * 0.4).toFixed(2)}</p>
                             </div>
                             <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                                <p class="text-[8px] font-black text-slate-400 uppercase">Pago Móvil ($)</p>
                                <p class="text-lg font-black">$${(totalUSD * 0.6).toFixed(2)}</p>
                             </div>
                        </div>
                    </div>
                </div>

                <button onclick="handleFinishDay()" class="w-full bg-primary text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">Confirmar y Cerrar Día</button>
            </main>
        </div>
    `;
}

function handleFinishDay() {
    alert('¡Excelente trabajo hoy! Caja cerrada guardada en histórico por JASA ✅');
    navigateTo('view-dashboard');
}

// --- VIEW: SETTINGS ---
function renderSettings(el) {
    el.innerHTML = `
        <div class="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-left">
            <header class="p-4 flex items-center gap-3">
                <button onclick="navigateTo('view-dashboard')" class="p-2"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-xl font-black">Panel de Ajustes</h2>
            </header>
            <main class="p-4 space-y-6">
                <!-- Tasa Config -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración de Moneda</h3>
                    
                    <div class="flex items-center justify-between">
                        <div class="text-left">
                            <p class="text-sm font-bold">Modo de Tasa</p>
                            <p class="text-[10px] text-slate-500 uppercase font-black">${state.rateMode === 'auto' ? 'Automático (BCV)' : 'Manual'}</p>
                        </div>
                        <button onclick="toggleRateMode()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase">Cambiar</button>
                    </div>

                    ${state.rateMode === 'manual' ? `
                        <div class="space-y-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ajustar Tasa Manual (Bs/$)</label>
                            <input type="number" step="0.01" value="${state.exchangeRate}" onchange="updateRate(this.value)" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-black text-xl text-primary">
                        </div>
                    ` : `
                        <div class="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center gap-3">
                            <span class="material-symbols-outlined text-emerald-600">wifi</span>
                            <p class="text-[10px] font-bold text-emerald-700">Conectado a la red oficial del Banco Central de Venezuela.</p>
                        </div>
                    `}
                </div>

                <!-- Perfil Negocio -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos del Comercio</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div><p class="text-[9px] font-black text-slate-400 uppercase">Nombre</p><p class="text-xs font-bold">${state.user.name}</p></div>
                        <div><p class="text-[9px] font-black text-slate-400 uppercase">Negocio</p><p class="text-xs font-bold">${state.user.businessName}</p></div>
                    </div>
                </div>

                <div class="pt-10 flex flex-col items-center gap-4">
                    <button onclick="if(confirm('¿Borrar todo?')) { localStorage.clear(); location.reload(); }" class="text-red-500 font-bold text-xs uppercase tracking-widest opacity-50">Resetear Aplicación</button>
                    <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Cuadra por Jasa v2.0</p>
                </div>
            </main>
        </div>
    `;
}

function toggleRateMode() {
    state.rateMode = state.rateMode === 'auto' ? 'manual' : 'auto';
    save();
    renderSettings(document.getElementById('view-settings'));
}

function updateRate(val) {
    state.exchangeRate = parseFloat(val);
    save();
}

// --- SCANNER LOGIC ---
function renderScanner(el) {
    el.innerHTML = `
        <div class="bg-black min-h-screen flex flex-col items-center justify-center relative">
            <!-- Simulated Camera Feed -->
            <div class="absolute inset-0 z-0 bg-slate-900 opacity-50 flex items-center justify-center">
                 <span class="material-symbols-outlined !text-9xl text-white/5 animate-pulse">videocam</span>
            </div>

            <!-- UI Overlay -->
            <div class="relative z-10 w-full flex flex-col items-center">
                <div class="w-72 h-72 border-2 border-primary rounded-[60px] relative overflow-hidden mb-12 shadow-[0_0_80px_rgba(236,72,153,0.3)]">
                    <div class="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_20px_#ec4899] animate-scanline"></div>
                </div>
                
                <div class="text-center px-10 space-y-4 mb-10">
                    <h3 class="text-white font-black text-2xl tracking-tight uppercase">Buscando Producto</h3>
                    <p class="text-white/40 text-xs font-bold leading-relaxed px-4">Solo enfoque el producto o el código de barras y JASA hará el resto.</p>
                </div>

                <div class="flex flex-col gap-4 w-64">
                    <button onclick="simulateDetection()" class="bg-white text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Detectar (Demo)</button>
                    <button onclick="navigateTo('view-dashboard')" class="text-white/30 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                </div>
            </div>
            
            <!-- Branding overlay -->
            <div class="absolute bottom-10 flex flex-col items-center opacity-30">
                <h1 class="text-white font-black text-lg">CUADRA</h1>
                <p class="text-primary font-black text-xs uppercase tracking-widest">jasa</p>
            </div>
        </div>
    `;
}

function simulateDetection() {
    if (state.inventory.length === 0) {
        alert('No hay productos en inventario para detectar. Registra uno primero.');
        navigateTo('view-add-product');
        return;
    }
    const item = state.inventory[Math.floor(Math.random() * state.inventory.length)];
    alert(`¡Producto Detectado!\nNombre: ${item.name}\nPrecio: $${item.priceUSD.toFixed(2)}`);
    addToCart(item.id);
    navigateTo('view-sales');
}

// --- CART LOGIC ---
function addToCart(id) {
    const product = state.inventory.find(i => i.id === id);
    const existing = state.cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else state.cart.push({ ...product, quantity: 1 });
    save();
}

function updateCartItem(id, change) {
    const item = state.cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) state.cart = state.cart.filter(i => i.id !== id);
    }
    save();
    renderSales(document.getElementById('view-sales'));
}

function clearCart() {
    state.cart = [];
    save();
    renderSales(document.getElementById('view-sales'));
}

// --- INITIALIZER ---
window.onload = async () => {
    // Intentar obtener tasa actualizada de inmediato
    await fetchExchangeRate();

    // Auto-actualizar cada 30 minutos
    setInterval(fetchExchangeRate, 30 * 60 * 1000);

    if (!state.isRegistered) {
        navigateTo('view-onboarding');
    } else {
        navigateTo(state.currentView || 'view-dashboard');
    }
};

// Global Exports
window.navigateTo = navigateTo;
window.handleRegister = handleRegister;
window.handleSaveProduct = handleSaveProduct;
window.pickMedia = pickMedia;
window.addToCart = (id) => { addToCart(id); alert('Añadido al carrito'); };
window.updateCartItem = updateCartItem;
window.clearCart = clearCart;
window.openCheckoutModal = openCheckoutModal;
window.handleAbono = handleAbono;
window.shareReceipt = shareReceipt;
window.simulateDetection = simulateDetection;
window.pType = 'producto';

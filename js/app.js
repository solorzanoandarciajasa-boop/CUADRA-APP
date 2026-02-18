// CUADRA App Logic - Final Context-Ready Version
// Powered by JASA

// Initial Global State
const state = JSON.parse(localStorage.getItem('cuadra_state')) || {
    currentView: 'view-onboarding',
    exchangeRate: 36.54,
    rateMode: 'auto', // 'auto' or 'manual'
    transactions: [
        { id: '#2034', date: 'Hoy, 10:23 AM', amountUSD: 24.50, amountBs: 895.23, type: 'venta', method: 'Pago Móvil' },
        { id: 'Alquiler Local', date: 'Ayer, 4:15 PM', amountUSD: -120.00, amountBs: -4384.80, type: 'gasto', category: 'Servicios' }
    ],
    inventory: [
        { id: '1', name: 'Harina P.A.N.', category: 'Alimentos', stock: 45, priceUSD: 1.20, purchasePriceUSD: 0.90, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200', type: 'producto' },
        { id: '2', name: 'Arroz Primor', category: 'Alimentos', stock: 22, priceUSD: 0.95, purchasePriceUSD: 0.70, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200', type: 'producto' },
        { id: '3', name: 'Delivery Centro', category: 'Servicios', stock: Infinity, priceUSD: 2.00, purchasePriceUSD: 0, image: 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80&w=200', type: 'servicio' }
    ],
    debts: [
        { id: 'd1', customer: 'Carlos Pérez', amount: 15.50, phone: '584121234567', date: 'Ayer', logs: [{ date: 'Ayer', action: 'Fiado', amount: 15.50 }] },
        { id: 'd2', customer: 'María García', amount: 8.00, phone: '584247654321', date: 'Hace 2 días', logs: [{ date: 'Hace 2 días', action: 'Fiado', amount: 8.00 }] }
    ],
    expenses: [
        { id: 'g1', concept: 'Alquiler Local', category: 'Operativo', amountUSD: 120.00, date: '2026-02-16' }
    ],
    cart: [],
    businessName: 'Mi Negocio',
    ownerName: 'Usuario JASA'
};

// Persistence & Rate Fetching
function saveState() {
    localStorage.setItem('cuadra_state', JSON.stringify(state));
}

async function fetchRate() {
    if (state.rateMode !== 'auto') return;
    try {
        // En un entorno real usaríamos una API como bcv-api o similar
        // Simulamos latencia de red
        console.log("Actualizando tasa BCV...");
    } catch (e) {
        console.error("Error buscando tasa, usando manual.");
    }
}

// Global View Navigation
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        state.currentView = viewId;
        renderCurrentView();
        window.scrollTo(0, 0);
    }
}

function renderCurrentView() {
    const viewId = state.currentView;
    if (viewId === 'view-dashboard') renderDashboard();
    else if (viewId === 'view-inventory') renderInventory();
    else if (viewId === 'view-sales') renderSales();
    else if (viewId === 'view-debts') renderDebts();
    else if (viewId === 'view-scanner') renderScanner();
    else if (viewId === 'view-expenses') renderExpenses();
    else if (viewId === 'view-reports') renderReports();
    else if (viewId === 'view-closure') renderClosure();
    else if (viewId === 'view-settings') renderSettings();
}

// UI Components
function renderNav() {
    const active = state.currentView;
    const items = [
        { id: 'view-dashboard', icon: 'dashboard', label: 'Resumen' },
        { id: 'view-inventory', icon: 'inventory_2', label: 'Stock' },
        { id: 'view-scanner', icon: 'qr_code_scanner', label: '', special: true },
        { id: 'view-sales', icon: 'sell', label: 'Ventas' },
        { id: 'view-debts', icon: 'receipt_long', label: 'Fiados' }
    ];

    return `
        <nav class="fixed bottom-0 w-full max-w-md z-20 border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark pb-safe">
            <div class="flex justify-around items-center px-2 py-3">
                ${items.map(item => item.special ? `
                    <div class="relative -top-6">
                        <button onclick="navigateTo('view-scanner')" class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary-light text-white shadow-lg shadow-primary/40 active:scale-95 border-4 border-background-light dark:border-background-dark">
                            <span class="material-symbols-outlined text-[28px]">qr_code_scanner</span>
                        </button>
                    </div>
                ` : `
                    <button onclick="navigateTo('${item.id}')" class="flex flex-col items-center gap-1 group w-16 ${active === item.id ? 'text-primary' : 'text-slate-400'}">
                        <span class="material-symbols-outlined">${active === item.id ? item.icon : item.icon}</span>
                        <span class="text-[10px] font-bold">${item.label}</span>
                    </button>
                `).join('')}
            </div>
        </nav>
    `;
}

function renderHeader(title, showSettings = true) {
    return `
        <header class="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-4 pb-2">
            <div class="flex items-center justify-between mb-4">
                <div class="flex flex-col text-left">
                    <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">CUADRA</h1>
                    <span class="text-[9px] font-bold text-primary tracking-widest uppercase">MOTOR JASA</span>
                </div>
                <div class="flex items-center gap-2">
                    ${showSettings ? `
                        <button onclick="navigateTo('view-settings')" class="p-2 rounded-full text-slate-500 hover:bg-slate-100">
                            <span class="material-symbols-outlined">settings</span>
                        </button>
                    ` : ''}
                    <div class="h-8 w-8 rounded-full bg-slate-200 border border-primary" style='background-image: url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80"); background-size: cover;'></div>
                </div>
            </div>
            ${title ? `<h2 class="text-lg font-bold text-left mb-2 text-slate-800 dark:text-white">${title}</h2>` : ''}
        </header>
    `;
}

// View: Dashboard
function renderDashboard() {
    const view = document.getElementById('view-dashboard');
    const totalVentas = state.transactions.filter(t => t.type === 'venta').reduce((a, b) => a + b.amountUSD, 0);
    const totalGastos = state.transactions.filter(t => t.type === 'gasto').reduce((a, b) => a + Math.abs(b.amountUSD), 0);

    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24">
            ${renderHeader()}
            <main class="flex-1 px-4 space-y-5">
                <!-- Tasa Card -->
                <div class="relative w-full overflow-hidden rounded-2xl bg-slate-900 p-4 shadow-xl">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10"></div>
                    <div class="relative flex justify-between items-center text-white">
                        <div class="text-left">
                            <span class="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Tasa BCV del Día</span>
                            <div class="flex items-baseline gap-2">
                                <span class="text-3xl font-black">${state.exchangeRate.toFixed(2)}</span>
                                <span class="text-xs text-slate-400 font-bold">Bs/USD</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <button onclick="navigateTo('view-settings')" class="bg-white/10 hover:bg-white/20 text-[10px] font-bold py-1 px-3 rounded-full border border-white/20 backdrop-blur-sm transition-all">
                                ${state.rateMode === 'auto' ? 'Actualizado' : 'Manual'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Shortcuts -->
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="navigateTo('view-reports')" class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div class="p-2 bg-blue-50 text-blue-500 rounded-xl"><span class="material-symbols-outlined">bar_chart</span></div>
                        <span class="font-bold text-sm">Reportes</span>
                    </button>
                    <button onclick="navigateTo('view-expenses')" class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div class="p-2 bg-pink-50 text-pink-500 rounded-xl"><span class="material-symbols-outlined">outbox</span></div>
                        <span class="font-bold text-sm">Egresos</span>
                    </button>
                </div>

                <!-- Main Stats -->
                <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-left">Resumen Operativo</h3>
                    <div class="space-y-4">
                         <div class="flex justify-between items-end border-b border-slate-50 dark:border-slate-700 pb-3">
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-500">Ventas Totales</p>
                                <p class="text-2xl font-black text-slate-900 dark:text-white">$${totalVentas.toFixed(2)}</p>
                            </div>
                            <div class="text-right text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">Bs ${(totalVentas * state.exchangeRate).toLocaleString()}</div>
                         </div>
                         <div class="flex justify-between items-end">
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-500">Gastos Acumulados</p>
                                <p class="text-xl font-black text-red-500">$${totalGastos.toFixed(2)}</p>
                            </div>
                            <button onclick="navigateTo('view-closure')" class="bg-primary text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-lg shadow-primary/20">Cierre Diario</button>
                         </div>
                    </div>
                </div>

                <!-- Activity -->
                <div>
                     <div class="flex justify-between items-center mb-3">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest text-left">Actividad Reciente</h3>
                        <button class="text-[10px] font-bold text-primary">Ver histórico</button>
                     </div>
                     <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y dark:divide-slate-700 overflow-hidden">
                        ${state.transactions.slice(0, 5).map(t => `
                            <div class="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div class="h-10 w-10 rounded-full ${t.type === 'venta' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} flex items-center justify-center mr-3">
                                    <span class="material-symbols-outlined text-[18px]">${t.type === 'venta' ? 'shopping_basket' : 'payments'}</span>
                                </div>
                                <div class="flex-1 text-left">
                                    <p class="text-sm font-bold text-slate-800 dark:text-white">${t.id}</p>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase">${t.date} ${t.method ? '• ' + t.method : ''}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-black ${t.amountUSD > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}">${t.amountUSD > 0 ? '+' : ''}$${Math.abs(t.amountUSD).toFixed(2)}</p>
                                    <p class="text-[9px] font-bold text-slate-400">Bs ${(Math.abs(t.amountUSD) * state.exchangeRate).toFixed(2)}</p>
                                </div>
                            </div>
                        `).join('')}
                     </div>
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

// View: Inventory / Catalog
function renderInventory() {
    const view = document.getElementById('view-inventory');
    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24">
            ${renderHeader('Inventario y Servicios')}
            <main class="flex-1 px-4 space-y-4">
                <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button class="flex-1 py-3 text-xs font-black rounded-xl bg-white shadow-sm text-primary">Productos</button>
                    <button class="flex-1 py-3 text-xs font-bold text-slate-500">Servicios</button>
                </div>
                
                <div class="relative group">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" placeholder="Buscar por nombre o código..." class="w-full bg-white dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20">
                </div>

                <div class="grid grid-cols-1 gap-3">
                    ${state.inventory.map(item => `
                        <div class="relative bg-white dark:bg-slate-800 p-3 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center gap-4">
                            <div class="h-20 w-20 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden">
                                <img src="${item.image}" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1 text-left">
                                <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">${item.name}</h4>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">${item.category}</p>
                                <div class="flex items-end justify-between mt-2">
                                    <div class="flex flex-col">
                                        <span class="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block">Stock: ${item.stock === Infinity ? '∞' : item.stock}</span>
                                        <span class="text-xs font-black mt-1">$${item.priceUSD.toFixed(2)}</span>
                                    </div>
                                    <div class="flex gap-1">
                                        <button class="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                                        <button onclick="addToCart('${item.id}')" class="p-2 bg-primary text-white rounded-lg"><span class="material-symbols-outlined text-[18px]">add_shopping_cart</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </main>
            <div class="fixed bottom-24 right-4 z-30">
                <button class="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all">
                    <span class="material-symbols-outlined text-2xl">add</span>
                </button>
            </div>
            ${renderNav()}
        </div>
    `;
}

// View: Sales / POS
function renderSales() {
    const view = document.getElementById('view-sales');
    const subtotalUSD = state.cart.reduce((a, b) => a + (b.priceUSD * b.quantity), 0);

    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark">
            <header class="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/50 backdrop-blur-md">
                <div class="flex items-center gap-3">
                    <button onclick="navigateTo('view-dashboard')" class="p-2 -ml-2"><span class="material-symbols-outlined">arrow_back_ios_new</span></button>
                    <h2 class="text-xl font-black">Carrito CUADRA</h2>
                </div>
                <button onclick="clearCart()" class="text-slate-400"><span class="material-symbols-outlined">delete</span></button>
            </header>

            <main class="flex-1 px-4 py-4 space-y-4 pb-48 overflow-y-auto">
                ${state.cart.length === 0 ? `
                    <div class="flex flex-col items-center justify-center py-20 opacity-30">
                        <span class="material-symbols-outlined !text-7xl mb-4">shopping_cart_off</span>
                        <p class="font-black text-sm uppercase tracking-widest">Carrito Vacío</p>
                    </div>
                ` : state.cart.map(item => `
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex items-center gap-4 animate-fadeIn">
                        <div class="flex-1 text-left">
                            <h4 class="font-bold text-sm leading-tight">${item.name}</h4>
                            <p class="text-[10px] font-black text-slate-400 mt-1 uppercase">$${item.priceUSD.toFixed(2)} / unidad</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="updateCartItem('${item.id}', -1)" class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center"><span class="material-symbols-outlined text-sm">remove</span></button>
                            <span class="font-black text-sm min-w-[20px] text-center">${item.quantity}</span>
                            <button onclick="updateCartItem('${item.id}', 1)" class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center"><span class="material-symbols-outlined text-sm">add</span></button>
                        </div>
                    </div>
                `).join('')}
            </main>

            <div class="fixed bottom-20 w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-100 dark:border-slate-800">
                <div class="flex justify-between items-center mb-5">
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                        <p class="text-3xl font-black text-slate-900 dark:text-white">$${subtotalUSD.toFixed(2)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-black text-primary">Bs ${(subtotalUSD * state.exchangeRate).toLocaleString()}</p>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="checkout('Fiado')" class="flex-1 border-2 border-slate-100 dark:border-slate-800 h-16 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50">Fiado</button>
                    <button onclick="checkout('Efectivo')" class="flex-[2] bg-primary text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">Cobrar Venta</button>
                </div>
            </div>
            ${renderNav()}
        </div>
    `;
}

// View: Expenses (Gastos)
function renderExpenses() {
    const view = document.getElementById('view-expenses');
    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24 text-left">
            ${renderHeader('Egresos y Gastos')}
            <main class="px-4 space-y-4">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-50">
                    <h3 class="text-xs font-black text-slate-400 uppercase mb-4">Registrar Nuevo Gasto</h3>
                    <div class="space-y-3">
                        <input id="exp-concept" type="text" placeholder="Concepto (ej. Pago Internet)" class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 text-sm font-bold">
                        <input id="exp-amount" type="number" placeholder="Monto en USD" class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 text-sm font-bold">
                        <select id="exp-cat" class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 text-sm font-bold">
                            <option>Operativo</option>
                            <option>Inventario</option>
                            <option>Servicios</option>
                            <option>Sueldos</option>
                        </select>
                        <button onclick="addExpense()" class="w-full bg-slate-900 dark:bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest mt-2">Guardar Gasto</button>
                    </div>
                </div>

                <div class="space-y-3">
                    ${state.expenses.map(exp => `
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex justify-between items-center">
                            <div><p class="font-bold text-sm">${exp.concept}</p><p class="text-[10px] font-bold text-slate-400">${exp.category} • ${exp.date}</p></div>
                            <p class="font-black text-red-500">-$${exp.amountUSD.toFixed(2)}</p>
                        </div>
                    `).join('')}
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

// View: Reports
function renderReports() {
    const view = document.getElementById('view-reports');
    // Stats simplificados para la demo
    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24 text-left">
            ${renderHeader('Reportes JASA Analytics')}
            <main class="px-4 space-y-4">
                <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Rendimiento Mensual</h3>
                        <div class="bg-slate-50 dark:bg-slate-700 p-1 rounded-full flex"><button class="px-3 py-1 bg-white dark:bg-slate-600 rounded-full text-[9px] font-black">VENTAS</button><button class="px-3 py-1 text-[9px] font-bold text-slate-400">METAS</button></div>
                    </div>
                    
                    <!-- Mock Chart Bar -->
                    <div class="flex items-end justify-between gap-2 h-32 mb-4">
                        <div class="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg h-[40%]"></div>
                        <div class="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg h-[65%]"></div>
                        <div class="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg h-[30%]"></div>
                        <div class="flex-1 bg-primary/20 rounded-lg h-[85%] border-b-4 border-primary"></div>
                        <div class="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg h-[55%]"></div>
                        <div class="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg h-[20%]"></div>
                    </div>
                    <div class="flex justify-between text-[8px] font-bold text-slate-400 uppercase px-1"><span>Lunes</span><span>Mar</span><span>Mie</span><span class="text-primary font-black">HOY</span><span>Vie</span><span>Sab</span></div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 text-left">
                        <p class="text-[9px] font-black text-slate-400 uppercase">Margen Ganancia</p>
                        <p class="text-xl font-black text-emerald-600">32.4%</p>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 text-left">
                        <p class="text-[9px] font-black text-slate-400 uppercase">Productos Top</p>
                        <p class="text-xl font-black">12 Uni</p>
                    </div>
                </div>
            </main>
            ${renderNav()}
        </div>
    `;
}

// View: Debts (Fiados)
function renderDebts() {
    const view = document.getElementById('view-debts');
    const totalPendiente = state.debts.reduce((a, b) => a + b.amount, 0);

    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24 text-left">
            ${renderHeader('Gestión de Fiados')}
            <main class="px-4 space-y-4">
                <div class="bg-red-500 p-6 rounded-[40px] text-white shadow-2xl shadow-red-500/20">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Monto Total en la Calle</p>
                    <div class="flex items-baseline justify-between">
                        <h2 class="text-3xl font-black">$${totalPendiente.toFixed(2)}</h2>
                        <span class="text-xs font-bold opacity-80">Bs ${(totalPendiente * state.exchangeRate).toLocaleString()}</span>
                    </div>
                </div>

                <div class="space-y-3">
                    ${state.debts.map(d => `
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                            <div class="text-left">
                                <h4 class="font-bold text-sm">${d.customer}</h4>
                                <div class="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span class="material-symbols-outlined text-[12px]">schedule</span> ${d.date}</div>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                <span class="text-lg font-black text-red-500 leading-none">$${d.amount.toFixed(2)}</span>
                                <div class="flex gap-2 mt-2">
                                     <button onclick="shareReceipt('${d.id}')" class="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><span class="material-symbols-outlined text-[16px]">share</span></button>
                                     <button class="px-3 py-2 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase tracking-widest">Abonar</button>
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

// View: Settings (Tasa BCV)
function renderSettings() {
    const view = document.getElementById('view-settings');
    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24 text-left">
            <header class="p-4 flex items-center gap-3">
                <button onclick="navigateTo('view-dashboard')" class="p-2"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-xl font-bold">Configuración</h2>
            </header>
            <main class="px-4 space-y-6">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl space-y-4">
                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Ajuste de Tasa Cambiaria</h3>
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                        <div><p class="font-bold text-sm">Actualización Automática</p><p class="text-[10px] text-slate-500">Busca en tiempo real la tasa BCV</p></div>
                        <div onclick="toggleRateMode()" class="w-12 h-6 rounded-full relative transition-colors cursor-pointer ${state.rateMode === 'auto' ? 'bg-primary' : 'bg-slate-300'}">
                            <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.rateMode === 'auto' ? 'left-7' : 'left-1'}"></div>
                        </div>
                    </div>

                    ${state.rateMode === 'manual' ? `
                        <div class="animate-fadeIn">
                             <label class="text-[9px] font-black text-slate-400 mb-1 block uppercase">Tasa Manual (Bs/$)</label>
                             <input type="number" step="0.01" value="${state.exchangeRate}" onchange="updateManualRate(this.value)" class="w-full bg-slate-50 border-none rounded-xl py-4 px-4 font-black text-xl text-primary">
                        </div>
                    ` : `
                        <p class="text-[10px] font-bold text-slate-400 italic">Conectado a fuente oficial BCV. Última actualización: Hoy 9:00 AM</p>
                    `}
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl space-y-2">
                    <h3 class="text-xs font-black text-slate-400 uppercase mb-4">Datos del Negocio</h3>
                    <div class="space-y-1">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Propietario</p>
                        <p class="font-black">${state.ownerName}</p>
                    </div>
                </div>

                <button onclick="localStorage.clear(); location.reload();" class="text-red-500 font-bold text-xs p-4 opacity-50">Resetear App CUADRA</button>
            </main>
        </div>
    `;
}

// View: Scanner
function renderScanner() {
    const view = document.getElementById('view-scanner');
    view.innerHTML = `
        <div class="bg-black h-full flex flex-col items-center justify-center relative">
            <div class="absolute inset-0 opacity-20 bg-gradient-to-b from-primary via-transparent to-primary"></div>
            <div class="w-72 h-72 border-2 border-primary rounded-[50px] relative overflow-hidden mb-12 shadow-[0_0_80px_rgba(228,78,161,0.3)]">
                <div class="absolute inset-x-0 h-1 bg-primary shadow-[0_0_15px_pink] animate-scanline"></div>
                <div class="absolute inset-0 border-[1.5px] border-white/10 rounded-[48px]"></div>
            </div>
            
            <div class="text-center px-10 space-y-2 mb-10">
                <h3 class="text-white font-black text-xl tracking-tight uppercase">Buscando Producto</h3>
                <p class="text-white/40 text-xs font-bold leading-relaxed px-4">Ubique el código de barras dentro del marco para identificar el producto automáticamente.</p>
            </div>

            <button onclick="simulateScan()" class="bg-white text-black px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                Capturar (Simulado)
            </button>
            <button onclick="navigateTo('view-dashboard')" class="absolute top-10 left-6 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg"><span class="material-symbols-outlined text-white">close</span></button>
        </div>
    `;
}

// View: Cierre de Caja
function renderClosure() {
    const view = document.getElementById('view-closure');
    const todayTrans = state.transactions.filter(t => t.date.includes('Hoy') || t.date === 'Ahora');
    const totalUSD = todayTrans.filter(t => t.type === 'venta').reduce((a, b) => a + b.amountUSD, 0);
    const totalGastos = todayTrans.filter(t => t.type === 'gasto').reduce((a, b) => a + Math.abs(b.amountUSD), 0);
    const neta = totalUSD - totalGastos;

    view.innerHTML = `
        <div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24 text-left">
            <header class="p-4 flex items-center gap-3">
                <button onclick="navigateTo('view-dashboard')" class="p-2"><span class="material-symbols-outlined">arrow_back</span></button>
                <h2 class="text-xl font-bold">Cierre de Caja Diario</h2>
            </header>
            <main class="px-4 space-y-4">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl space-y-6">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumen Total</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div><p class="text-[9px] font-bold text-slate-400">Ventas (USD)</p><p class="text-lg font-black text-emerald-600">$${totalUSD.toFixed(2)}</p></div>
                            <div><p class="text-[9px] font-bold text-slate-400">Gastos (USD)</p><p class="text-lg font-black text-red-500">$${totalGastos.toFixed(2)}</p></div>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t dark:border-slate-700">
                        <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Desglose por Método</p>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm font-bold"><span class="text-slate-500">Efectivo</span><span>$${(totalUSD * 0.4).toFixed(2)}</span></div>
                            <div class="flex justify-between text-sm font-bold"><span class="text-slate-500">Pago Móvil</span><span>$${(totalUSD * 0.6).toFixed(2)}</span></div>
                        </div>
                    </div>

                    <div class="p-4 bg-primary text-white rounded-2xl flex justify-between items-center shadow-lg shadow-primary/20">
                        <div><p class="text-[10px] font-black uppercase tracking-widest opacity-70">Ganancia Neta</p><p class="text-2xl font-black">$${neta.toFixed(2)}</p></div>
                        <span class="material-symbols-outlined !text-3xl">verified</span>
                    </div>
                </div>

                <button onclick="alert('Caja cerrada con éxito. ¡Buen descanso, JASA!'); location.reload();" class="w-full bg-slate-900 dark:bg-slate-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-4">Confirmar y Cerrar Jornada</button>
            </main>
        </div>
    `;
}

// Logic Functions
function addToCart(id) {
    const product = state.inventory.find(i => i.id === id);
    const existing = state.cart.find(i => i.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }
    saveState();
    alert(`¡${product.name} añadido!`);
}

function updateCartItem(id, change) {
    const item = state.cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) state.cart = state.cart.filter(i => i.id !== id);
    }
    saveState();
    renderSales();
}

function clearCart() {
    state.cart = [];
    saveState();
    renderSales();
}

function checkout(method) {
    if (state.cart.length === 0) return;
    const total = state.cart.reduce((a, b) => a + (b.priceUSD * b.quantity), 0);

    if (method === 'Fiado') {
        alert('Asigne este monto a un cliente en el módulo de Fiados.');
        // Lógica real: Abrir selector de clientes
        navigateTo('view-debts');
        return;
    }

    const t = {
        id: '#' + Math.floor(1000 + Math.random() * 8999),
        date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amountUSD: total,
        amountBs: total * state.exchangeRate,
        type: 'venta',
        method: method
    };

    // Reducir stock
    state.cart.forEach(c => {
        const p = state.inventory.find(i => i.id === c.id);
        if (p && p.stock !== Infinity) p.stock -= c.quantity;
    });

    state.transactions.unshift(t);
    state.cart = [];
    saveState();
    alert('Venta procesada con éxito por JASA ✅');
    navigateTo('view-dashboard');
}

function addExpense() {
    const concept = document.getElementById('exp-concept').value;
    const amount = parseFloat(document.getElementById('exp-amount').value);
    const cat = document.getElementById('exp-cat').value;

    if (!concept || isNaN(amount)) return;

    const exp = {
        id: '#' + Math.floor(Math.random() * 999),
        date: 'Hoy',
        amountUSD: -amount,
        type: 'gasto',
        category: cat,
        idRef: concept
    };

    state.transactions.unshift({ ...exp, id: concept });
    state.expenses.unshift({ concept, category: cat, amountUSD: amount, date: 'Hoy' });

    saveState();
    renderExpenses();
    alert('Gasto registrado');
}

function toggleRateMode() {
    state.rateMode = state.rateMode === 'auto' ? 'manual' : 'auto';
    saveState();
    renderSettings();
}

function updateManualRate(val) {
    state.exchangeRate = parseFloat(val);
    saveState();
}

function shareReceipt(debtId) {
    const debt = state.debts.find(d => d.id === debtId);
    const text = `*COMPROBANTE DE ABONO JASA*\n\nCUADRA informa:\n\n*Cliente:* ${debt.customer}\n*Deuda Actual:* $${debt.amount.toFixed(2)}\n*Tasa BCV:* Bs ${state.exchangeRate}\n\nCreado por JASA 🚀`;
    const url = `https://wa.me/${debt.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function simulateScan() {
    const product = state.inventory[Math.floor(Math.random() * state.inventory.length)];
    const existing = state.cart.find(i => i.id === product.id);
    if (existing) existing.quantity++;
    else state.cart.push({ ...product, quantity: 1 });
    saveState();
    navigateTo('view-sales');
}

// Entry Point
window.onload = () => {
    if (state.currentView !== 'view-onboarding') {
        renderCurrentView();
    }
};

window.navigateTo = navigateTo;
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.clearCart = clearCart;
window.checkout = checkout;
window.addExpense = addExpense;
window.toggleRateMode = toggleRateMode;
window.updateManualRate = updateManualRate;
window.shareReceipt = shareReceipt;
window.simulateScan = simulateScan;

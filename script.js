// script.js
const rutinas = [
    { nombre: 'Rutina A: Fuerza Base', color: 'bg-emerald-100 text-emerald-800', ej: ['Sentadilla a silla (12 reps)', 'Flexiones en pared (10 reps)', 'Marcha estática (45 seg)', 'Extensiones pierna (15/lado)', 'Remo de pie (15 reps)'] },
    { nombre: 'Rutina B: Brazos y Abdomen', color: 'bg-teal-100 text-teal-800', ej: ['Prensa de pared (12 reps)', '"Caja" sentada (45 seg)', 'Apertura cadera (10/lado)', 'Elevación talones (15 reps)', 'El "Pájaro" (15 reps)'] },
    { nombre: 'Rutina C: Equilibrio', color: 'bg-green-100 text-green-800', ej: ['El "Flamenco" (10 seg/lado)', 'Paso de "Gigante" (12 reps)', 'Toques hombro pared (15 reps)', 'Caminata Talón-Punta (10 pasos)', 'Círculos brazos (30 seg)'] },
    { nombre: 'Rutina D: Postura y Espalda', color: 'bg-lime-100 text-lime-800', ej: ['Nado en seco (15 reps)', 'Giro de tronco sentado (10/lado)', 'Extensión de gato pared (12 reps)', 'Elevación rodilla c/aplauso (12 reps)'] },
    { nombre: 'Rutina E: Cardio Suave', color: 'bg-emerald-50 text-emerald-900', ej: ['Pasos de boxeador (50 seg)', 'La "V" con los pies (40 seg)', 'Limpiaparabrisas pie (15/lado)', 'Caminata braceo alto (45 seg)'] }
];

let db = JSON.parse(localStorage.getItem('belleVitaDB_v4')) || {
    clientes: [{ id: Date.now(), nombre: 'Cliente de Prueba', historial: [], activo: true }],
    clienteActivoId: null
};

if (!db.clienteActivoId && db.clientes.length > 0) db.clienteActivoId = db.clientes[0].id;

function guardarDB() { localStorage.setItem('belleVitaDB_v4', JSON.stringify(db)); }

function cargarSelectClientes() {
    const select = document.getElementById('selectCliente');
    select.innerHTML = '';
    const ordenados = [...db.clientes].sort((a, b) => b.activo - a.activo);
    ordenados.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.text = c.activo ? c.nombre : `⏸ ${c.nombre}`;
        if(c.id === db.clienteActivoId) option.selected = true;
        select.appendChild(option);
    });
}

function alternarEstadoCliente() {
    const cliente = db.clientes.find(c => c.id === db.clienteActivoId);
    if(cliente) {
        cliente.activo = !cliente.activo;
        guardarDB();
        cargarSelectClientes();
        actualizarInterfazEstado();
    }
}

function actualizarInterfazEstado() {
    const cliente = db.clientes.find(c => c.id === db.clienteActivoId);
    const btn = document.getElementById('btnEstado');
    const form = document.getElementById('formMedicion');
    const msg = document.getElementById('msgEstado');

    if(cliente.activo) {
        btn.innerText = "Activo";
        btn.className = "text-[10px] px-3 py-1 rounded-full font-bold border border-emerald-500 text-emerald-600 bg-emerald-50";
        form.classList.remove('hidden');
        msg.innerText = "Historial de progreso";
    } else {
        btn.innerText = "Inactivo";
        btn.className = "text-[10px] px-3 py-1 rounded-full font-bold border border-slate-300 text-slate-400 bg-slate-50";
        form.classList.add('hidden');
        msg.innerText = "Cliente Inactivo (Modo Lectura)";
    }
}

function agregarCliente() {
    const nombre = prompt("Nombre del nuevo cliente:");
    if(nombre) {
        const nuevo = { id: Date.now(), nombre: nombre.trim(), historial: [], activo: true };
        db.clientes.push(nuevo);
        db.clienteActivoId = nuevo.id;
        guardarDB();
        cargarSelectClientes();
        cargarProgreso();
        actualizarInterfazEstado();
    }
}

function cambiarCliente() {
    db.clienteActivoId = parseInt(document.getElementById('selectCliente').value);
    guardarDB();
    cargarProgreso();
    actualizarInterfazEstado();
}

function cargarRutinas() {
    const cont = document.getElementById('contenedorRutinas');
    cont.innerHTML = '';
    rutinas.forEach(r => {
        cont.innerHTML += `<div class="bg-white rounded-2xl overflow-hidden border border-menta shadow-sm">
            <div class="${r.color} px-4 py-2 font-bold text-sm uppercase tracking-wider border-b border-menta">${r.nombre}</div>
            <ul class="p-4 space-y-2 text-sm text-slate-600">
                ${r.ej.map(e => `<li class="flex items-center gap-2"><span class="text-menta-fuerte">✔</span> ${e}</li>`).join('')}
            </ul></div>`;
    });
}

function cargarProgreso() {
    const cliente = db.clientes.find(c => c.id === db.clienteActivoId);
    const cont = document.getElementById('historialEvaluaciones');
    cont.innerHTML = '';
    if(!cliente || cliente.historial.length === 0) {
        cont.innerHTML = '<div class="p-8 text-center text-slate-400 text-sm italic">No hay mediciones registradas.</div>';
        return;
    }
    cliente.historial.forEach(h => {
        cont.innerHTML += `
        <div class="p-4 hover:bg-menta/10 transition-all">
            <div class="flex justify-between items-center mb-3">
                <span class="text-hoja font-bold text-xs">${h.fecha}</span>
                <span class="text-xl font-bold text-hoja">${h.peso} <span class="text-xs font-normal text-slate-400 uppercase">kg</span></span>
            </div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-slate-500 bg-beige-claro/50 p-3 rounded-xl border border-menta/30">
                <div class="flex justify-between"><span>Grasa:</span> <span class="text-hoja font-bold">${h.grasa}%</span></div>
                <div class="flex justify-between"><span>Músculo:</span> <span class="text-hoja font-bold">${h.musculo}%</span></div>
                <div class="flex justify-between"><span>Visceral:</span> <span class="text-hoja font-bold">${h.visceral}</span></div>
                <div class="flex justify-between"><span>Edad Bio:</span> <span class="text-hoja font-bold">${h.edad}</span></div>
            </div>
        </div>`;
    });
}

function guardarMedicion() {
    const peso = document.getElementById('inpPeso').value;
    if(!peso) { alert("Ingresa el peso para guardar."); return; }
    const cliente = db.clientes.find(c => c.id === db.clienteActivoId);
    cliente.historial.unshift({
        fecha: new Date().toLocaleDateString(),
        peso: parseFloat(peso),
        cintura: document.getElementById('inpCintura').value || '-',
        imc: document.getElementById('inpIMC').value || '-',
        grasa: document.getElementById('inpGrasa').value || '-',
        musculo: document.getElementById('inpMusculo').value || '-',
        visceral: document.getElementById('inpVisceral').value || '-',
        metabolismo: document.getElementById('inpMetabolismo').value || '-',
        edad: document.getElementById('inpEdad').value || '-'
    });
    guardarDB();
    document.querySelectorAll('input').forEach(i => i.value = '');
    cargarProgreso();
}

function cambiarPestana(p) {
    document.getElementById('secRutinas').classList.toggle('hidden', p !== 'rutinas');
    document.getElementById('secProgreso').classList.toggle('hidden', p !== 'progreso');
    
    // Cambiar colores de iconos de navegación
    const navR = document.getElementById('navRutinas');
    const navP = document.getElementById('navProgreso');
    
    if(p === 'rutinas') {
        navR.classList.replace('text-slate-400', 'text-menta-fuerte');
        navP.classList.replace('text-menta-fuerte', 'text-slate-400');
    } else {
        navP.classList.replace('text-slate-400', 'text-menta-fuerte');
        navR.classList.replace('text-menta-fuerte', 'text-slate-400');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSelectClientes();
    cargarRutinas();
    cargarProgreso();
    actualizarInterfazEstado();
});

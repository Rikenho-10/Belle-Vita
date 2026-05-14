const rutinas = [
    { nombre: 'Rutina A: Fuerza Base', color: 'bg-blue-600', ej: ['Sentadilla a silla (12 reps)', 'Flexiones en pared (10 reps)', 'Marcha estática (45 seg)', 'Extensiones pierna (15/lado)', 'Remo de pie (15 reps)'] },
    { nombre: 'Rutina B: Brazos y Abdomen', color: 'bg-blue-500', ej: ['Prensa de pared (12 reps)', '"Caja" sentada (45 seg)', 'Apertura cadera (10/lado)', 'Elevación talones (15 reps)', 'El "Pájaro" (15 reps)'] },
    { nombre: 'Rutina C: Equilibrio', color: 'bg-teal-600', ej: ['El "Flamenco" (10 seg/lado)', 'Paso de "Gigante" (12 reps)', 'Toques hombro pared (15 reps)', 'Caminata Talón-Punta (10 pasos)', 'Círculos brazos (30 seg)'] },
    { nombre: 'Rutina D: Postura y Espalda', color: 'bg-purple-600', ej: ['Nado en seco (15 reps)', 'Giro de tronco sentado (10/lado)', 'Extensión de gato pared (12 reps)', 'Elevación rodilla c/aplauso (12 reps)'] },
    { nombre: 'Rutina E: Cardio Suave', color: 'bg-red-600', ej: ['Pasos de boxeador (50 seg)', 'La "V" con los pies (40 seg)', 'Limpiaparabrisas pie (15/lado)', 'Caminata braceo alto (45 seg)'] }
];

let db = JSON.parse(localStorage.getItem('belleVitaDB_v4')) || {
    clientes: [{ id: Date.now(), nombre: 'Cliente Inicial', historial: [], activo: true }],
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
        option.text = c.activo ? c.nombre : `❌ ${c.nombre}`;
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
        btn.className = "text-xs px-3 py-1 rounded-full font-bold border border-green-500 text-green-500";
        form.classList.remove('hidden');
        msg.innerText = "Historial de Evaluaciones";
    } else {
        btn.innerText = "Inactivo";
        btn.className = "text-xs px-3 py-1 rounded-full font-bold border border-red-500 text-red-500";
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
        cont.innerHTML += `<div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md">
            <div class="${r.color} px-4 py-2 font-bold text-white">${r.nombre}</div>
            <ul class="p-4 space-y-2 text-sm text-slate-300">
                ${r.ej.map(e => `<li><span class="text-yellow-500 font-bold">•</span> ${e}</li>`).join('')}
            </ul></div>`;
    });
}

function cargarProgreso() {
    const cliente = db.clientes.find(c => c.id === db.clienteActivoId);
    const cont = document.getElementById('historialEvaluaciones');
    cont.innerHTML = '';
    if(!cliente || cliente.historial.length === 0) {
        cont.innerHTML = '<div class="p-4 text-center text-slate-500 text-sm italic">Sin registros para este cliente.</div>';
        return;
    }
    cliente.historial.forEach(h => {
        cont.innerHTML += `
        <div class="p-4 hover-bg-slate-750 transition-all">
            <div class="flex justify-between items-center mb-2">
                <span class="text-yellow-500 font-bold">${h.fecha}</span>
                <span class="text-xl font-bold text-white">${h.peso} <span class="text-xs font-normal text-slate-400">kg</span></span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-700/50">
                <div class="flex justify-between"><span>Grasa:</span> <span class="text-white">${h.grasa}%</span></div>
                <div class="flex justify-between"><span>Músculo:</span> <span class="text-white">${h.musculo}%</span></div>
                <div class="flex justify-between"><span>Visceral:</span> <span class="text-white">${h.visceral}</span></div>
                <div class="flex justify-between"><span>Edad B:</span> <span class="text-white">${h.edad}</span></div>
            </div>
        </div>`;
    });
}

function guardarMedicion() {
    const peso = document.getElementById('inpPeso').value;
    if(!peso) return;
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
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSelectClientes();
    cargarRutinas();
    cargarProgreso();
    actualizarInterfazEstado();
});

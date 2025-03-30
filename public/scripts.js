/* Prison DBMS - scripts.js */

// ========== Connection Status ==========
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    try {
        const response = await fetch('/check-db-connection');
        const text = await response.text();
        statusElem.textContent = text;
    } catch (err) {
        statusElem.textContent = 'connection timed out';
    } finally {
        loadingGifElem.style.display = 'none';
        statusElem.style.display = 'inline';
    }
}

// ========== Inmate Management ==========
async function initDatabase() {
    const res = await fetch('/init-db', { method: 'POST' });
    const data = await res.json();
    alert(data.success ? '✅ Database initialized successfully!' : '❌ Database initialization failed!');
}

async function fetchInmates() {
    try {
        const response = await fetch('/inmates');
        const { success, data } = await response.json();
        if (!success) throw new Error();

        const tableBody = document.querySelector('#inmateTable tbody');
        tableBody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to fetch inmates');
    }
}

async function addInmate(event) {
    event.preventDefault();

    const inmateId = document.getElementById('inmateId').value;
    const holdingCell = document.getElementById('holdingCell').value;
    const healthNum = document.getElementById('healthNum').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const res = await fetch('/add-inmate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inmateId, holdingCell, healthNum, startDate, endDate })
    });

    const data = await res.json();
    const msgElem = document.getElementById('inmateFormMsg');
    msgElem.textContent = data.success ? 'Inmate added successfully!' : 'Error adding inmate';
    if (data.success) fetchInmates();
}

async function loadUpcomingReleases() {
    const response = await fetch('/inmates-leaving-soon');
    const data = await response.json();

    const tbody = document.getElementById('releaseTable').querySelector('tbody');
    tbody.innerHTML = '';

    if (data.success && data.data.length > 0) {
        data.data.forEach(inmate => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = inmate.INMATEID;
            row.insertCell(1).textContent = inmate.HOLDINGCELL;
            row.insertCell(2).textContent = inmate.HEALTHNUM;
            row.insertCell(3).textContent = new Date(inmate.STARTDATE).toLocaleDateString();
            row.insertCell(4).textContent = new Date(inmate.ENDDATE).toLocaleDateString();
        });
    } else {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = 'No inmates releasing in the next 30 days.';
    }
}


// ========== Init Page ==========
window.onload = function () {
    checkDbConnection();
    fetchInmates();
    loadUpcomingReleases();
    document.getElementById('inmateForm').addEventListener('submit', addInmate);
};

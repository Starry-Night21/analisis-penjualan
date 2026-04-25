const fileInput = document.getElementById('fileInput');
const tableBody = document.querySelector('#dataTable tbody');
const insightText = document.getElementById('insightText');

let chart; 
let totalChart;

fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data;

            tampilkanTabel(data);

            const hasil = prosesData(data);
            buatChart(hasil);
            buatTotalChart(data);
            tampilkanInsight(hasil);
        }
    });
});

function tampilkanTabel(data) {
    tableBody.innerHTML = "";

    data.forEach(row => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${row.Tanggal}</td>
            <td>${row.Produk}</td>
            <td>${row.Kategori}</td>
            <td>${row.Harga}</td>
            <td>${row.Jumlah}</td>
        `;

        tableBody.appendChild(tr);
    });
};

function prosesData(data) {
    let totalPenjualan = 0;
    let perKategori = {};

    data.forEach(row => {
        const harga = parseFloat(row.Harga);
        const jumlah = parseFloat(row.Jumlah);
        const kategori = row.Kategori;
        const total = harga * jumlah;
        totalPenjualan += total;

        if (!perKategori[kategori]) {
            perKategori[kategori] = 0;
        }
        perKategori[kategori] += total;
    });

    return {
        totalPenjualan,
        perKategori
    };
};

function prosesPerTanggal(data) {
    let perTanggal = {};
    
    data.forEach(row => {
        const tanggal = row.Tanggal;
        const harga = Number(row.Harga);
        const jumlah = Number(row.Jumlah);

        if (!tanggal) return;
        if (isNaN(harga) || isNaN(jumlah)) return;
        
        const total = harga * jumlah;
        
        if (!perTanggal[tanggal]) {
            perTanggal[tanggal] = 0;
        }
        perTanggal[tanggal] += total;
    });
    return perTanggal;
};

function tampilkanInsight(hasil) {
    let maxKategori = "";
    let maxValue = 0;

    for (let kategori in hasil.perKategori) {
        if (hasil.perKategori[kategori] > maxValue) {
            maxValue = hasil.perKategori[kategori];
            maxKategori = kategori;
        }
    }

    insightText.innerHTML =
    // `Kategori ${maxKategori} memiliki penjualan tertinggi dengan total Rp ${maxValue.toLocaleString()}`;
    `Kategori ${maxKategori} tertinggi dengan total Rp ${maxValue.toLocaleString()}. Total seluruh penjualan Rp ${hasil.totalPenjualan.toLocaleString()}`;
};

function buatChart(hasil) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    const labels = Object.keys(hasil.perKategori);
    const data = Object.values(hasil.perKategori);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan per Kategori',
                data: data
            }]
        }
    });
};

function buatTotalChart(data) {
    const canvas = document.getElementById('totalChart');
    const ctx = canvas.getContext('2d');
    const perTanggal = prosesPerTanggal(data);
    const labels = Object.keys(perTanggal).sort();
    const values = labels.map(t => perTanggal[t]);
    
    if (totalChart) {
        totalChart.destroy();
    }

    totalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan Harian',
                data: values,
                tension: 0.3
            }]
        }
    });
};
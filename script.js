function filterTable() {
    const category = document.getElementById("category").value;
    const rows = document.querySelectorAll("#medicineTable tbody tr");

    rows.forEach(row => {
        if (category === "All" || row.dataset.category === category) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function searchTable() {
    const query = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#medicineTable tbody tr");

    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        if (name.includes(query)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

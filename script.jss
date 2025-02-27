document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf;

    // DOM Elements
    const addPaymentButton = document.getElementById("addPayment");
    const paymentList = document.getElementById("paymentList");
    const totalAmountField = document.getElementById("totalAmount");
    const generateReportButton = document.getElementById("generateReport");
    const generateReceiptButton = document.getElementById("generateReceipt");

    // Ensure buttons exist before adding event listeners
    if (!addPaymentButton || !generateReportButton || !generateReceiptButton) {
        console.error("One or more buttons are missing!");
        return;
    }

    // Function to add a new payment item
    function addPaymentItem() {
        const paymentItem = document.createElement("div");
        paymentItem.classList.add("paymentItem");
        paymentItem.innerHTML = `
            <input type="text" class="itemName" placeholder="Nama Item" required>
            <input type="number" class="itemAmount" placeholder="Jumlah (RM)" required>
            <button type="button" class="removeItem">X</button>
        `;

        // Append to payment list
        paymentList.appendChild(paymentItem);

        // Attach event listeners
        paymentItem.querySelector(".itemAmount").addEventListener("input", updateTotal);
        paymentItem.querySelector(".removeItem").addEventListener("click", () => {
            paymentItem.remove();
            updateTotal();
        });

        updateTotal();
    }

    // Event Listener for "Tambah Pembayaran"
    addPaymentButton.addEventListener("click", addPaymentItem);

    // Function to update total amount
    function updateTotal() {
        let total = 0;
        document.querySelectorAll(".itemAmount").forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        totalAmountField.value = total.toFixed(2);
    }

    // Function to generate PDF (Laporan or Resit)
    function generatePDF(type) {
        if (!window.jsPDF) {
            console.error("jsPDF not loaded!");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // SK Stalon Branding
        const primaryColor = '#2c3e50';
        const accentColor = '#e74c3c';
        const logoUrl = 'https://media-hosting.imagekit.io//bf19f74e678d4efa/LOGO%2520SK%2520STALON%2520ENHANCED%2520NEW.png';

        // Header Section
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.addImage(logoUrl, 'PNG', 20, 8, 25, 25);

        // School Title
        doc.setFontSize(22);
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.text("SEKOLAH KEBANGSAAN STALON", pageWidth / 2, 25, null, null, 'center');
        doc.setFontSize(12);
        doc.text("SUNGAI STALON, 96150 BELAWAI, SARAWAK", pageWidth / 2, 32, null, null, 'center');

        // Main Content Box
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.5);
        doc.rect(15, 50, pageWidth - 30, 200);

        // Document Title
        doc.setFontSize(18);
        doc.setTextColor(primaryColor);
        doc.text(`${type.toUpperCase()}`, pageWidth / 2, 70, null, null, 'center');

        // Payer Information
        let y = 90;
        doc.setFontSize(12);
        doc.setTextColor(0);

        doc.text("Bayaran Diterima Dari:", 25, y);
        doc.setFont("helvetica", "bold");
        doc.text(document.getElementById("payerName")?.value || "N/A", 25, y + 8);

        doc.setFont("helvetica", "normal");
        doc.text("Tarikh Transaksi:", pageWidth - 65, y);
        doc.setFont("helvetica", "bold");
        const transactionDate = document.getElementById("transactionDate")?.value;
        doc.text(transactionDate ? transactionDate.split("-").reverse().join("/") : "N/A", pageWidth - 65, y + 8);

        y += 30;

        // Payment Items Table Header
        doc.setFillColor(primaryColor);
        doc.rect(25, y, pageWidth - 50, 10, 'F');
        doc.setTextColor(255);
        doc.text("Bil", 30, y + 7);
        doc.text("Perkara", 60, y + 7);
        doc.text("Amaun (RM)", pageWidth - 45, y + 7);

        y += 15;
        let index = 1;

        // Table Rows
        doc.setTextColor(0);
        document.querySelectorAll(".paymentItem").forEach(item => {
            const itemName = item.querySelector(".itemName").value || "Item Tidak Dinyatakan";
            const itemAmount = parseFloat(item.querySelector(".itemAmount").value) || 0;

            doc.text(index.toString(), 30, y);
            doc.text(itemName, 60, y);
            doc.text(itemAmount.toFixed(2), pageWidth - 45, y, null, null, 'right');

            doc.setLineWidth(0.1);
            doc.setDrawColor(200);
            doc.line(25, y + 4, pageWidth - 25, y + 4);

            y += 10;
            index++;
        });

        // Total Amount
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor);
        doc.text("JUMLAH KESELURUHAN:", 25, y);
        doc.text(`RM${totalAmountField.value}`, pageWidth - 25, y, null, null, 'right');

        // Receiver Section
        y += 25;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("Tandatangan Penerima:", 25, y);
        doc.line(25, y + 5, 80, y + 5);
        doc.text("Nama: " + (document.getElementById("receivedBy")?.value || "N/A"), 25, y + 10);

        // Security Stamp
        doc.setFontSize(40);
        doc.setTextColor(200);
        doc.setFont("helvetica", "bold");
        doc.text("SAH", pageWidth / 2, 200, null, null, 'center', 45);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("© Sekolah Kebangsaan Stalon - Dokumen Sah Secara Digital",
            pageWidth / 2, 280, null, null, 'center');

        doc.save(`${type}_SK_STALON_${new Date().getTime()}.pdf`);
    }

    // Ensure buttons exist before adding event listeners
    generateReportButton.addEventListener("click", () => generatePDF("Laporan"));
    generateReceiptButton.addEventListener("click", () => generatePDF("Resit"));
});

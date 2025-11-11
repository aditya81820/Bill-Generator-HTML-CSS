Handlebars.registerHelper('formatCurrency', function(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    return value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
});

Handlebars.registerHelper('formatDate', function(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
});


const sampleData = {
    companyName: "RV ENTERPRISES",
    companyAddress: "221 DDA Building, Laxmi Nagar, New Market Area",
    companyCityState: "New Delhi - 110092",
    companyPhone: "+91 98765432210",
    companyEmail: "support@goyalmart.com",
    companyGSTIN: "07CZCPS9257G1ZA",
    companyState: "New Delhi",
    companyStateCode: "09",
    invoiceNumber: "EDTOQ0912829",
    invoiceDate: "2024-10-17",
    paymentMethod: "NEFT/ RTGS",
    dueAmount: 192932.00,
    paymentDueDate: "2024-10-29",
    poRefNumber: "EDTOQ0912829",
    vehicleNumber: "UP 16 AX 6904",
    transporter: "Suhana Safar Travel",
    ewayBillNumber: "EDTOQ0912829121",
    placeOfSupply: "CM House Gorakhpur",
    billToName: "Shyam Construction Pvt Ltd",
    billToAddress: "Label, 221 DDA Building, Laxmi Nagar, Lajpat Nagar, East Delhi New Delhi - 110092",
    billToPhone: "0120 - 456789",
    billToGSTIN: "09CZCPS9257G1ZA",
    billToState: "New Delhi",
    billToStateCode: "09",
    shipToName: "Shyam Construction Pvt Ltd",
    shipToAddress: "Label, 221 DDA Building, Laxmi Nagar, Lajpat Nagar, East Delhi New Delhi - 110092",
    shipToPhone: "011 - 987654",
    shipToGSTIN: "09CZCPS9257G1ZA",
    shipToState: "New Delhi",
    shipToStateCode: "09",
    items: [
        {
            description: "UCB Water Bottle 600 ml, Blue",
            hsn: "0803",
            quantity: 1000,
            price: 883.00,
            taxRate: 18,
            taxableValue: 987.13
        },
        {
            description: "UCB Water Bottle 600 ml, Red",
            hsn: "0803",
            quantity: 500,
            price: 883.00,
            taxRate: 18,
            taxableValue: 493.57
        },
        {
            description: "Shipping Charges",
            hsn: "",
            quantity: "",
            price: 100.00,
            taxRate: 18,
            taxableValue: 100.00
        }
    ],
    netTaxableAmount: 1232.43,
    cgst: 120.00,
    sgst: 120.00,
    additionalDiscount: 100.00,
    roundOff: 0.43,
    totalAmount: 1372.00,
    taxDetails: [
        {
            rate: 5,
            taxableAmount: 10989.09,
            cgstRate: 2.5,
            cgstAmount: 450,
            sgstRate: 2.5,
            sgstAmount: 450,
            totalTax: 987.20
        },
        {
            rate: 12,
            taxableAmount: 8392.11,
            cgstRate: 9,
            cgstAmount: 920,
            sgstRate: 9,
            sgstAmount: 920,
            totalTax: 822.15
        },
        {
            rate: 18,
            taxableAmount: 8392.11,
            cgstRate: 9,
            cgstAmount: 920,
            sgstRate: 9,
            sgstAmount: 920,
            totalTax: 782.05
        },
        {
            rate: 28,
            taxableAmount: 8392.11,
            cgstRate: 9,
            cgstAmount: 920,
            sgstRate: 9,
            sgstAmount: 920,
            totalTax: 120.30
        }
    ],
    amountInWords: "Nine Thousand Nine Hundred Fifty Five Rupees only",
    bankName: "HDFC Bank",
    payee: "RV Enterprises",
    accountNumber: "1534883001203",
    ifscCode: "HDFC00002312",
    branch: "JHANDEWALAN BRANCH",
    termsConditions: "We do not accept return when product is sold"
};

function toNumber(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

function calculateTotals(data) {
    let netTaxableAmount = 0;
    let totalAmount = 0;
    
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            if (item.taxableValue !== undefined && item.taxableValue !== null && item.taxableValue !== "") {
                netTaxableAmount += toNumber(item.taxableValue);
            }
        });
    }
    
    totalAmount = netTaxableAmount + 
                    toNumber(data.cgst) + 
                    toNumber(data.sgst) - 
                    toNumber(data.additionalDiscount) + 
                    toNumber(data.roundOff);
    
 
    data.netTaxableAmount = netTaxableAmount;
    data.totalAmount = totalAmount;
    
    return data;
}

function renderInvoice(data) {
    const templateSource = document.getElementById('invoice-template').innerHTML;
    const template = Handlebars.compile(templateSource);
    const html = template(data);
    document.getElementById('invoiceContainer').innerHTML = html;
}

function populateForm(data) {
    const form = document.getElementById('invoiceForm');
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        }
    }
    
    const itemsContainer = document.getElementById('itemsContainer');
    while (itemsContainer.children.length > 1) {
        itemsContainer.removeChild(itemsContainer.lastChild);
    }

    if (data.items && data.items.length > 0) {
        data.items.forEach((item, index) => {
            addItemRow(item);
        });
    }
}

function getFormData() {
    const form = document.getElementById('invoiceForm');
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    data.items = [];
    const itemRows = form.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const qty = toNumber(row.querySelector('.item-quantity').value);
        const price = toNumber(row.querySelector('.item-price').value);
        const taxRate = toNumber(row.querySelector('.item-tax-rate').value);
        const item = {
            description: row.querySelector('.item-description').value,
            hsn: row.querySelector('.item-hsn').value,
            quantity: qty,
            price: price,
            taxRate: taxRate,
            taxableValue: qty * price
        };
        data.items.push(item);
    });
    
    return data;
}

function addItemRow(item = {}) {
    const itemsContainer = document.getElementById('itemsContainer');
    const row = document.createElement('div');
    row.className = 'items-form-row item-row';
    row.innerHTML = `
        <input type="text" class="item-description" value="${item.description || ''}" placeholder="Item Description">
        <input type="text" class="item-hsn" value="${item.hsn || ''}" placeholder="HSN">
        <input type="number" class="item-quantity" value="${item.quantity || ''}" placeholder="Qty">
        <input type="number" class="item-price" value="${item.price || ''}" placeholder="Price" step="0.01">
        <input type="number" class="item-tax-rate" value="${item.taxRate || ''}" placeholder="Tax %" step="0.01">
        <input type="number" class="item-taxable-value" value="${item.taxableValue || ''}" placeholder="Taxable Value" step="0.01">
        <button type="button" class="remove-item-btn danger">Remove</button>
    `;
    itemsContainer.appendChild(row);
    
    row.querySelector('.remove-item-btn').addEventListener('click', function() {
        row.remove();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    let currentData = calculateTotals(sampleData);
    renderInvoice(currentData);

    document.getElementById('showFormBtn').addEventListener('click', function() {
        document.getElementById('formModal').classList.remove('hidden');
        populateForm(currentData);
    });
    
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('formModal').classList.add('hidden');
    });
    
    document.getElementById('addItemBtn').addEventListener('click', function() {
        addItemRow();
    });
    
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = getFormData();
        currentData = calculateTotals(formData);
        renderInvoice(currentData);
        document.getElementById('formModal').classList.add('hidden');
    });
    
    document.getElementById('printBtn').addEventListener('click', function() {
        window.print();
    });
});
let products = [];
let sales = [];
let categories = [];
let paymentMethods = ["Pix", "Cartão", "Dinheiro"];

function updateCategoryOptions() {
    const select = document.getElementById('product-category');
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function updateSaleProductOptions() {
    const select = document.getElementById('sale-product');
    select.innerHTML = '';
    products.forEach(prod => {
        if (prod.stock > 0) {
            const option = document.createElement('option');
            option.value = prod.id;
            option.textContent = prod.name;
            select.appendChild(option);
        }
    });
}

function updatePaymentMethods() {
    const select = document.getElementById('payment-method');
    select.innerHTML = '';
    paymentMethods.forEach(pm => {
        const option = document.createElement('option');
        option.value = pm;
        option.textContent = pm;
        select.appendChild(option);
    });
}

function renderProducts() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    products.forEach(prod => {
        const tr = document.createElement('tr');
        tr.className = prod.stock < 5 ? 'low-stock' : '';
        tr.innerHTML = `
            <td>${prod.name}</td>
            <td>${prod.category}</td>
            <td>R$ ${prod.price.toFixed(2)}</td>
            <td>${prod.stock}</td>
            <td>
                <button onclick="editProduct('${prod.id}')">Editar</button>
                <button onclick="deleteProduct('${prod.id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderSales() {
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';
    sales.forEach((sale, index) => {
        const total = sale.price * sale.quantity * (1 - sale.discount / 100);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>${sale.discount}</td>
            <td>R$ ${total.toFixed(2)}</td>
            <td>${sale.paymentMethod}</td>
            <td><button onclick="cancelSale(${index})">Cancelar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('category-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('category-name').value.trim();
    if (name && !categories.includes(name)) {
        categories.push(name);
        document.getElementById('category-name').value = '';
        renderCategories();
        updateCategoryOptions();
        updateSaleProductOptions();
    }
});

function renderCategories() {
    const ul = document.getElementById('categories-list');
    ul.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat;
        ul.appendChild(li);
    });
}

document.getElementById('product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value, 10);
    if (id) {
        const prod = products.find(p => p.id === id);
        prod.name = name;
        prod.category = category;
        prod.price = price;
        prod.stock = stock;
    } else {
        products.push({
            id: Date.now().toString(),
            name, category, price, stock
        });
    }
    renderProducts();
    updateSaleProductOptions();
    this.reset();
    document.getElementById('product-id').value = '';
});

function editProduct(id) {
    const prod = products.find(p => p.id === id);
    if (prod) {
        document.getElementById('product-id').value = prod.id;
        document.getElementById('product-name').value = prod.name;
        document.getElementById('product-category').value = prod.category;
        document.getElementById('product-price').value = prod.price;
        document.getElementById('product-stock').value = prod.stock;
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    renderProducts();
    updateSaleProductOptions();
}

document.getElementById('sale-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const productId = document.getElementById('sale-product').value;
    const quantity = parseInt(document.getElementById('sale-quantity').value, 10);
    const discount = parseFloat(document.getElementById('sale-discount').value);
    const paymentMethod = document.getElementById('payment-method').value;
    const product = products.find(p => p.id === productId);
    if (product && quantity > 0 && product.stock >= quantity) {
        product.stock -= quantity;
        sales.push({
            productId,
            productName: product.name,
            quantity,
            discount,
            price: product.price,
            paymentMethod,
            date: new Date()
        });
        renderProducts();
        renderSales();
        updateSaleProductOptions();
        this.reset();
        document.getElementById('total-value').textContent = '0.00';
    } else {
        alert('Quantidade inválida ou estoque insuficiente.');
    }
});

function cancelSale(index) {
    const sale = sales[index];
    if (sale) {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            product.stock += sale.quantity;
        }
        sales.splice(index, 1);
        renderProducts();
        renderSales();
        updateSaleProductOptions();
    }
}

function updateTotal() {
    const productId = document.getElementById('sale-product').value;
    const quantity = parseInt(document.getElementById('sale-quantity').value, 10) || 0;
    const discount = parseFloat(document.getElementById('sale-discount').value) || 0;
    const product = products.find(p => p.id === productId);
    if (product) {
        const total = product.price * quantity * (1 - discount / 100);
        document.getElementById('total-value').textContent = total.toFixed(2);
    } else {
        document.getElementById('total-value').textContent = '0.00';
    }
}

document.getElementById('sale-product').addEventListener('change', updateTotal);
document.getElementById('sale-quantity').addEventListener('input', updateTotal);
document.getElementById('sale-discount').addEventListener('input', updateTotal);

function dailyReport() {
    const today = new Date().toDateString();
    const filtered = sales.filter(s => s.date.toDateString() === today);
    showReport(filtered, 'Relatório Diário');
}
function weeklyReport() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const filtered = sales.filter(s => s.date >= weekAgo);
    showReport(filtered, 'Relatório Semanal');
}
function monthlyReport() {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const filtered = sales.filter(s => s.date >= monthAgo);
    showReport(filtered, 'Relatório Mensal');
}
function showReport(data, title) {
    let html = `<h3>${title}</h3>`;
    if (data.length === 0) {
        html += '<p>Nenhuma venda encontrada.</p>';
    } else {
        html += '<table><thead><tr><th>Produto</th><th>Quantidade</th><th>Desconto (%)</th><th>Valor Total</th><th>Forma Pagamento</th><th>Data</th></tr></thead><tbody>';
        data.forEach(sale => {
            const total = sale.price * sale.quantity * (1 - sale.discount / 100);
            html += `<tr><td>${sale.productName}</td><td>${sale.quantity}</td><td>${sale.discount}</td><td>R$ ${total.toFixed(2)}</td><td>${sale.paymentMethod}</td><td>${sale.date.toLocaleDateString()}</td></tr>`;
        });
        html += '</tbody></table>';
    }
    document.getElementById('report-output').innerHTML = html;
}

document.getElementById('daily-report-btn').addEventListener('click', dailyReport);
document.getElementById('weekly-report-btn').addEventListener('click', weeklyReport);
document.getElementById('monthly-report-btn').addEventListener('click', monthlyReport);

// Inicializar
updateCategoryOptions();
updatePaymentMethods();

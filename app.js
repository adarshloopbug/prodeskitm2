// ====== STATE ======
let totalSalary = 0;
let expenses = [];
let currentCurrency = 'USD'; // Base currency
let exchangeRate = 1; // Multiplier from USD to target currency

// ====== DOM ELEMENTS ======
const salaryForm = document.getElementById('salaryForm');
const salaryInput = document.getElementById('salaryInput');
const expenseForm = document.getElementById('expenseForm');
const expenseNameInput = document.getElementById('expenseNameInput');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const expenseList = document.getElementById('expenseList');

const displaySalary = document.getElementById('displaySalary');
const displayExpenses = document.getElementById('displayExpenses');
const displayBalance = document.getElementById('displayBalance');
const balanceSection = document.getElementById('balanceSection');

const alertBanner = document.getElementById('alertBanner');
const errorBanner = document.getElementById('errorBanner');
const errorMsg = document.getElementById('errorMsg');

const toggleCurrencyBtn = document.getElementById('toggleCurrencyBtn');
const currencySymbolLabel = document.getElementById('currencySymbolLabel');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

const currencySymbols = document.querySelectorAll('.currency-symbol');

let expenseChartInstance = null;

// ====== INITIALIZATION ======
function init() {
    loadData();
    updateUI();
    setupEventListeners();
}

// ====== EVENT LISTENERS ======
function setupEventListeners() {
    salaryForm.addEventListener('submit', handleSalarySubmit);
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    expenseList.addEventListener('click', handleExpenseActions);
    toggleCurrencyBtn.addEventListener('click', toggleCurrency);
    downloadPdfBtn.addEventListener('click', generatePDF);
}

// ====== HANDLERS ======
function handleSalarySubmit(e) {
    e.preventDefault();
    const amount = parseFloat(salaryInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showError("Please enter a valid positive salary amount.");
        return;
    }
    
    totalSalary = amount / exchangeRate; // Store base value in USD (conceptually)
    hideError();
    salaryInput.value = '';
    saveData();
    updateUI();
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);
    
    if (!name || isNaN(amount) || amount <= 0) {
        showError("Please enter a valid expense name and positive amount.");
        return;
    }
    
    const expense = {
        id: Date.now().toString(),
        name,
        amount: amount / exchangeRate // Store base value
    };
    
    expenses.push(expense);
    hideError();
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    saveData();
    updateUI();
}

function handleExpenseActions(e) {
    if (e.target.closest('.delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const id = btn.dataset.id;
        expenses = expenses.filter(exp => exp.id !== id);
        saveData();
        updateUI();
    }
}

// ====== UI UPDATES ======
function updateUI() {
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalSalary - totalExp;
    
    // Formatting currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrency
    });

    displaySalary.textContent = formatter.format(totalSalary * exchangeRate);
    displayExpenses.textContent = formatter.format(totalExp * exchangeRate);
    displayBalance.textContent = formatter.format(balance * exchangeRate);

    renderExpenseList(formatter);
    updateChart(totalExp, balance);
    checkThreshold(balance);
    updateCurrencySymbols();
}

function renderExpenseList(formatter) {
    expenseList.innerHTML = '';
    expenses.forEach(exp => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `
            <div class="expense-item-info">
                <h4>${exp.name}</h4>
                <p>${formatter.format(exp.amount * exchangeRate)}</p>
            </div>
            <button class="btn danger-btn delete-btn" data-id="${exp.id}">
                <i class='bx bx-trash'></i>
            </button>
        `;
        expenseList.appendChild(li);
    });
}

function updateCurrencySymbols() {
    const symbol = currentCurrency === 'USD' ? '$' : '₹'; // Assuming USD and INR
    currencySymbols.forEach(el => el.textContent = symbol);
}

// ====== ERROR / ALERT BANNERS ======
function showError(message) {
    errorMsg.textContent = message;
    errorBanner.classList.remove('hidden');
    setTimeout(hideError, 4000);
}

function hideError() {
    errorBanner.classList.add('hidden');
}

function checkThreshold(balance) {
    if (totalSalary > 0 && balance < (totalSalary * 0.1)) {
        alertBanner.classList.remove('hidden');
        balanceSection.classList.add('critical');
    } else {
        alertBanner.classList.add('hidden');
        balanceSection.classList.remove('critical');
    }
}

// ====== DATA PERSISTENCE ======
function saveData() {
    localStorage.setItem('cashFlow_salary', totalSalary);
    localStorage.setItem('cashFlow_expenses', JSON.stringify(expenses));
}

function loadData() {
    const savedSalary = localStorage.getItem('cashFlow_salary');
    const savedExpenses = localStorage.getItem('cashFlow_expenses');
    
    if (savedSalary) totalSalary = parseFloat(savedSalary);
    if (savedExpenses) expenses = JSON.parse(savedExpenses);
}

// ====== CHART.JS INTEGRATION ======
function updateChart(totalExp, balance) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Prevent negative balance from breaking chart proportionally
    const chartBalance = balance < 0 ? 0 : balance * exchangeRate;
    const chartExpenses = totalExp * exchangeRate;
    
    if (expenseChartInstance) {
        expenseChartInstance.data.datasets[0].data = [chartBalance, chartExpenses];
        expenseChartInstance.update();
        return;
    }

    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Remaining Balance', 'Total Expenses'],
            datasets: [{
                data: [chartBalance, chartExpenses],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#111827' }
                }
            }
        }
    });
}

// ====== EXTERNAL APIS (CURRENCY) ======
async function toggleCurrency() {
    const targetCurrency = currentCurrency === 'USD' ? 'INR' : 'USD';
    const base = currentCurrency === 'USD' ? 'USD' : 'INR';
    
    try {
        // We use ExchangeRate-API for conversion
        // If toggling from USD to INR
        if (targetCurrency === 'INR') {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            if(!response.ok) throw new Error('API failed');
            const data = await response.json();
            exchangeRate = data.rates.INR;
            currentCurrency = 'INR';
        } else {
            // Reverting to USD
            exchangeRate = 1;
            currentCurrency = 'USD';
        }
        
        currencySymbolLabel.textContent = currentCurrency;
        updateUI();
    } catch (err) {
        showError("Failed to fetch exchange rates. Try again later.");
        console.error(err);
    }
}

// ====== JSPDF INTEGRATION ======
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Cash-Flow Report", 14, 22);
    
    doc.setFontSize(12);
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrency
    });
    
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalSalary - totalExp;
    
    doc.text(`Total Salary: ${formatter.format(totalSalary * exchangeRate)}`, 14, 32);
    doc.text(`Total Expenses: ${formatter.format(totalExp * exchangeRate)}`, 14, 40);
    doc.text(`Remaining Balance: ${formatter.format(balance * exchangeRate)}`, 14, 48);
    
    const tableData = expenses.map(exp => [
        exp.name, 
        formatter.format(exp.amount * exchangeRate)
    ]);
    
    doc.autoTable({
        startY: 60,
        head: [['Expense Name', 'Amount']],
        body: tableData,
    });
    
    doc.save('cash-flow-report.pdf');
}

// Start app
init();

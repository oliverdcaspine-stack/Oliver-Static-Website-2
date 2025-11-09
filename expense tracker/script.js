// Get DOM elements
const expenseForm = document.getElementById('expenseForm');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const expensesList = document.getElementById('expensesList');
const balanceAmount = document.getElementById('balanceAmount');
const expenseAmount = document.getElementById('expenseAmount');
const incomeAmount = document.getElementById('incomeAmount');
const currencySelect = document.getElementById('currencySelect');
const amountLabel = document.getElementById('amountLabel');
const expenseModal = document.getElementById('expenseModal');
const closeModal = document.getElementById('closeModal');
const btnAddNew = document.querySelector('.btn-add-new');
const categoriesGrid = document.getElementById('categoriesGrid');
const statisticsChart = document.getElementById('statisticsChart');
const balanceChart = document.getElementById('balanceChart');
const transactionType = document.getElementById('transactionType');
const categoryGroup = document.getElementById('categoryGroup');

// Currency configuration
const currencies = {
    USD: { symbol: '$', position: 'before', decimals: 2 },
    INR: { symbol: '₹', position: 'before', decimals: 2 },
    EUR: { symbol: '€', position: 'before', decimals: 2 },
    GBP: { symbol: '£', position: 'before', decimals: 2 },
    JPY: { symbol: '¥', position: 'before', decimals: 0 },
    CNY: { symbol: '¥', position: 'before', decimals: 2 },
    AUD: { symbol: 'A$', position: 'before', decimals: 2 },
    CAD: { symbol: 'C$', position: 'before', decimals: 2 },
    CHF: { symbol: 'Fr', position: 'before', decimals: 2 },
    AED: { symbol: 'د.إ', position: 'before', decimals: 2 },
    SAR: { symbol: '﷼', position: 'before', decimals: 2 },
    PKR: { symbol: '₨', position: 'before', decimals: 2 },
    BRL: { symbol: 'R$', position: 'before', decimals: 2 },
    ZAR: { symbol: 'R', position: 'before', decimals: 2 },
    RUB: { symbol: '₽', position: 'before', decimals: 2 },
    KRW: { symbol: '₩', position: 'before', decimals: 0 },
    MXN: { symbol: '$', position: 'before', decimals: 2 },
    SGD: { symbol: 'S$', position: 'before', decimals: 2 },
    NZD: { symbol: 'NZ$', position: 'before', decimals: 2 },
    HKD: { symbol: 'HK$', position: 'before', decimals: 2 }
};

// Category configuration
const categories = {
    house: { name: 'House', icon: '🏠', color: '#8B4513' },
    grocery: { name: 'Grocery', icon: '🥛', color: '#8b5cf6' },
    shopping: { name: 'Shopping', icon: '🛍️', color: '#10b981' },
    education: { name: 'Education', icon: '📖', color: '#06b6d4' },
    entertainment: { name: 'Entertainment', icon: '🍷', color: '#ef4444' },
    other: { name: 'Other', icon: '💳', color: '#ec4899' }
};

// Chart instances
let statisticsChartInstance = null;
let balanceChartInstance = null;

// Get current currency from localStorage or default to USD
function getCurrentCurrency() {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency && currencies[savedCurrency] ? savedCurrency : 'USD';
}

// Set current currency
function setCurrentCurrency(currency) {
    localStorage.setItem('currency', currency);
    updateCurrencyDisplay();
}

// Update currency display throughout the app
function updateCurrencyDisplay() {
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    
    // Update currency selector
    if (currencySelect) {
        currencySelect.value = currency;
    }
    
    // Update amount label
    if (amountLabel) {
        amountLabel.textContent = `Amount (${currencyConfig.symbol})`;
    }
    
    // Update amount input step based on decimals
    if (amountInput) {
        amountInput.step = currencyConfig.decimals === 0 ? '1' : '0.01';
    }
    
    // Refresh displays
    displayExpenses();
    updateSummaryCards();
    updateCategories();
    updateCharts();
}

// Set today's date as default
if (dateInput) {
    dateInput.valueAsDate = new Date();
}

// Modal functionality
if (btnAddNew) {
    btnAddNew.addEventListener('click', () => {
        expenseModal.classList.add('active');
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        expenseModal.classList.remove('active');
    });
}

if (expenseModal) {
    expenseModal.addEventListener('click', (e) => {
        if (e.target === expenseModal) {
            expenseModal.classList.remove('active');
        }
    });
}

// Update category visibility based on transaction type
function updateCategoryVisibility() {
    if (transactionType && categoryGroup) {
        if (transactionType.value === 'income') {
            categoryGroup.style.display = 'none';
        } else {
            categoryGroup.style.display = 'block';
        }
    }
}

// Handle transaction type change
if (transactionType) {
    transactionType.addEventListener('change', updateCategoryVisibility);
}

// Initialize dropdowns and functionality
initializeDropdowns();
initializeButtons();
initializeNavigation();
initializeThemeToggle();
initializeTabs();

// Load currency and expenses from localStorage on page load
updateCurrencyDisplay();
loadExpenses();
updateCategoryVisibility();

// Apply filters on page load if any are set
setTimeout(() => {
    applyFilters();
}, 100);

// Initialize dropdowns (Account, Month, Year)
function initializeDropdowns() {
    // Initialize Account dropdown
    const accountSelect = document.getElementById('accountSelect');
    if (accountSelect) {
        // Get accounts from localStorage or use default
        const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        if (accounts.length === 0) {
            accounts.push({ id: 'all', name: 'All Accounts' });
            accounts.push({ id: 'default', name: 'Default Account' });
            localStorage.setItem('accounts', JSON.stringify(accounts));
        }
        
        accountSelect.innerHTML = accounts.map(acc => 
            `<option value="${acc.id}">${acc.name}</option>`
        ).join('');
        
        accountSelect.addEventListener('change', function() {
            const selectedAccount = this.value;
            localStorage.setItem('selectedAccount', selectedAccount);
            applyFilters();
        });
        
        // Load saved selection
        const savedAccount = localStorage.getItem('selectedAccount') || 'all';
        accountSelect.value = savedAccount;
    }
    
    // Initialize Month dropdown
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const currentMonth = new Date().getMonth();
        
        monthSelect.innerHTML = '<option value="">All Months</option>' + 
            months.map((month, index) => 
                `<option value="${index}" ${index === currentMonth && localStorage.getItem('selectedMonth') !== null ? 'selected' : ''}>${month}</option>`
            ).join('');
        
        monthSelect.addEventListener('change', function() {
            const selectedMonth = this.value;
            if (selectedMonth !== '') {
                localStorage.setItem('selectedMonth', selectedMonth);
            } else {
                localStorage.removeItem('selectedMonth');
            }
            applyFilters();
        });
        
        // Load saved selection
        const savedMonth = localStorage.getItem('selectedMonth');
        if (savedMonth !== null && savedMonth !== '') {
            monthSelect.value = savedMonth;
        } else {
            monthSelect.value = ''; // Show all months by default
        }
    }
    
    // Initialize Year dropdown
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(i);
        }
        
        yearSelect.innerHTML = '<option value="">All Years</option>' + 
            years.map(year => 
                `<option value="${year}" ${year === currentYear && localStorage.getItem('selectedYear') !== null ? 'selected' : ''}>${year}</option>`
            ).join('');
        
        yearSelect.addEventListener('change', function() {
            const selectedYear = this.value;
            if (selectedYear !== '') {
                localStorage.setItem('selectedYear', selectedYear);
            } else {
                localStorage.removeItem('selectedYear');
            }
            applyFilters();
        });
        
        // Load saved selection
        const savedYear = localStorage.getItem('selectedYear');
        if (savedYear !== null && savedYear !== '') {
            yearSelect.value = savedYear;
        } else {
            yearSelect.value = ''; // Show all years by default
        }
    }
}

// Apply all filters (month, year, account)
function applyFilters() {
    const expenses = getExpensesFromStorage();
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : '';
    const selectedYear = yearSelect ? yearSelect.value : '';
    const selectedAccount = localStorage.getItem('selectedAccount') || 'all';
    
    let filtered = expenses;
    let shouldFilter = false;
    
    // Filter by month if selected
    if (selectedMonth !== '') {
        const month = parseInt(selectedMonth);
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            return expenseDate.getMonth() === month;
        });
        shouldFilter = true;
    }
    
    // Filter by year if selected
    if (selectedYear !== '') {
        const year = parseInt(selectedYear);
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            return expenseDate.getFullYear() === year;
        });
        shouldFilter = true;
    }
    
    // Filter by account (for now, all accounts shows all)
    // In a full implementation, this would filter by account ID
    
    // Display filtered results
    if (shouldFilter) {
        displayFilteredExpenses(filtered);
        updateFilteredSummaryCards(filtered);
        // Update charts with filtered data
        updateChartsWithFilteredData(filtered);
    } else {
        // Show all transactions
        displayExpenses();
        updateSummaryCards();
        updateCharts();
    }
    
    updateCategories();
}

// Update charts with filtered data
function updateChartsWithFilteredData(expenses) {
    // Update statistics chart with filtered data
    const currency = getCurrentCurrency();
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const dailyExpenses = last7Days.map(date => {
        const dayExpenses = expenses.filter(e => e.date === date);
        const expense = dayExpenses.filter(e => e.amount <= 0)
            .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        const income = dayExpenses.filter(e => e.amount > 0)
            .reduce((sum, e) => sum + e.amount, 0);
        return { date, expense, income };
    });
    
    if (statisticsChart && Chart && statisticsChartInstance) {
        statisticsChartInstance.data.datasets[0].data = dailyExpenses.map(d => d.expense);
        statisticsChartInstance.data.datasets[1].data = dailyExpenses.map(d => d.income);
        statisticsChartInstance.update();
    }
}

// Display filtered expenses
function displayFilteredExpenses(expenses) {
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p class="empty-message">No transactions found for selected period.</p>';
        return;
    }
    
    // Sort expenses by date (most recent first)
    expenses.sort((a, b) => {
        if (b.date !== a.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.id - a.id;
    });
    
    // Group expenses by date
    const groupedExpenses = {};
    expenses.forEach(expense => {
        if (!groupedExpenses[expense.date]) {
            groupedExpenses[expense.date] = [];
        }
        groupedExpenses[expense.date].push(expense);
    });
    
    // Display grouped expenses (same logic as displayExpenses)
    expensesList.innerHTML = Object.keys(groupedExpenses).map(date => {
        const dateExpenses = groupedExpenses[date];
        const formattedDate = formatDateForDisplay(date);
        
        return `
            <div class="transaction-group">
                <div class="transaction-date">${formattedDate}</div>
                ${dateExpenses.map(expense => {
                    const formattedAmount = formatCurrency(expense.amount);
                    const categoryInfo = categories[expense.category] || categories.other;
                    const isNegative = expense.amount <= 0;
                    const amountClass = isNegative ? 'negative' : 'positive';
                    const amountSign = isNegative ? '' : '+';
                    
                    const isIncome = expense.amount > 0;
                    const icon = isIncome ? '💰' : categoryInfo.icon;
                    const meta = isIncome ? 'Income' : `#${expense.category}`;
                    
                    return `
                        <div class="transaction-item">
                            <div class="transaction-icon" style="background: ${isIncome ? '#10b98120' : categoryInfo.color + '20'}; color: ${isIncome ? '#10b981' : categoryInfo.color}">
                                ${icon}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">${escapeHtml(expense.description)}</div>
                                <div class="transaction-meta">${meta}</div>
                            </div>
                            <div class="transaction-amount ${amountClass}">${amountSign}${formattedAmount}</div>
                            <button class="btn-delete" onclick="deleteExpense(${expense.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

// Update filtered summary cards
function updateFilteredSummaryCards(expenses) {
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    expenses.forEach(expense => {
        if (expense.amount >= 0) {
            totalIncome += expense.amount;
        } else {
            totalExpense += Math.abs(expense.amount);
        }
    });
    
    const balance = totalIncome - totalExpense;
    const totalTransactions = expenses.length;
    const expenseTransactions = expenses.filter(e => e.amount <= 0).length;
    const incomeTransactions = expenses.filter(e => e.amount > 0).length;
    
    // Update cards (same logic as updateSummaryCards)
    if (balanceAmount) {
        const formattedBalance = formatNumber(balance);
        balanceAmount.textContent = `${currencyConfig.symbol}${formattedBalance}`;
        updateCardSubtitle('Balance', totalTransactions);
        const balancePercent = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
        updateCircularProgress('balance', balancePercent);
    }
    
    if (expenseAmount) {
        const formattedExpense = formatNumber(totalExpense);
        expenseAmount.textContent = `-${currencyConfig.symbol}${formattedExpense}`;
        updateCardSubtitle('Expense', expenseTransactions);
        const expensePercent = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
        updateCircularProgress('expense', expensePercent);
    }
    
    if (incomeAmount) {
        const formattedIncome = formatNumber(totalIncome);
        incomeAmount.textContent = `+${currencyConfig.symbol}${formattedIncome}`;
        updateCardSubtitle('Income', incomeTransactions);
        updateCircularProgress('income', 100);
    }
}

// Initialize buttons
function initializeButtons() {
    // Logout button
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                // Clear user session (in a real app, this would clear auth tokens)
                // For now, just show an alert
                alert('Logged out successfully!');
                // In a real app: window.location.href = '/login';
            }
        });
    }
    
    // Settings button
    const headerIcons = document.querySelectorAll('.header-icon');
    if (headerIcons.length >= 2) {
        // Search is first, Settings is second
        headerIcons[0].addEventListener('click', function() {
            const searchTerm = prompt('Search transactions:');
            if (searchTerm) {
                searchTransactions(searchTerm);
            }
        });

        headerIcons[1].addEventListener('click', function() {
            openSettingsModal();
        });
    }
    
    // Pro Account button
    const proBtn = document.querySelector('.btn-pro');
    if (proBtn) {
        proBtn.addEventListener('click', function() {
            alert('Upgrade to Pro Account to unlock premium features!');
        });
    }
    
    // Reminders add button
    const remindersAddBtn = document.querySelector('.reminders-widget .btn-icon');
    if (remindersAddBtn) {
        remindersAddBtn.addEventListener('click', function() {
            const reminderText = prompt('Enter reminder:');
            if (reminderText) {
                addReminder(reminderText);
            }
        });
    }
    
    // Upcoming add button
    const upcomingAddBtn = document.querySelector('.upcoming-widget .btn-icon');
    if (upcomingAddBtn) {
        upcomingAddBtn.addEventListener('click', function() {
            alert('Add upcoming transaction feature coming soon!');
        });
    }
    
    // Sidebar toggle buttons (desktop)
    const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
    sidebarToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            if (window.innerWidth > 768) {
                const sidebar = document.querySelector('.sidebar');
                const mainContent = document.querySelector('.main-content');
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('mobile-open');
        });
    }
    
    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (window.innerWidth <= 768 && sidebar && 
            !sidebar.contains(e.target) && 
            e.target !== mobileToggle && 
            !mobileToggle?.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
        }
    });
}

// Search transactions
function searchTransactions(searchTerm) {
    const expenses = getExpensesFromStorage();
    const filtered = expenses.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.category && expense.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    displayFilteredExpenses(filtered);
    updateFilteredSummaryCards(filtered);
}

// Add reminder
function addReminder(text) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const reminder = {
        id: Date.now(),
        text: text,
        date: new Date().toISOString().split('T')[0],
        completed: false
    };
    reminders.push(reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    updateReminders();
}

// Update reminders display
function updateReminders() {
    const remindersList = document.getElementById('remindersList');
    if (!remindersList) return;
    
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    if (reminders.length === 0) {
        remindersList.innerHTML = '<p class="empty-message">No reminders yet</p>';
        return;
    }
    
    // Group reminders by date
    const grouped = {};
    reminders.forEach(reminder => {
        if (!grouped[reminder.date]) {
            grouped[reminder.date] = [];
        }
        grouped[reminder.date].push(reminder);
    });
    
    remindersList.innerHTML = Object.keys(grouped).map(date => {
        const dateReminders = grouped[date];
        const formattedDate = formatDateForDisplay(date);
        return `
            <div class="reminder-group">
                <div class="reminder-date">${formattedDate}</div>
                ${dateReminders.map(reminder => `
                    <div class="reminder-item">
                        <input type="checkbox" class="reminder-checkbox" ${reminder.completed ? 'checked' : ''} 
                               onchange="toggleReminder(${reminder.id})">
                        <span class="reminder-text" style="${reminder.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                            ${escapeHtml(reminder.text)}
                        </span>
                        <i class="fas fa-chevron-down reminder-arrow"></i>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Toggle reminder
function toggleReminder(id) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = !reminder.completed;
        localStorage.setItem('reminders', JSON.stringify(reminders));
        updateReminders();
    }
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Determine which view to show based on nav text
            const navText = this.querySelector('span').textContent.trim();
            // Map nav items to view keys
            const key = navText.toLowerCase();
            showView(key);
        });
    });
}

// Show a single view in the main content area. For Dashboard, restore full dashboard layout.
function showView(key) {
    const headerTitle = document.querySelector('.header-center h1');
    const dashboardContent = document.querySelector('.dashboard-content');

    // Remove any existing single-view container
    let singleView = document.querySelector('.single-view');
    if (singleView) singleView.remove();

    // If Dashboard requested, restore dashboard
    if (key === 'dashboard') {
        if (dashboardContent) dashboardContent.style.display = '';
        if (headerTitle) headerTitle.textContent = 'My Dashboard';
        // Re-run layout updates if needed
        updateCharts();
        updateCategories();
        updateReminders();
        return;
    }

    // Otherwise hide dashboard and show a focused view
    if (dashboardContent) dashboardContent.style.display = 'none';

    // Create container
    singleView = document.createElement('div');
    singleView.className = 'single-view';
    singleView.style.padding = '30px';

    // Helper to clone a widget from dashboard into the single view
    function cloneWidget(selector) {
        const widget = document.querySelector(selector);
        if (widget) {
            const clone = widget.cloneNode(true);
            // Remove any IDs inside the clone to avoid duplicate IDs interfering with dashboard elements
            clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
            singleView.appendChild(clone);
        } else {
            singleView.appendChild(createPlaceholder(`${key} view is not available yet.`));
        }
    }

    // Helper to create a simple placeholder element
    function createPlaceholder(text) {
        const box = document.createElement('div');
        box.className = 'widget';
        box.style.minHeight = '200px';
        box.innerHTML = `<div class="widget-header"><h2>${text}</h2></div>`;
        return box;
    }

    // Render view based on key
    switch (key) {
        case 'transactions':
            headerTitle && (headerTitle.textContent = 'Transactions');
            cloneWidget('.transactions-widget');
            break;
        case 'categories':
            headerTitle && (headerTitle.textContent = 'Categories');
            cloneWidget('.categories-widget');
            break;
        case 'balance':
            headerTitle && (headerTitle.textContent = 'Balance');
            cloneWidget('.balance-widget');
            break;
        case 'accounts':
            headerTitle && (headerTitle.textContent = 'Accounts');
            singleView.appendChild(renderAccountsView());
            break;
        case 'goals':
        case 'goal':
            headerTitle && (headerTitle.textContent = 'Goals');
            singleView.appendChild(createPlaceholder('Goals - coming soon'));
            break;
        case 'upcoming':
        case 'upcomings':
            headerTitle && (headerTitle.textContent = 'Upcoming');
            cloneWidget('.upcoming-widget');
            break;
        case 'reminders':
        case 'reminder':
            headerTitle && (headerTitle.textContent = 'Reminders');
            cloneWidget('.reminders-widget');
            break;
        case 'history':
            headerTitle && (headerTitle.textContent = 'History');
            // Reuse transactions widget for history view
            cloneWidget('.transactions-widget');
            break;
        default:
            headerTitle && (headerTitle.textContent = navKeyToTitle(key));
            singleView.appendChild(createPlaceholder(`${navKeyToTitle(key)} - coming soon`));
            break;
    }

    // Append single view to main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.appendChild(singleView);

    // If we cloned widgets that have interactive buttons, attach basic interactions to cloned elements
    // (cloned elements have no IDs, but many buttons are purely cosmetic in the clone)
}

function navKeyToTitle(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function renderAccountsView() {
    const box = document.createElement('div');
    box.className = 'widget accounts-widget';
    box.innerHTML = `<div class="widget-header"><h2>Accounts</h2></div>`;

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '10px';
    list.style.marginTop = '10px';

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    if (accounts.length === 0) {
        list.innerHTML = '<p class="empty-message">No accounts configured.</p>';
    } else {
        accounts.forEach(acc => {
            const item = document.createElement('div');
            item.className = 'upcoming-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.innerHTML = `<div style="font-weight:600">${escapeHtml(acc.name)}</div><div style="color:var(--text-secondary)">${escapeHtml(acc.id)}</div>`;
            list.appendChild(item);
        });
    }

    box.appendChild(list);
    return box;
}

// Initialize theme toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        themeToggle.checked = savedTheme === 'light';
        
        themeToggle.addEventListener('change', function() {
            const theme = this.checked ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
            document.body.setAttribute('data-theme', theme);
            // For now, dark theme is default, light theme would require additional CSS
            if (theme === 'light') {
                alert('Light theme coming soon!');
                this.checked = false;
            }
        });
    }
}

// Initialize tabs
function initializeTabs() {
    // Categories tabs
    const categoryTabs = document.querySelectorAll('.categories-widget .tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // Switch between expenses and incomes
            updateCategories();
        });
    });
    
    // Statistics tabs
    const statisticsTabs = document.querySelectorAll('.statistics-widget .tab');
    statisticsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            statisticsTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const chartType = this.textContent.includes('Bar') ? 'bar' : 'line';
            updateStatisticsChart(chartType);
        });
    });
    
    // Balance tabs
    const balanceTabs = document.querySelectorAll('.balance-widget .tab');
    balanceTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            balanceTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const chartType = this.textContent.includes('Pie') ? 'doughnut' : 'bar';
            updateBalanceChart(chartType);
        });
    });
}

// Handle currency change
if (currencySelect) {
    currencySelect.addEventListener('change', function() {
        setCurrentCurrency(currencySelect.value);
    });
}

// Handle form submission
if (expenseForm) {
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        const date = dateInput.value;
        const type = transactionType?.value || 'expense';
        const category = document.getElementById('category')?.value || 'other';
        
        if (amount <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }
        
        if (!description) {
            alert('Please enter a description');
            return;
        }
        
        // Create transaction object (negative for expenses, positive for income)
        const transaction = {
            id: Date.now(),
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            description: description,
            date: date,
            category: category,
            type: type
        };
        
        // Get existing expenses from localStorage
        const expenses = getExpensesFromStorage();
        
        // Add new transaction
        expenses.push(transaction);
        
        // Save to localStorage
        saveExpensesToStorage(expenses);
        
        // Refresh the display
        displayExpenses();
        updateSummaryCards();
        updateCategories();
        updateCharts();
        
        // Reset form
        expenseForm.reset();
        transactionType.value = 'expense';
        dateInput.valueAsDate = new Date();
        updateCategoryVisibility();
        
        // Close modal
        expenseModal.classList.remove('active');
        
        // Focus on amount input for next entry
        amountInput.focus();
    });
}

// Get expenses from localStorage
function getExpensesFromStorage() {
    const expensesJSON = localStorage.getItem('expenses');
    const expenses = expensesJSON ? JSON.parse(expensesJSON) : [];
    
    // Migrate old expenses (positive amounts) to negative for backward compatibility
    // Only migrate if all expenses are positive (old format)
    const hasOldFormat = expenses.length > 0 && expenses.every(e => e.amount > 0);
    if (hasOldFormat) {
        expenses.forEach(expense => {
            expense.amount = -Math.abs(expense.amount);
            if (!expense.category) {
                expense.category = 'other';
            }
        });
        saveExpensesToStorage(expenses);
    }
    
    return expenses;
}

// Save expenses to localStorage
function saveExpensesToStorage(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Load and display expenses
function loadExpenses() {
    displayExpenses();
    updateSummaryCards();
    updateCategories();
    updateCharts();
    updateReminders();
}

// Display expenses in the UI
function displayExpenses() {
    const expenses = getExpensesFromStorage();
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p class="empty-message">No expenses yet. Add your first expense!</p>';
        return;
    }
    
    // Sort expenses by date (most recent first), then by id (most recent first)
    expenses.sort((a, b) => {
        if (b.date !== a.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.id - a.id;
    });
    
    // Group expenses by date
    const groupedExpenses = {};
    expenses.forEach(expense => {
        if (!groupedExpenses[expense.date]) {
            groupedExpenses[expense.date] = [];
        }
        groupedExpenses[expense.date].push(expense);
    });
    
    // Display grouped expenses
    expensesList.innerHTML = Object.keys(groupedExpenses).map(date => {
        const dateExpenses = groupedExpenses[date];
        const formattedDate = formatDateForDisplay(date);
        
        return `
            <div class="transaction-group">
                <div class="transaction-date">${formattedDate}</div>
                ${dateExpenses.map(expense => {
                    const formattedAmount = formatCurrency(expense.amount);
                    const categoryInfo = categories[expense.category] || categories.other;
                    const isNegative = expense.amount <= 0;
                    const amountClass = isNegative ? 'negative' : 'positive';
                    const amountSign = isNegative ? '' : '+';
                    
                    const isIncome = expense.amount > 0;
                    const icon = isIncome ? '💰' : categoryInfo.icon;
                    const meta = isIncome ? 'Income' : `#${expense.category}`;
                    
                    return `
                        <div class="transaction-item">
                            <div class="transaction-icon" style="background: ${isIncome ? '#10b98120' : categoryInfo.color + '20'}; color: ${isIncome ? '#10b981' : categoryInfo.color}">
                                ${icon}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">${escapeHtml(expense.description)}</div>
                                <div class="transaction-meta">${meta}</div>
                            </div>
                            <div class="transaction-amount ${amountClass}">${amountSign}${formattedAmount}</div>
                            <button class="btn-delete" onclick="deleteExpense(${expense.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

// Update summary cards
function updateSummaryCards() {
    const expenses = getExpensesFromStorage();
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    
    expenses.forEach(expense => {
        if (expense.amount >= 0) {
            totalIncome += expense.amount;
        } else {
            totalExpense += Math.abs(expense.amount);
        }
    });
    
    const balance = totalIncome - totalExpense;
    const totalTransactions = expenses.length;
    const expenseTransactions = expenses.filter(e => e.amount <= 0).length;
    const incomeTransactions = expenses.filter(e => e.amount > 0).length;
    
    // Update balance card
    if (balanceAmount) {
        const formattedBalance = formatNumber(balance);
        balanceAmount.textContent = `${currencyConfig.symbol}${formattedBalance}`;
        updateCardSubtitle('Balance', totalTransactions);
        
        // Update progress (assuming 72% based on balance ratio)
        const balancePercent = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
        updateCircularProgress('balance', balancePercent);
    }
    
    // Update expense card
    if (expenseAmount) {
        const formattedExpense = formatNumber(totalExpense);
        expenseAmount.textContent = `-${currencyConfig.symbol}${formattedExpense}`;
        updateCardSubtitle('Expense', expenseTransactions);
        
        const expensePercent = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
        updateCircularProgress('expense', expensePercent);
    }
    
    // Update income card
    if (incomeAmount) {
        const formattedIncome = formatNumber(totalIncome);
        incomeAmount.textContent = `+${currencyConfig.symbol}${formattedIncome}`;
        updateCardSubtitle('Income', incomeTransactions);
        updateCircularProgress('income', 100);
    }
}

function updateCardSubtitle(cardType, count) {
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (h3 && h3.textContent === cardType) {
            const subtitle = card.querySelector('.card-subtitle');
            if (subtitle) {
                subtitle.textContent = `${count} Transaction${count !== 1 ? 's' : ''}`;
            }
        }
    });
}

function updateCircularProgress(type, percent) {
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (h3 && h3.textContent === type) {
            const progress = card.querySelector('.circular-progress');
            if (progress) {
                progress.setAttribute('data-percent', percent);
                const span = progress.querySelector('span');
                if (span) {
                    if (type === 'expense') {
                        span.textContent = `-${percent}%`;
                        progress.style.background = `conic-gradient(var(--accent-red) 0% ${percent}%, var(--bg-secondary) ${percent}% 100%)`;
                    } else if (type === 'income') {
                        span.textContent = '100%';
                        progress.style.background = `conic-gradient(var(--accent-green) 0% 100%, var(--bg-secondary) 100% 100%)`;
                    } else {
                        span.textContent = `${percent}%`;
                        progress.style.background = `conic-gradient(var(--accent-blue) 0% ${percent}%, var(--bg-secondary) ${percent}% 100%)`;
                    }
                }
            }
        }
    });
}

// Update categories display
function updateCategories() {
    const expenses = getExpensesFromStorage();
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    
    // Calculate category totals
    const categoryTotals = {};
    let totalExpense = 0;
    
    expenses.forEach(expense => {
        if (expense.amount <= 0) {
            const category = expense.category || 'other';
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += Math.abs(expense.amount);
            totalExpense += Math.abs(expense.amount);
        }
    });
    
    // Sort categories by amount
    const sortedCategories = Object.keys(categoryTotals).sort((a, b) => 
        categoryTotals[b] - categoryTotals[a]
    );
    
    if (categoriesGrid) {
        if (sortedCategories.length === 0) {
            categoriesGrid.innerHTML = '<p class="empty-message">No expenses yet</p>';
            return;
        }
        
        categoriesGrid.innerHTML = sortedCategories.slice(0, 8).map((category, index) => {
            const categoryInfo = categories[category] || categories.other;
            const amount = categoryTotals[category];
            const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
            const isLarge = index === 0;
            
            return `
                <div class="category-item ${isLarge ? 'large' : ''}" style="background: ${categoryInfo.color}20; border: 2px solid ${categoryInfo.color}">
                    <div class="category-icon">${categoryInfo.icon}</div>
                    <div class="category-percentage" style="color: ${categoryInfo.color}">${percentage}%</div>
                </div>
            `;
        }).join('');
        
        // Add "Others" if there are more categories
        if (sortedCategories.length > 8) {
            const othersAmount = sortedCategories.slice(8).reduce((sum, cat) => 
                sum + categoryTotals[cat], 0);
            const othersPercentage = totalExpense > 0 ? Math.round((othersAmount / totalExpense) * 100) : 0;
            categoriesGrid.innerHTML += `
                <div class="category-item" style="background: #6b728020; border: 2px solid #6b7280">
                    <div class="category-icon">📦</div>
                    <div class="category-percentage" style="color: #6b7280">Others ${othersPercentage}%</div>
                </div>
            `;
        }
    }
}

// Update charts
function updateCharts() {
    updateStatisticsChart();
    updateBalanceChart();
}

function updateStatisticsChart(chartType = 'bar') {
    const expenses = getExpensesFromStorage();
    
    // Get last 7 days
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    // Calculate daily totals
    const dailyExpenses = last7Days.map(date => {
        const dayExpenses = expenses.filter(e => e.date === date);
        const expense = dayExpenses.filter(e => e.amount <= 0)
            .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        const income = dayExpenses.filter(e => e.amount > 0)
            .reduce((sum, e) => sum + e.amount, 0);
        return { date, expense, income };
    });
    
    if (statisticsChart && Chart) {
        const ctx = statisticsChart.getContext('2d');
        
        if (statisticsChartInstance) {
            statisticsChartInstance.destroy();
        }
        
        statisticsChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: last7Days.map(d => {
                    const date = new Date(d + 'T00:00:00');
                    return date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });
                }),
                datasets: [
                    {
                        label: 'Expense',
                        data: dailyExpenses.map(d => d.expense),
                        backgroundColor: '#ef4444',
                        borderRadius: 8
                    },
                    {
                        label: 'Income',
                        data: dailyExpenses.map(d => d.income),
                        backgroundColor: '#10b981',
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#b0b0b0',
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#b0b0b0'
                        },
                        grid: {
                            color: '#3a3a5f'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#b0b0b0'
                        },
                        grid: {
                            color: '#3a3a5f'
                        }
                    }
                }
            }
        });
    }
}

function updateBalanceChart(chartType = 'doughnut') {
    const expenses = getExpensesFromStorage();
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    
    expenses.forEach(expense => {
        if (expense.amount >= 0) {
            totalIncome += expense.amount;
        } else {
            totalExpense += Math.abs(expense.amount);
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    if (balanceChart && Chart) {
        const ctx = balanceChart.getContext('2d');
        
        if (balanceChartInstance) {
            balanceChartInstance.destroy();
        }
        
        const balancePercent = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
        const expensePercent = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
        const incomePercent = 100;
        
        balanceChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: ['Balance', 'Expense', 'Income'],
                datasets: [{
                    data: [balancePercent, expensePercent, incomePercent],
                    backgroundColor: ['#3b82f6', '#ef4444', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#b0b0b0',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }
}

// Delete an expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const expenses = getExpensesFromStorage();
        const filteredExpenses = expenses.filter(expense => expense.id !== id);
        saveExpensesToStorage(filteredExpenses);
        displayExpenses();
        updateSummaryCards();
        updateCategories();
        updateCharts();
    }
}

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
        return 'Today, ' + date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return 'Yesterday, ' + date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    } else {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return dayName + ', ' + date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    }
}

// Format date for display (legacy function)
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format currency for display
function formatCurrency(amount) {
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    const absAmount = Math.abs(amount);
    const formattedAmount = absAmount.toFixed(currencyConfig.decimals);
    const amountWithCommas = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    if (currencyConfig.position === 'before') {
        return currencyConfig.symbol + amountWithCommas;
    } else {
        return amountWithCommas + ' ' + currencyConfig.symbol;
    }
}

// Format number with commas (for balance display)
function formatNumber(amount) {
    const currency = getCurrentCurrency();
    const currencyConfig = currencies[currency];
    const absAmount = Math.abs(amount);
    const formattedAmount = absAmount.toFixed(currencyConfig.decimals);
    return formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* Settings modal handling */
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const languageSelect = document.getElementById('languageSelect');
const defaultCurrencySelect = document.getElementById('defaultCurrencySelect');

function openSettingsModal() {
    populateLanguageOptions();
    populateCurrencyOptions();
    loadSettingsIntoModal();
    settingsModal.classList.add('active');
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

if (closeSettingsModal) {
    closeSettingsModal.addEventListener('click', closeSettings);
}

if (cancelSettingsBtn) {
    cancelSettingsBtn.addEventListener('click', closeSettings);
}

if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
}

if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
        // Save selected settings to localStorage
        const lang = languageSelect ? languageSelect.value : null;
        const defaultCurrency = defaultCurrencySelect ? defaultCurrencySelect.value : null;
        const dateFormat = document.getElementById('dateFormatSelect')?.value || null;
        const startOfWeek = document.getElementById('startOfWeekSelect')?.value || null;
        const theme = document.getElementById('themeSelect')?.value || null;
        const multiCurrency = document.getElementById('multiCurrencySupport')?.checked || false;
        const notifyReminders = document.getElementById('notifyReminders')?.checked || false;
        const notifyBudgets = document.getElementById('notifyBudgets')?.checked || false;

        if (lang) localStorage.setItem('language', lang);
        if (defaultCurrency) localStorage.setItem('defaultCurrency', defaultCurrency);
        if (dateFormat) localStorage.setItem('dateFormat', dateFormat);
        if (startOfWeek) localStorage.setItem('startOfWeek', startOfWeek);
        if (theme) localStorage.setItem('theme', theme);
        localStorage.setItem('multiCurrency', JSON.stringify(multiCurrency));
        localStorage.setItem('notifyReminders', JSON.stringify(notifyReminders));
        localStorage.setItem('notifyBudgets', JSON.stringify(notifyBudgets));

        // Apply theme immediately (basic)
        if (theme) document.body.setAttribute('data-theme', theme);

        alert('Settings saved');
        closeSettings();
    });
}

function populateLanguageOptions() {
    if (!languageSelect) return;
    // Popular languages list
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'zh', name: 'Chinese (Mandarin)' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ar', name: 'Arabic' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'bn', name: 'Bengali' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'de', name: 'German' },
        { code: 'fr', name: 'French' },
        { code: 'ko', name: 'Korean' },
        { code: 'it', name: 'Italian' },
        { code: 'tr', name: 'Turkish' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'id', name: 'Indonesian' },
        { code: 'ms', name: 'Malay' },
        { code: 'th', name: 'Thai' },
        { code: 'fa', name: 'Persian' },
        { code: 'ur', name: 'Urdu' },
        { code: 'sw', name: 'Swahili' },
        { code: 'other', name: 'Other (select)' }
    ];

    languageSelect.innerHTML = languages.map(l => `<option value="${l.code}">${l.name}</option>`).join('');
}

function populateCurrencyOptions() {
    if (!defaultCurrencySelect) return;
    // Reuse currencies object defined earlier
    const keys = Object.keys(currencies);
    defaultCurrencySelect.innerHTML = keys.map(k => `<option value="${k}">${k} (${currencies[k].symbol})</option>`).join('');
}

function loadSettingsIntoModal() {
    const savedLang = localStorage.getItem('language');
    const savedCurrency = localStorage.getItem('defaultCurrency') || getCurrentCurrency();
    const savedDateFormat = localStorage.getItem('dateFormat');
    const savedStartOfWeek = localStorage.getItem('startOfWeek');
    const savedTheme = localStorage.getItem('theme');

    if (languageSelect && savedLang) languageSelect.value = savedLang;
    if (defaultCurrencySelect && savedCurrency) defaultCurrencySelect.value = savedCurrency;
    if (document.getElementById('dateFormatSelect') && savedDateFormat) document.getElementById('dateFormatSelect').value = savedDateFormat;
    if (document.getElementById('startOfWeekSelect') && savedStartOfWeek) document.getElementById('startOfWeekSelect').value = savedStartOfWeek;
    if (document.getElementById('themeSelect') && savedTheme) document.getElementById('themeSelect').value = savedTheme;
    if (document.getElementById('multiCurrencySupport')) document.getElementById('multiCurrencySupport').checked = JSON.parse(localStorage.getItem('multiCurrency') || 'false');
    if (document.getElementById('notifyReminders')) document.getElementById('notifyReminders').checked = JSON.parse(localStorage.getItem('notifyReminders') || 'false');
    if (document.getElementById('notifyBudgets')) document.getElementById('notifyBudgets').checked = JSON.parse(localStorage.getItem('notifyBudgets') || 'false');
}
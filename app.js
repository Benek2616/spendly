const amountInput = document.getElementById('amount');
const titleInput = document.getElementById('title');
const addBtn = document.getElementById('add-btn');
const listEl = document.getElementById('list');
const totalExpenseEl = document.getElementById('total-expense');
const totalCountEl = document.getElementById('total-count');
const breakdownEl = document.getElementById('breakdown');
const currentMonthEl = document.getElementById('current-month');
const clearBtn = document.getElementById('clear-btn');
const catBtns = document.querySelectorAll('.cat');

let selectedCat = 'jedzenie';
let expenses = [];

const catLabels = {
  jedzenie: '🍔 Jedzenie',
  transport: '🚗 Transport',
  zakupy: '🛒 Zakupy',
  rozrywka: '🎬 Rozrywka',
  zdrowie: '💊 Zdrowie',
  inne: '📦 Inne'
};

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function load() {
  const all = JSON.parse(localStorage.getItem('spendly') || '{}');
  expenses = all[monthKey()] || [];
  render();
}

function save() {
  const all = JSON.parse(localStorage.getItem('spendly') || '{}');
  all[monthKey()] = expenses;
  localStorage.setItem('spendly', JSON.stringify(all));
}

function formatMoney(n) {
  return n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' zł';
}

function render() {
  // Header month
  const d = new Date();
  currentMonthEl.textContent = d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  // Totals
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  totalExpenseEl.textContent = formatMoney(total);
  totalCountEl.textContent = expenses.length;

  // List
  if (expenses.length === 0) {
    listEl.innerHTML = '<div class="empty">Brak wydatków w tym miesiącu</div>';
  } else {
    listEl.innerHTML = expenses
      .slice()
      .reverse()
      .map(e => `
        <div class="item">
          <div class="item-left">
            <div class="item-title">${e.title}</div>
            <div class="item-meta">${catLabels[e.cat] || e.cat} • ${e.date}</div>
          </div>
          <div class="item-amount">-${formatMoney(e.amount)}</div>
        </div>
      `).join('');
  }

  // Breakdown
  const byCat = {};
  expenses.forEach(e => {
    byCat[e.cat] = (byCat[e.cat] || 0) + e.amount;
  });

  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length === 0) {
    breakdownEl.innerHTML = '<div class="empty">Dodaj wydatki, żeby zobaczyć podział</div>';
  } else {
    breakdownEl.innerHTML = sorted.map(([cat, sum]) => {
      const pct = total > 0 ? Math.round((sum / total) * 100) : 0;
      return `
        <div class="breakdown-row">
          <span>${catLabels[cat] || cat}</span>
          <span>${formatMoney(sum)} (${pct}%)</span>
        </div>
        <div class="breakdown-bar"><div class="breakdown-fill" style="width:${pct}%"></div></div>
      `;
    }).join('');
  }
}

// Categories
catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    catBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCat = btn.dataset.cat;
  });
});

// Add
addBtn.addEventListener('click', () => {
  const amount = parseFloat(amountInput.value);
  const title = titleInput.value.trim();

  if (!amount || amount <= 0) {
    amountInput.focus();
    return;
  }
  if (!title) {
    titleInput.focus();
    return;
  }

  const now = new Date();
  expenses.push({
    id: Date.now(),
    amount,
    title,
    cat: selectedCat,
    date: now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  });

  save();
  render();

  amountInput.value = '';
  titleInput.value = '';
  amountInput.focus();
});

// Enter support
[amountInput, titleInput].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') addBtn.click();
  });
});

// Clear month
clearBtn.addEventListener('click', () => {
  if (expenses.length === 0) return;
  if (confirm('Na pewno usunąć wszystkie wydatki z tego miesiąca?')) {
    expenses = [];
    save();
    render();
  }
});

load();
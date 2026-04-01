const CATEGORIES = [
    {
      id: 'grocery', icon: '🛒', name: 'Groceries', budget: 8000,
      items: [
        { name: 'Vegetables & Fruits',  amount: 1200 },
        { name: 'Rice & Grains',        amount: 900  },
        { name: 'Dairy Products',       amount: 650  },
        { name: 'Cooking Oil & Spices', amount: 450  },
      ]
    },
    {
      id: 'health', icon: '💊', name: 'Basic Health Care', budget: 4000,
      items: [
        { name: 'Medicines',               amount: 780 },
        { name: 'Doctor Consultation',     amount: 500 },
        { name: 'Vitamins & Supplements',  amount: 320 },
      ]
    },
    {
      id: 'housing', icon: '🏠', name: 'Housing', budget: 15000,
      items: [
        { name: 'Rent',                amount: 9000 },
        { name: 'Electricity Bill',    amount: 1400 },
        { name: 'Water & Maintenance', amount: 600  },
        { name: 'Internet',            amount: 799  },
      ]
    },
    {
      id: 'entertainment', icon: '🎬', name: 'Entertainment', budget: 3000,
      items: [
        { name: 'Streaming Services', amount: 649 },
        { name: 'Dining Out',         amount: 850 },
        { name: 'Movies & Events',    amount: 400 },
      ]
    },
  ];
  
  const state = CATEGORIES.map(c => ({ ...c, items: c.items.map(i => ({...i})) }));
  const fmt = n => '₹' + n.toLocaleString('en-IN');
  const getSpent = cat => cat.items.reduce((s, i) => s + i.amount, 0);
  
  function renderSummary() {
    const totalBudget = state.reduce((s, c) => s + c.budget, 0);
    const totalSpent  = state.reduce((s, c) => s + getSpent(c), 0);
    const rem = totalBudget - totalSpent;
    const pct = Math.round((totalSpent / totalBudget) * 100);
    document.getElementById('totalBudget').textContent    = fmt(totalBudget);
    document.getElementById('totalSpent').textContent     = fmt(totalSpent);
    document.getElementById('totalRemaining').textContent = fmt(rem);
    document.getElementById('totalPct').textContent       = pct + '%';
  
    const overBudget = state.filter(c => getSpent(c) > c.budget);
    const alertEl = document.getElementById('alertBanner');
    if (overBudget.length) {
      alertEl.classList.add('show');
      document.getElementById('alertMsg').textContent = overBudget.map(c => c.name).join(', ') + ' exceeded budget!';
    } else {
      alertEl.classList.remove('show');
    }
  }
  
  function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    state.forEach((cat, ci) => {
      const spent = getSpent(cat);
      const pct   = Math.min(100, Math.round((spent / cat.budget) * 100));
      const rem   = cat.budget - spent;
      const over  = spent > cat.budget;
  
      const card = document.createElement('div');
      card.className = 'category-card' + (over ? ' over-budget' : '');
      card.innerHTML = `
        <div class="cat-header">
          <div class="cat-icon">${cat.icon}</div>
          <div class="cat-meta">
            <div class="cat-name">${cat.name}</div>
            <div class="cat-budget">Budget: ${fmt(cat.budget)}</div>
          </div>
        </div>
        <div class="progress-wrap">
          <div class="progress-labels">
            <span style="color:${over ? 'var(--red)' : 'var(--green)'}; font-weight:500">${fmt(spent)} spent</span>
            <span style="color:${over ? 'var(--red)' : 'var(--muted)'}">
              ${over ? '−' + fmt(spent - cat.budget) + ' over' : fmt(rem) + ' left'}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${over ? 'danger' : ''}" style="width:0%" data-target="${pct}"></div>
          </div>
          <div class="progress-pct" style="color:${over ? 'var(--red)' : 'var(--muted)'}">${pct}% used</div>
        </div>
        <div class="item-list">
          ${cat.items.map((item, ii) => `
            <div class="item-row">
              <span class="item-name">${item.name}</span>
              <div style="display:flex;align-items:center;gap:.5rem">
                <span class="item-amount">${fmt(item.amount)}</span>
                <button class="del-btn" onclick="removeItem(${ci},${ii})">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="add-row">
          <input type="text"   id="name-${cat.id}" placeholder="Item name" />
          <input type="number" id="amt-${cat.id}"  placeholder="₹ Amount" style="width:90px"/>
          <button class="add-btn" onclick="addItem(${ci})">+ Add</button>
        </div>
      `;
      grid.appendChild(card);
    });
  
    setTimeout(() => {
      document.querySelectorAll('.progress-fill').forEach(el => {
        el.style.width = el.dataset.target + '%';
      });
    }, 80);
  }
  
  function renderChart() {
    const chart = document.getElementById('barChart');
    chart.innerHTML = '';
    const maxSpent = Math.max(...state.map(c => getSpent(c)), 1);
    state.forEach(cat => {
      const spent = getSpent(cat);
      const h     = Math.max(3, Math.round((spent / maxSpent) * 100));
      const over  = spent > cat.budget;
      const grp   = document.createElement('div');
      grp.className = 'bar-group';
      grp.innerHTML = `
        <span class="bar-val ${over ? 'over-val' : ''}">₹${(spent/1000).toFixed(1)}k</span>
        <div class="bar-wrap">
          <div class="bar ${over ? 'over' : ''}" style="height:0%" data-h="${h}"></div>
        </div>
        <span class="bar-label">${cat.name.split(' ')[0]}</span>
      `;
      chart.appendChild(grp);
    });
    setTimeout(() => {
      document.querySelectorAll('.bar').forEach(b => { b.style.height = b.dataset.h + '%'; });
    }, 120);
  }
  
  function addItem(ci) {
    const cat    = state[ci];
    const nameEl = document.getElementById(`name-${cat.id}`);
    const amtEl  = document.getElementById(`amt-${cat.id}`);
    const name   = nameEl.value.trim();
    const amount = parseInt(amtEl.value);
    if (!name || isNaN(amount) || amount <= 0) return;
    cat.items.push({ name, amount });
    nameEl.value = '';
    amtEl.value  = '';
    render();
  }
  
  function removeItem(ci, ii) {
    state[ci].items.splice(ii, 1);
    render();
  }
  
  function render() {
    renderCategories();
    renderChart();
    renderSummary();
  }
  
  const now = new Date();
  document.getElementById('monthBadge').textContent =
    now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase();
  
  render();
// --- STATE & CONSTANTS ---
const HOMES_TOTAL = 300;
const housingStock = [];
let year = 1; 
let newHomesPerYear = 3; 
let turnoverRate = 0.04; 
let corporatePolicy = 'unleashed';

// --- NEW: Seeded Random Number Generator ---
// This will produce the same sequence of numbers every time, making our simulation predictable.
function createSeededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 2**32;
    return state / 2**32; // Returns a "random" number between 0 and 1
  };
}
let seededRandom; // This will hold our random function

const marketResults = {
    purchasesByHomeowner: 0,
    purchasesByCorporate: 0,
    purchasesByIndividual: 0,
    convertedToShortTerm: 0,
};

// --- CORE SIMULATION LOGIC ---
function setupSimulation() {
  housingStock.length = 0; 
  for (let i = 0; i < HOMES_TOTAL; i++) {
    let ownerType;
    if (i < 25) { ownerType = 'corporate'; } 
    else if (i < 105) { ownerType = 'individual'; } 
    else { ownerType = 'homeowner'; }
    housingStock.push({ 
        id: i, 
        ownerType: ownerType, 
        type: 'SingleFamily', 
        usage: 'LongTermRental',
        // CHANGED: Using our new seeded random function
        price: 300000 + seededRandom() * 200000 
    });
  }
}

function advanceYear() {
  year++;
  turnoverRate = parseFloat(document.getElementById('turnover-rate-input').value) / 100;
  newHomesPerYear = parseInt(document.getElementById('new-homes-input').value);

  const appreciationRate = 0.03 + ( (3 - newHomesPerYear) * 0.02 );
  housingStock.forEach(home => {
      home.price *= (1 + appreciationRate);
  });

  const homesForSaleThisYear = Math.floor(housingStock.length * turnoverRate);

  for (let i = 0; i < homesForSaleThisYear; i++) {
    // CHANGED: Using our new seeded random function
    const homeIndex = Math.floor(seededRandom() * housingStock.length);
    const home = housingStock[homeIndex];
    const roll = seededRandom();
    let newOwnerType;

    if (corporatePolicy === 'unleashed') {
      if (roll < 0.60) { newOwnerType = 'corporate'; marketResults.purchasesByCorporate++; } 
      else if (roll < 0.85) { newOwnerType = 'individual'; marketResults.purchasesByIndividual++; } 
      else { newOwnerType = 'homeowner'; marketResults.purchasesByHomeowner++; }
    } else {
      if (roll < 0.65) { newOwnerType = 'individual'; marketResults.purchasesByIndividual++; } 
      else { newOwnerType = 'homeowner'; marketResults.purchasesByHomeowner++; }
    }
    home.ownerType = newOwnerType;
  }
  
  for (let i = 0; i < newHomesPerYear; i++) {
      const newId = housingStock.length;
      housingStock.push({ 
          id: newId, 
          ownerType: null, 
          type: 'SingleFamily', 
          usage: 'LongTermRental',
          price: 400000 + seededRandom() * 250000
      });
      const roll = seededRandom();
      let newOwnerType;
      if (corporatePolicy === 'unleashed') {
        if (roll < 0.60) { newOwnerType = 'corporate'; marketResults.purchasesByCorporate++; }
        else if (roll < 0.85) { newOwnerType = 'individual'; marketResults.purchasesByIndividual++; }
        else { newOwnerType = 'homeowner'; marketResults.purchasesByHomeowner++; }
      } else {
        if (roll < 0.65) { newOwnerType = 'individual'; marketResults.purchasesByIndividual++; }
        else { newOwnerType = 'homeowner'; marketResults.purchasesByHomeowner++; }
      }
      housingStock[newId].ownerType = newOwnerType;
  }

  housingStock.forEach(home => {
    if (home.ownerType !== 'homeowner' && home.usage === 'LongTermRental') {
      if (seededRandom() < 0.05) { home.usage = 'ShortTermRental'; marketResults.convertedToShortTerm++; }
    }
  });

  const corporateOwnedHomes = housingStock.filter(h => h.ownerType === 'corporate').length;
  const corporateOwnershipRatio = corporateOwnedHomes / housingStock.length;
  if (corporatePolicy === 'unleashed' && corporateOwnershipRatio > 0.30) {
      if (seededRandom() < 0.25) {
          const newHomesInput = document.getElementById('new-homes-input');
          const currentNewHomes = parseInt(newHomesInput.value);
          if (currentNewHomes > 0) {
            newHomesInput.value = currentNewHomes - 1;
          }
      }
  }

  updateDisplay();
  renderVisualGrid();
}

function resetSimulation() {
    // NEW: Re-initialize the random number generator with the same seed
    seededRandom = createSeededRandom(12345);

    year = 1;
    newHomesPerYear = 3;
    turnoverRate = 0.04;
    corporatePolicy = 'unleashed';

    marketResults.purchasesByHomeowner = 0;
    marketResults.purchasesByCorporate = 0;
    marketResults.purchasesByIndividual = 0;
    marketResults.convertedToShortTerm = 0;
    
    document.getElementById('turnover-rate-input').value = 4;
    document.getElementById('new-homes-input').value = 3;
    document.getElementById('unleash-corporate-btn').classList.add('active');
    document.getElementById('restrict-corporate-btn').classList.remove('active');

    setupSimulation();
    updateDisplay();
    renderVisualGrid();
}

// --- DISPLAY & RENDERING ---
function updateDisplay() {
  const currentTotals = { homeowner: 0, individual: 0, corporate: 0 };
  housingStock.forEach(home => { if(home.ownerType) currentTotals[home.ownerType]++; });

  document.getElementById('current-homeowner-total').textContent = currentTotals.homeowner;
  document.getElementById('current-individual-total').textContent = currentTotals.individual;
  document.getElementById('current-corporate-total').textContent = currentTotals.corporate;
  
  const prices = housingStock.map(home => home.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];
  document.getElementById('median-home-price').textContent = `$${Math.round(medianPrice / 1000)}k`;

  document.getElementById('year-display').textContent = year; 
  document.getElementById('buyer-first-time').textContent = marketResults.purchasesByHomeowner;
  document.getElementById('buyer-corporate').textContent = marketResults.purchasesByCorporate;
  document.getElementById('buyer-individual').textContent = marketResults.purchasesByIndividual;
  document.getElementById('conversions-airbnb').textContent = marketResults.convertedToShortTerm;
}

function renderVisualGrid() {
  const grid = document.getElementById('housing-visual-grid');
  grid.innerHTML = ''; 
  housingStock.forEach(home => {
    const houseDiv = document.createElement('div');
    houseDiv.classList.add('house');

    // NEW LOGIC: If a home is a short-term rental, color it purple.
    // Otherwise, color it by its owner type.
    if (home.usage === 'ShortTermRental') {
      houseDiv.classList.add('shortterm');
    } else if (home.ownerType) {
      houseDiv.classList.add(home.ownerType); 
    }
    
    grid.appendChild(houseDiv);
  });
}

// --- INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
  // NEW: Initialize the random number generator on page load
  seededRandom = createSeededRandom(12345);

  setupSimulation();
  updateDisplay();
  renderVisualGrid();

  document.getElementById('next-year-btn').addEventListener('click', advanceYear);
  document.getElementById('reset-btn').addEventListener('click', resetSimulation);

  const unleashBtn = document.getElementById('unleash-corporate-btn');
  const restrictBtn = document.getElementById('restrict-corporate-btn');

  unleashBtn.addEventListener('click', () => {
    corporatePolicy = 'unleashed';
    unleashBtn.classList.add('active');
    restrictBtn.classList.remove('active');
  });

  restrictBtn.addEventListener('click', () => {
    corporatePolicy = 'restricted';
    restrictBtn.classList.add('active');
    unleashBtn.classList.remove('active');
  });
});
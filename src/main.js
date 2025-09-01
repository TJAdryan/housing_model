// --- STATE & CONSTANTS ---
const HOMES_TOTAL = 300;
const housingStock = [];
let year = 1;
let corporatePolicy = 'free'; // 'free', 'restrict', 'divest'
let strPolicy = 'free';       // 'free', 'restrict', 'ban'
let demandFactor = 1.0; 
let simulationIntervalId = null;

let seededRandom;
// Store initial values for percent change calculations
let initialOwnerOccupied = 0;
let initialIndividualLandlords = 0;
let initialCorporateLandlords = 0;
let initialApartmentsAvailable = 0;

// --- Helper: Seeded Random Number Generator ---
function createSeededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 2**32;
    return state / 2**32;
  };
}

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
    const price = 300000 + seededRandom() * 200000;
    // First 3 homes are short term rentals
    let usage = (i < 3) ? 'ShortTermRental' : 'LongTermRental';
    housingStock.push({
      id: i, ownerType: ownerType, type: 'SingleFamily',
      usage: usage, price: price, rent: price * 0.005, 
    });
  }
  // Set initial values for percent change
  initialOwnerOccupied = housingStock.filter(h => h.ownerType === 'homeowner').length;
  initialIndividualLandlords = housingStock.filter(h => h.ownerType === 'individual').length;
  initialCorporateLandlords = housingStock.filter(h => h.ownerType === 'corporate').length;
  initialApartmentsAvailable = housingStock.filter(h => h.ownerType !== 'homeowner' && h.usage === 'LongTermRental').length;
}

function advanceYear() {
  year++;
  const turnoverRate = parseFloat(document.getElementById('turnover-rate-input').value) / 100;
  let newHomesPerYear = parseInt(document.getElementById('new-homes-input').value);

  if (seededRandom() < 0.20) { demandFactor += 0.05; }

  const appreciationRate = (0.03 * demandFactor) + ((3 - newHomesPerYear) * 0.02);
  housingStock.forEach(home => {
    home.price *= (1 + appreciationRate);
    if (home.ownerType !== 'homeowner') { home.rent *= (1 + appreciationRate); }
  });

  const corporateOwnedHomes = housingStock.filter(h => h.ownerType === 'corporate');
  const corporateOwnershipRatio = corporateOwnedHomes.length / housingStock.length;

  if (corporatePolicy === 'divest' && corporateOwnershipRatio > 0.10) {
      const homeToSell = corporateOwnedHomes[Math.floor(seededRandom() * corporateOwnedHomes.length)];
      homeToSell.ownerType = seededRandom() < 0.7 ? 'individual' : 'homeowner';
  }

  const homesForSaleThisYear = Math.floor(housingStock.length * turnoverRate);

  for (let i = 0; i < homesForSaleThisYear; i++) {
    const homeIndex = Math.floor(seededRandom() * housingStock.length);
    const home = housingStock[homeIndex];
    const roll = seededRandom();
    let newOwnerType;

    let corpCanBuy = (corporatePolicy === 'free') || (corporatePolicy === 'restrict' && corporateOwnershipRatio < 0.10);

    if (corpCanBuy && roll < 0.60) {
        newOwnerType = 'corporate'; marketResults.purchasesByCorporate++;
    } else {
        const otherBuyerRoll = corpCanBuy ? (roll - 0.60) / 0.40 : roll;
        if (otherBuyerRoll < 0.625) { newOwnerType = 'individual'; marketResults.purchasesByIndividual++; } 
        else { newOwnerType = 'homeowner'; marketResults.purchasesByHomeowner++; }
    }
    home.ownerType = newOwnerType;
  }
  
  for (let i = 0; i < newHomesPerYear; i++) {
      const newId = housingStock.length;
      const newPrice = 400000 + seededRandom() * 250000;
      housingStock.push({ 
          id: newId, ownerType: null, type: 'SingleFamily', 
          usage: 'LongTermRental', price: newPrice, rent: newPrice * 0.005
      });
      const home = housingStock[newId];
      const roll = seededRandom();
      let newOwnerType;
      let corpCanBuy = (corporatePolicy === 'free') || (corporatePolicy === 'restrict' && corporateOwnershipRatio < 0.10);

      if (corpCanBuy && roll < 0.60) {
          newOwnerType = 'corporate'; marketResults.purchasesByCorporate++;
      } else {
          const otherBuyerRoll = corpCanBuy ? (roll - 0.60) / 0.40 : roll;
          if (otherBuyerRoll < 0.625) { newOwnerType = 'individual'; marketResults.purchasesByIndividual++; } 
          else { newOwnerType = 'homeowner'; marketResults.purchasesByHomeowner++; }
      }
      home.ownerType = newOwnerType;
  }

  if (strPolicy === 'ban') {
    housingStock.forEach(home => {
        if (home.usage === 'ShortTermRental' && seededRandom() < 0.20) { home.usage = 'LongTermRental'; }
    });
  }

  const strHomes = housingStock.filter(h => h.usage === 'ShortTermRental').length;
  const strRatio = strHomes / housingStock.length;
  const longTermRentals = housingStock.filter(h => h.ownerType !== 'homeowner' && h.usage === 'LongTermRental');

  // Select 10% of long-term rentals as vacant
  const vacancyRate = 0.1;
  const numVacant = Math.floor(longTermRentals.length * vacancyRate);
  // Shuffle longTermRentals to randomize selection
  const shuffled = [...longTermRentals];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const vacantUnits = shuffled.slice(0, numVacant);
  vacantUnits.forEach(unit => {
    let canConvertToSTR = (strPolicy === 'free') || (strPolicy === 'restrict' && strRatio < 0.10);
    if (canConvertToSTR && seededRandom() < 0.05) {
      unit.usage = 'ShortTermRental';
      marketResults.convertedToShortTerm++;
    }
  });

  if (corporatePolicy === 'free' && corporateOwnershipRatio > 0.30) {
      if (seededRandom() < 0.25) {
          const newHomesInput = document.getElementById('new-homes-input');
          if (parseInt(newHomesInput.value) > 0) { newHomesInput.value--; }
      }
  }

  updateDisplay();
  renderVisualGrid();
}

const allControls = ['run-simulation-btn', 'reset-btn', 'next-year-btn', 'corp-policy-free', 'corp-policy-restrict', 'corp-policy-divest', 'str-policy-free', 'str-policy-restrict', 'str-policy-ban', 'turnover-rate-input', 'new-homes-input', 'years-to-run-input'];

function toggleControls(disabled) {
    allControls.forEach(id => { document.getElementById(id).disabled = disabled; });
}

function runSimulation() {
  const yearsToRun = parseInt(document.getElementById('years-to-run-input').value);
  if (yearsToRun <= 0 || simulationIntervalId) return;
  
  let yearsElapsed = 0;
  toggleControls(true);

  simulationIntervalId = setInterval(() => {
    if (yearsElapsed >= yearsToRun) {
      clearInterval(simulationIntervalId);
      simulationIntervalId = null;
      toggleControls(false);
      return;
    }
    advanceYear();
    yearsElapsed++;
  }, 500);
}

function resetSimulation() {
    if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
        simulationIntervalId = null;
    }
    
    seededRandom = createSeededRandom(12345);
    year = 1;
    demandFactor = 1.0; 
    corporatePolicy = 'free';
    strPolicy = 'free';

    Object.keys(marketResults).forEach(key => marketResults[key] = 0);
    
    document.getElementById('turnover-rate-input').value = 4;
    document.getElementById('new-homes-input').value = 3;
    document.getElementById('years-to-run-input').value = 1;

    document.querySelectorAll('.policy-controls button').forEach(b => b.classList.remove('active'));
    document.getElementById('corp-policy-free').classList.add('active');
    document.getElementById('str-policy-free').classList.add('active');

    toggleControls(false);
    setupSimulation();
    updateDisplay();
    renderVisualGrid();
}

function updateDisplay() {

  const currentTotals = { homeowner: 0, individual: 0, corporate: 0 };
  housingStock.forEach(home => { if(home.ownerType) currentTotals[home.ownerType]++; });

  // Calculate percent changes from initial values (after currentTotals is initialized)
  const currentOwnerOccupied = currentTotals.homeowner;
  const currentIndividualLandlords = currentTotals.individual;
  const currentCorporateLandlords = currentTotals.corporate;
  const currentApartmentsAvailable = housingStock.filter(h => h.ownerType !== 'homeowner' && h.usage === 'LongTermRental').length;

  const pctOwnerOccupied = initialOwnerOccupied ? ((currentOwnerOccupied - initialOwnerOccupied) / initialOwnerOccupied * 100) : 0;
  const pctIndividualLandlords = initialIndividualLandlords ? ((currentIndividualLandlords - initialIndividualLandlords) / initialIndividualLandlords * 100) : 0;
  const pctCorporateLandlords = initialCorporateLandlords ? ((currentCorporateLandlords - initialCorporateLandlords) / initialCorporateLandlords * 100) : 0;
  const pctApartmentsAvailable = initialApartmentsAvailable ? ((currentApartmentsAvailable - initialApartmentsAvailable) / initialApartmentsAvailable * 100) : 0;

  document.getElementById('pct-owner-occupied').textContent = (pctOwnerOccupied >= 0 ? '+' : '') + pctOwnerOccupied.toFixed(1) + '%';
  document.getElementById('pct-individual-landlords').textContent = (pctIndividualLandlords >= 0 ? '+' : '') + pctIndividualLandlords.toFixed(1) + '%';
  document.getElementById('pct-corporate-landlords').textContent = (pctCorporateLandlords >= 0 ? '+' : '') + pctCorporateLandlords.toFixed(1) + '%';
  document.getElementById('pct-apartments-available').textContent = (pctApartmentsAvailable >= 0 ? '+' : '') + pctApartmentsAvailable.toFixed(1) + '%';

  document.getElementById('current-homeowner-total').textContent = currentTotals.homeowner;
  document.getElementById('current-individual-total').textContent = currentTotals.individual;
  document.getElementById('current-corporate-total').textContent = currentTotals.corporate;
  
  const prices = housingStock.map(home => home.price).sort((a, b) => a - b);
  const midPrice = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0 ? (prices[midPrice - 1] + prices[midPrice]) / 2 : prices[midPrice];
  document.getElementById('median-home-price').textContent = `$${Math.round(medianPrice / 1000)}k`;

  const rentalProperties = housingStock.filter(h => h.ownerType !== 'homeowner');
  if (rentalProperties.length > 0) {
    const rents = rentalProperties.map(h => h.rent).sort((a, b) => a - b);
    const midRent = Math.floor(rents.length / 2);
    const medianRent = rents.length % 2 === 0 ? (rents[midRent - 1] + rents[midRent]) / 2 : rents[midRent];
    document.getElementById('median-rent').textContent = `$${Math.round(medianRent).toLocaleString()}`;
  } else {
    document.getElementById('median-rent').textContent = 'N/A';
  }


    const availableRentals = rentalProperties.filter(h => h.usage === 'LongTermRental').length;
    document.getElementById('available-rental-units').textContent = availableRentals;

    // Update total homes
    document.getElementById('total-homes').textContent = housingStock.length;

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
    if (home.usage === 'ShortTermRental') {
      houseDiv.classList.add('shortterm');
    } else if (home.ownerType) {
      houseDiv.classList.add(home.ownerType); 
    }
    grid.appendChild(houseDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  seededRandom = createSeededRandom(12345);
  setupSimulation();
  updateDisplay();
  renderVisualGrid();

  document.getElementById('run-simulation-btn').addEventListener('click', runSimulation);
  document.getElementById('next-year-btn').addEventListener('click', advanceYear);
  document.getElementById('reset-btn').addEventListener('click', resetSimulation);

  function setupPolicyGroup(groupId, stateUpdater) {
      const group = document.getElementById(groupId);
      group.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON') {
              const policy = e.target.id.split('-').pop();
              stateUpdater(policy);
              group.querySelector('.active').classList.remove('active');
              e.target.classList.add('active');
          }
      });
  }

  setupPolicyGroup('corporate-policy-group', (p) => corporatePolicy = p);
  setupPolicyGroup('str-policy-group', (p) => strPolicy = p);
});
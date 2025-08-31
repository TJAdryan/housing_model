// main.js

import './style.css'

import './style.css'

// 1. SELECT THE ELEMENTS WE NEED TO CONTROL
const yearDisplay = document.querySelector('#year-display');
const priceDisplay = document.querySelector('#price-display');
const homeownersDisplay = document.querySelector('#homeowners-display');
const rentersDisplay = document.querySelector('#renters-display');

const nextYearButton = document.querySelector('#next-year-button');

const populationDisplay = document.querySelector('#population-display');
const housingDisplay = document.querySelector('#housing-display');

// 2. SET UP THE INITIAL STATE AND SETUP FUNCTION
let modelState = {}; // Leave it empty for now

function setupSimulation() {
  modelState = {
    year: 0,
    averageHomePrice: 500000,
    homeowners: 0,
    renters: 1000,
    population: [],
    housingStock: [],
  };

  // Create the population
  for (let i = 0; i < 1000; i++) {
    let householdType = 'renter';
    if (i < 20) {
      householdType = 'investor';
    } else if (i < 600) {
      householdType = 'mortgageReady';
    }
    modelState.population.push({ id: i, type: householdType, isHomeowner: false });
  }

  // Create the housing stock
  for (let i = 0; i < 300; i++) {
    modelState.housingStock.push({ id: i, status: 'forSale', owner: null });
  }


  updateDisplay();
}

function advanceYear() {
  // A. Update the year and prices
  modelState.year += 1;
  modelState.averageHomePrice *= 1.05; // Slow down appreciation to 5% per year

  // B. Simulate a small number of new homes coming to market
  const newHomesForSale = 15;
  for (let i = 0; i < newHomesForSale; i++) {
    const newId = modelState.housingStock.length;
    modelState.housingStock.push({ id: newId, status: 'forSale', owner: null });
  }

  // C. Run the market simulation for the newly available homes
  const availableHomes = modelState.housingStock.filter(h => h.status === 'forSale');

  // Investors get first pick of a few new homes
  const investorPurchases = Math.min(availableHomes.length, 3); // Investors buy up to 3
  availableHomes.slice(0, investorPurchases).forEach(house => house.status = 'rental');

  // Mortgage-ready renters compete for the rest
  const homesForBuyers = availableHomes.slice(investorPurchases);
  const potentialBuyers = modelState.population.filter(p => !p.isHomeowner && p.type === 'mortgageReady');

  homesForBuyers.forEach((house, index) => {
    if (index < potentialBuyers.length) {
      house.status = 'owned';
      potentialBuyers[index].isHomeowner = true;
    }
  });

  // D. Recalculate homeowner and renter counts
  modelState.homeowners = modelState.population.filter(p => p.isHomeowner).length;
  modelState.renters = 1000 - modelState.homeowners;

  // E. Update the display on the screen
  updateDisplay();
}
function updateDisplay() {
  yearDisplay.textContent = modelState.year;
  priceDisplay.textContent = '
// src/main.js

function renderVisuals() {
  // Clear previous visuals
  housingDisplay.innerHTML = '';

  // Draw each house in the housing stock
  modelState.housingStock.forEach(house => {
    const houseElement = document.createElement('div');
    houseElement.classList.add('house-icon');
    houseElement.classList.add(house.status); // Adds 'forSale', 'owned', or 'rental' as a class
    housingDisplay.appendChild(houseElement);
  });
}

// 4. ATTACH THE LOGIC TO THE BUTTON
setupSimulation(); // 1. Set up the initial data.
nextYearButton.addEventListener('click', advanceYear); // 2. THEN, tell the button how to use that data.
} + Math.round(modelState.averageHomePrice).toLocaleString();
  homeownersDisplay.textContent = modelState.homeowners;
  rentersDisplay.textContent = modelState.renters;

  renderVisuals(); // This line is crucial!
}
// src/main.js

function renderVisuals() {
  // Clear previous visuals
  housingDisplay.innerHTML = '';

  // Draw each house in the housing stock
  modelState.housingStock.forEach(house => {
    const houseElement = document.createElement('div');
    houseElement.classList.add('house-icon');
    houseElement.classList.add(house.status); // Adds 'forSale', 'owned', or 'rental' as a class
    housingDisplay.appendChild(houseElement);
  });
}

// 4. ATTACH THE LOGIC TO THE BUTTON
setupSimulation(); // 1. Set up the initial data.
nextYearButton.addEventListener('click', advanceYear); // 2. THEN, tell the button how to use that data.
// src/main.js

function renderVisuals() {
  // Clear previous visuals
  housingDisplay.innerHTML = '';

  // Draw each house in the housing stock
  modelState.housingStock.forEach(house => {
    const houseElement = document.createElement('div');
    houseElement.classList.add('house-icon');
    houseElement.classList.add(house.status); // Adds 'forSale', 'owned', or 'rental' as a class
    housingDisplay.appendChild(houseElement);
  });
}

// 4. ATTACH THE LOGIC TO THE BUTTON
setupSimulation(); // 1. Set up the initial data.
nextYearButton.addEventListener('click', advanceYear); // 2. THEN, tell the button how to use that data.
}
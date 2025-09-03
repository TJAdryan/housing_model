import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Constants ---
const HOMES_TOTAL = 300;

// --- Helper Components ---
const Card = ({ label, value }) => (
  <div className="bg-white p-3 rounded-lg shadow text-center">
    <label className="block text-xs text-gray-500 mb-1 font-medium">{label}</label>
    <span className="text-xl font-bold text-gray-800">{value}</span>
  </div>
);

const PolicyButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 text-sm rounded-md transition-colors ${
      isActive
        ? 'bg-slate-800 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
  >
    {label}
  </button>
);

// --- Main App Component ---
export default function App() {
  // --- State Management ---
  const [year, setYear] = useState(1);
  const [housingStock, setHousingStock] = useState([]);
  const [corporatePolicy, setCorporatePolicy] = useState('free');
  const [strPolicy, setStrPolicy] = useState('free');
  const [demandFactor, setDemandFactor] = useState(1.0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  
  const [turnoverRate, setTurnoverRate] = useState(4);
  const [newHomes, setNewHomes] = useState(3);
  const [yearsToRun, setYearsToRun] = useState(1);

  // Use refs for values that change but shouldn't trigger re-renders on their own
  const marketResults = useRef({
    purchasesByHomeowner: 0,
    purchasesByCorporate: 0,
    purchasesByIndividual: 0,
    convertedToShortTerm: 0,
  });

  const initialStats = useRef({
    ownerOccupied: 0,
    individualLandlords: 0,
    corporateLandlords: 0,
    apartmentsAvailable: 0,
  });
  
  // Seeded random number generator ref to persist it across renders
  const seededRandom = useRef(createSeededRandom(12345));

  // --- Utility Functions ---
  function createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 2**32;
      return state / 2**32;
    };
  }
  
  // --- Core Simulation Logic ---
  const setupSimulation = useCallback(() => {
    const newHousingStock = [];
    for (let i = 0; i < HOMES_TOTAL; i++) {
      let ownerType;
      if (i < 25) ownerType = 'corporate';
      else if (i < 105) ownerType = 'individual';
      else ownerType = 'homeowner';
      
      const price = 300000 + seededRandom.current() * 200000;
      let usage = (i < 3) ? 'ShortTermRental' : 'LongTermRental';
      
      newHousingStock.push({
        id: i,
        ownerType: ownerType,
        usage: usage,
        price: price,
        rent: price * 0.005,
      });
    }
    setHousingStock(newHousingStock);

    // Set initial values for percent change calculations
    initialStats.current = {
        ownerOccupied: newHousingStock.filter(h => h.ownerType === 'homeowner').length,
        individualLandlords: newHousingStock.filter(h => h.ownerType === 'individual').length,
        corporateLandlords: newHousingStock.filter(h => h.ownerType === 'corporate').length,
        apartmentsAvailable: newHousingStock.filter(h => h.ownerType !== 'homeowner' && h.usage === 'LongTermRental').length,
    };
  }, []);

  const advanceYear = useCallback(() => {
    setHousingStock(prevStock => {
      let newDemandFactor = demandFactor;
      if (seededRandom.current() < 0.20) {
        newDemandFactor += 0.05;
        setDemandFactor(newDemandFactor);
      }

      const appreciationRate = (0.03 * newDemandFactor) + ((3 - newHomes) * 0.02);
      let stock = JSON.parse(JSON.stringify(prevStock)); // Deep copy to avoid mutation
      
      stock.forEach(home => {
        home.price *= (1 + appreciationRate);
        if (home.ownerType !== 'homeowner') {
          home.rent *= (1 + appreciationRate);
        }
      });
      
      const corporateOwnershipRatio = stock.filter(h => h.ownerType === 'corporate').length / stock.length;
      
      const homesForSaleThisYear = Math.floor(stock.length * (turnoverRate / 100));
      for (let i = 0; i < homesForSaleThisYear; i++) {
        const homeIndex = Math.floor(seededRandom.current() * stock.length);
        const home = stock[homeIndex];
        const roll = seededRandom.current();
        let newOwnerType;

        let corpCanBuy = (corporatePolicy === 'free') || (corporatePolicy === 'restrict' && corporateOwnershipRatio < 0.10);

        if (corpCanBuy && roll < 0.60) {
            newOwnerType = 'corporate';
            marketResults.current.purchasesByCorporate++;
        } else {
            const otherBuyerRoll = corpCanBuy ? (roll - 0.60) / 0.40 : roll;
            if (otherBuyerRoll < 0.625) {
                newOwnerType = 'individual';
                marketResults.current.purchasesByIndividual++;
            } else {
                newOwnerType = 'homeowner';
                marketResults.current.purchasesByHomeowner++;
            }
        }
        home.ownerType = newOwnerType;
      }
      
      for (let i = 0; i < newHomes; i++) {
        const newId = stock.length;
        const newPrice = 400000 + seededRandom.current() * 250000;
        const newHome = {
          id: newId, ownerType: null, usage: 'LongTermRental', 
          price: newPrice, rent: newPrice * 0.005
        };
        stock.push(newHome);
        const roll = seededRandom.current();
        let corpCanBuy = (corporatePolicy === 'free') || (corporatePolicy === 'restrict' && corporateOwnershipRatio < 0.10);

        if (corpCanBuy && roll < 0.60) {
            newHome.ownerType = 'corporate'; marketResults.current.purchasesByCorporate++;
        } else {
            const otherBuyerRoll = corpCanBuy ? (roll - 0.60) / 0.40 : roll;
            if (otherBuyerRoll < 0.625) { newHome.ownerType = 'individual'; marketResults.current.purchasesByIndividual++; } 
            else { newHome.ownerType = 'homeowner'; marketResults.current.purchasesByHomeowner++; }
        }
      }

      const strRatio = stock.filter(h => h.usage === 'ShortTermRental').length / stock.length;
      const vacantUnits = stock.filter(h => h.ownerType !== 'homeowner' && h.usage === 'LongTermRental');
      vacantUnits.forEach(unit => {
        let canConvertToSTR = (strPolicy === 'free') || (strPolicy === 'restrict' && strRatio < 0.10);
        if (canConvertToSTR && seededRandom.current() < 0.05) {
          unit.usage = 'ShortTermRental';
          marketResults.current.convertedToShortTerm++;
        }
      });
      
      return stock;
    });
    setYear(prevYear => prevYear + 1);
  }, [demandFactor, newHomes, turnoverRate, corporatePolicy, strPolicy]);

  // --- Effects ---
  useEffect(() => {
    setupSimulation();
  }, [setupSimulation]);

  useEffect(() => {
    if (!simulationRunning) return;
    
    let yearsElapsed = 0;
    const intervalId = setInterval(() => {
      if (yearsElapsed >= yearsToRun) {
        setSimulationRunning(false);
        return;
      }
      advanceYear();
      yearsElapsed++;
    }, 500);

    return () => clearInterval(intervalId);
  }, [simulationRunning, yearsToRun, advanceYear]);


  // --- Event Handlers ---
  const handleRunSimulation = () => {
    if (!simulationRunning) {
      setSimulationRunning(true);
    }
  };

  const handleReset = () => {
    setSimulationRunning(false);
    setYear(1);
    setDemandFactor(1.0);
    setCorporatePolicy('free');
    setStrPolicy('free');
    setTurnoverRate(4);
    setNewHomes(3);
    setYearsToRun(1);
    marketResults.current = {
      purchasesByHomeowner: 0,
      purchasesByCorporate: 0,
      purchasesByIndividual: 0,
      convertedToShortTerm: 0,
    };
    seededRandom.current = createSeededRandom(12345);
    setupSimulation();
  };

  // --- Data Computations for Display ---
  const currentTotals = housingStock.reduce((acc, home) => {
    if (home.ownerType) {
      acc[home.ownerType] = (acc[home.ownerType] || 0) + 1;
    }
    return acc;
  }, { homeowner: 0, individual: 0, corporate: 0 });

  const prices = housingStock.map(home => home.price).sort((a, b) => a - b);
  const midPrice = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0 ? (prices[midPrice - 1] + prices[midPrice]) / 2 : prices[midPrice];

  const rentalProperties = housingStock.filter(h => h.ownerType !== 'homeowner');
  const rents = rentalProperties.map(h => h.rent).sort((a, b) => a - b);
  const midRent = Math.floor(rents.length / 2);
  const medianRent = rents.length > 0 ? (rents.length % 2 === 0 ? (rents[midRent - 1] + rents[midRent]) / 2 : rents[midRent]) : 0;
  
  const availableRentals = rentalProperties.filter(h => h.usage === 'LongTermRental').length;
  
  const getPercentChange = (initial, current) => {
    if (initial === 0) return '0.0%';
    const change = ((current - initial) / initial) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const pctOwnerOccupied = getPercentChange(initialStats.current.ownerOccupied, currentTotals.homeowner);
  const pctIndividualLandlords = getPercentChange(initialStats.current.individualLandlords, currentTotals.individual);
  const pctCorporateLandlords = getPercentChange(initialStats.current.corporateLandlords, currentTotals.corporate);
  const pctApartmentsAvailable = getPercentChange(initialStats.current.apartmentsAvailable, availableRentals);


  // --- Render ---
  return (
    <div className="bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center pb-4 mb-6 border-b">
          <h1 className="text-4xl font-bold text-gray-800">Housing Market Simulation</h1>
          <p className="text-gray-600 mt-2">An interactive model for housing market dynamics.</p>
        </header>

        <div className="space-y-4 mb-8">
            {/* Top Row Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Parameter Controls */}
                    <div className="bg-white p-3 rounded-lg shadow flex gap-4 items-center">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Turnover Rate (%)</label>
                            <input type="number" value={turnoverRate} onChange={e => setTurnoverRate(Number(e.target.value))} className="w-20 p-1 border rounded-md text-center"/>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">New Homes</label>
                            <input type="number" value={newHomes} onChange={e => setNewHomes(Number(e.target.value))} className="w-20 p-1 border rounded-md text-center"/>
                        </div>
                    </div>
                     {/* Sim Controls */}
                    <div className="bg-white p-3 rounded-lg shadow flex gap-3 items-center">
                        <button onClick={handleRunSimulation} disabled={simulationRunning} className="bg-green-600 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                           {simulationRunning ? 'Running...' : 'Run Sim'}
                        </button>
                        <div className="flex items-center gap-2">
                             <label className="text-xs font-medium text-gray-500">for</label>
                             <input type="number" value={yearsToRun} onChange={e => setYearsToRun(Number(e.target.value))} className="w-16 p-1 border rounded-md text-center"/>
                             <span className="text-xs font-medium text-gray-500">years</span>
                        </div>
                    </div>
                </div>
                {/* Action Buttons & Year Display */}
                <div className="flex items-center gap-4">
                    <button onClick={handleReset} disabled={simulationRunning} className="bg-yellow-500 text-white font-bold px-5 py-2.5 rounded-md hover:bg-yellow-600 disabled:bg-gray-400">Reset</button>
                    <button onClick={advanceYear} disabled={simulationRunning} className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-md hover:bg-blue-700 disabled:bg-gray-400">Advance Year</button>
                    <div className="text-2xl font-bold text-gray-700">Year: <span className="text-blue-600">{year}</span></div>
                </div>
            </div>
            {/* Bottom Row Controls */}
            <div className="flex flex-wrap gap-4 justify-center">
                 <div className="bg-white p-2 rounded-lg shadow flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-600">Corporate Policy:</label>
                    <PolicyButton label="Free Reign" isActive={corporatePolicy === 'free'} onClick={() => setCorporatePolicy('free')} />
                    <PolicyButton label="Restrict to 10%" isActive={corporatePolicy === 'restrict'} onClick={() => setCorporatePolicy('restrict')} />
                 </div>
                  <div className="bg-white p-2 rounded-lg shadow flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-600">Short-Term Rental Policy:</label>
                    <PolicyButton label="Free Reign" isActive={strPolicy === 'free'} onClick={() => setStrPolicy('free')} />
                    <PolicyButton label="Restrict to 10%" isActive={strPolicy === 'restrict'} onClick={() => setStrPolicy('restrict')} />
                 </div>
            </div>
        </div>
        
        <main>
          <h3 className="text-2xl font-bold text-center text-gray-700 mb-4">Current Ownership & Market Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card label="Homeowner" value={currentTotals.homeowner} />
            <Card label="Individual Landlord" value={currentTotals.individual} />
            <Card label="Corporate Landlord" value={currentTotals.corporate} />
            <Card label="Median Home Price" value={`$${Math.round(medianPrice / 1000)}k`} />
            <Card label="Median Rent" value={`$${Math.round(medianRent).toLocaleString()}`} />
            <Card label="Total Rental Units" value={availableRentals} />
            <Card label="Total Homes" value={housingStock.length} />
          </div>

          <div id="housing-visual-grid" className="grid grid-cols-30 gap-0.5 p-1.5 bg-gray-300 rounded-lg">
             {housingStock.map(home => {
                let bgColor = 'bg-gray-400';
                if (home.usage === 'ShortTermRental') bgColor = 'bg-purple-500';
                else if (home.ownerType === 'homeowner') bgColor = 'bg-green-500';
                else if (home.ownerType === 'individual') bgColor = 'bg-blue-500';
                else if (home.ownerType === 'corporate') bgColor = 'bg-red-500';
                return <div key={home.id} className={`w-full pt-[80%] ${bgColor}`}></div>
             })}
          </div>

           <div className="flex justify-center flex-wrap gap-6 mt-4 text-sm p-4 bg-white rounded-lg shadow">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div>Homeowner</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div>Individual Landlord</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div>Corporate Landlord</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div>Short-Term Rental</div>
           </div>

           <hr className="my-10 border-gray-300" />
           
           <h3 className="text-2xl font-bold text-center text-gray-700 mb-4">Market Activity (Total Since Start)</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
               <Card label="Primary Home Purchasers" value={marketResults.current.purchasesByHomeowner} />
               <Card label="Corporate Landlords" value={marketResults.current.purchasesByCorporate} />
               <Card label="Individual Landlords" value={marketResults.current.purchasesByIndividual} />
               <Card label="Converted to Short-Term" value={marketResults.current.convertedToShortTerm} />
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card label="% Change Owner-Occupied" value={pctOwnerOccupied} />
                <Card label="% Change Individual Landlords" value={pctIndividualLandlords} />
                <Card label="% Change Corporate Landlords" value={pctCorporateLandlords} />
                <Card label="% Change Rentals Available" value={pctApartmentsAvailable} />
           </div>

        </main>
      </div>
    </div>
  );
}

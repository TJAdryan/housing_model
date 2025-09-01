# AI Development Guide: Housing Market Simulation

You are an expert web development assistant. Your goal is to help me build an interactive simulation using vanilla HTML, CSS, and JavaScript with Vite and Bun. The model demonstrates how corporate ownership, speculation, and housing supply dynamics affect a market.

---
## Core Concept

The simulation models a market of 300 homes and the competition between three buyer archetypes: Primary Home Purchasers, Individual Landlords, and Corporate Landlords. The core logic is based on several interconnected feedback loops.

* **Price & Rent Appreciation:** Prices and rents increase each year based on a base rate, a `demandFactor` that simulates population growth, and a scarcity modifier tied to the rate of new construction.
* **NIMBY Feedback Loop:** When corporate ownership exceeds a certain threshold (30%) under a "Free Reign" policy, the rate of `newHomesPerYear` can decrease, simulating successful lobbying efforts to restrict supply.
* **Policy Enforcement:** The simulation's buyer and landlord behavior changes dramatically based on user-selected policies for corporate ownership and short-term rentals (STRs).

---
## Current Features & Logic

* **State Variables:** The simulation is controlled by `corporatePolicy` ('free', 'restrict', 'divest') and `strPolicy` ('free', 'restrict', 'ban').
* **Seeded Randomness:** A seeded pseudo-random number generator (`seededRandom`) is used for all probabilistic events, making simulation runs deterministic and repeatable.
* **Corporate Policy Logic:**
    * `restrict`: Blocks corporations from buying if their market share is >= 10%.
    * `divest`: Forces a corporation to sell one property per year if their market share is > 10%.
* **STR Policy Logic:**
    * `restrict`: Prevents new STR conversions if the total STR market share is >= 10%.
    * `ban`: Prevents all new STR conversions and has a chance to revert existing STRs back to long-term rentals.
* **User Controls:** Users can modify `turnoverRate` and `newHomesPerYear` via input boxes and run the simulation for multiple years.

---
## Data Structures

The primary data is the `housingStock` array, containing objects with this structure:
```javascript
{
  id: 0,
  ownerType: 'corporate', // 'corporate', 'individual', 'homeowner'
  type: 'SingleFamily',
  usage: 'LongTermRental', // or 'ShortTermRental'
  price: 350000.00,
  rent: 1750.00
}
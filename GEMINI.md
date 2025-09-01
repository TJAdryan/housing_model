### AI Development Guide for "The Wealth Gap Amplifier"

#### Project Overview

You are an expert web development assistant. Your goal is to help me build an interactive simulation called "The Wealth Gap Amplifier" using vanilla HTML, CSS, and JavaScript. The model demonstrates how housing market dynamics, specifically those found in a market like New York City, increase wealth inequality over time.

-----

#### Core Concept: A Dynamic Housing Ecosystem

The simulation models a community of 1,000 households and an initial stock of 300 housing properties. The model is designed to be a more realistic ecosystem with fluid roles and strategic decisions.

  * **Population Groups & Roles:** A household's role is determined by its assets and actions, not a static label.
      * **Renters:** The default status for most households, seeking to rent housing.
      * **Homeowners:** Households that own their primary residence.
      * **Landlords:** This is not an exclusive role. Any household that owns property that generates rental income is a landlord. We model three distinct tiers:
          * **Corporate Landlords:** A small group of powerful entities with massive starting capital and a significant advantage in purchasing large multi-unit properties.
          * **Individual Landlords:** Mid-tier players who function like small businesses, owning several properties or small buildings.
          * **Incidental Landlords:** Regular homeowners who also own one or two additional properties that they rent out.
  * **The Housing Model:** The housing stock is a mix of property types reflecting an urban market. A key feature is the **`usage`** of a property, which can change.
      * **Property Types:** `SingleFamily`, `Coop`, `RentalBuilding`.
      * **Property Usage:**
          * `PrimaryResidence`: Owned and occupied by a household.
          * `LongTermRental`: A standard rental unit available to the simulated population.
          * `ShortTermRental`: An "Airbnb-style" unit that generates higher income for the owner but is **removed from the available housing supply** for renters.
      * **Rent Stabilization:** A percentage of rental units are rent-stabilized, limiting annual rent increases and creating a two-tiered rental market.
  * **Simulation Progression:** Each "year" (triggered by a button click), the simulation advances:
      * Home prices and rents appreciate based on market dynamics.
      * Households save a portion of their income. Landlords collect rent.
      * Landlords may strategically convert long-term rentals to more profitable short-term rentals.
      * All types of buyers (Households, Individual Landlords, Corporate Landlords) compete for the small number of homes on the market, with wealthier buyers having a significant advantage.

-----

#### Data Model Evolution

To support this nuanced logic, the core data structures have evolved:

  * **Household Object:** Uses a `type` to differentiate behavior and starting capital.

    ```javascript
    {
        id: 123,
        income: 90000,
        savings: 75000,
        type: 'Household' // or 'IndividualLandlord', 'CorporateLandlord'
    }
    ```

  * **Housing Object:** A `usage` property is crucial. For multi-unit buildings, this is handled at the unit level.

    ```javascript
    {
        id: 45,
        type: 'RentalBuilding',
        ownerId: 5, // A landlord's ID
        units: [
            { tenantId: 201, rent: 3200, usage: 'LongTermRental' },
            { tenantId: null, rent: 5500, usage: 'ShortTermRental' }
        ]
    }
    ```

-----

#### Current Status & Code Breakdown

The project is functional and the core simulation engine is working. The initial development goals have been largely met, and significant progress has been made on UI and interactivity.

*   `index.html`: Contains the single-page layout for a main header, a dashboard, and a simulation area. It now includes a view toggle to switch between different visualizations.
*   `src/main.js`: Holds all the application logic.
    *   `modelState`: A JavaScript object that stores all the data for the simulation.
    *   `setupSimulation()`: Initializes the simulation with a realistic distribution of owned homes, rental buildings, and homes for sale, including initial short-term rental units.
    *   `advanceYear()`: The main function that runs when the "Next Year" button is clicked. It updates the year, appreciates prices, runs the market simulation (including landlord decisions based on profitability), and updates wealth data.
    *   `updateDisplay()`: Updates the text content on the dashboard with key metrics (Homeownership Rate, Median Savings, Renter/Homeowner/Landlord Wealth, Short-Term Rental Units).
    *   `renderVisuals()`: Renders the household status visualization (1,000 households color-coded by status) and the wealth chart.
    *   `renderHousingStock()`: **NEW** Renders the housing stock visualization (300 properties color-coded by usage: Primary Residence, Long-Term Rental, Short-Term Rental, For Sale).
*   `src/style.css`: Provides a clean, modern layout and styles for the dashboard and the simulation visuals, including distinct styles for both household and housing stock visualizations and their legends.

*   **Visualizations & Interactivity:**
    *   **View Toggle:** Users can now switch between "Household Status" and "Housing Stock" visualizations.
    *   **Household Status:** Displays 1,000 household icons, color-coded by their status (Renter, Homeowner, Landlord). Icons with a red border indicate households living in short-term rentals.
    *   **Housing Stock:** Displays 300 property icons, color-coded by their usage (Primary Residence, Long-Term Rental, Short-Term Rental, For Sale). Includes a clear legend.
    *   **Wealth Chart:** A line chart showing the total wealth of Renters, Homeowners, and Landlords over time.
    *   **Dashboard Metrics:** Enhanced to include Homeownership Rate, Median Savings, and total wealth for each population group, and Short-Term Rental Units count.
    *   **Interactive Controls:** Users can adjust:
        *   **New Homes Per Year:** Controls the number of new properties added to the market each year.
        *   **Interest Rate:** Influences mortgage affordability for buyers.
        *   **Short-Term Rental Tax:** Affects the profitability of converting units to short-term rentals.

-----

#### Next Development Goals

With the core simulation, UI, and interactivity in place, the next steps are to enhance the simulation's depth and analytical capabilities:

*   **Refine Simulation Logic:**
    *   Model the rental market more explicitly, with rent prices and vacancy rates.
    *   Implement `Rent Stabilization` logic as described in the Core Concept.
*   **Add More Metrics:**
    *   Calculate and display other relevant metrics, such as the homeownership rate for first-time buyers specifically.
*   **Further Interactivity:**
    *   Allow the user to adjust other simulation parameters, such as initial population distribution or property appreciation rates.

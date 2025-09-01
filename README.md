# Housing Market Simulation

An interactive web-based model that demonstrates how corporate ownership, housing supply, and market policies affect home and rent prices.



---
## About The Project

This simulation models a housing market of 300 properties to visualize the impact of various economic forces. Users can adjust parameters and enact policies to see how the market balance shifts between regular homeowners, individual landlords, and large corporate landlords over time.

The core of the simulation is a feedback loop where increased corporate ownership can lead to reduced housing supply, which in turn drives up prices and makes it easier for cash-rich buyers to acquire more properties.

---
## Features

* **Dynamic Market:** Watch median home prices and rents appreciate based on supply and demand.
* **Multiple Buyer Types:** See how Primary Home Purchasers compete against Individual and Corporate Landlords, each with different advantages.
* **Interactive Parameters:** Adjust the housing turnover rate and the amount of new construction to see the immediate impact on the market.
* **Advanced Policy Controls:** Experiment with different regulatory environments:
    * **Corporate Policy:** Allow free reign, restrict corporate ownership to a 10% market share, or even force corporations to divest their properties.
    * **Short-Term Rental Policy:** Allow unregulated conversions, restrict them to a 10% cap, or ban them entirely.
* **Multi-Year Simulation:** Run the simulation for up to 100 years at a time to quickly see long-term trends.
* **Visual Dashboard:** Track key metrics like ownership distribution, median prices, and total purchases on a clean, easy-to-read dashboard.
* **Visual Housing Grid:** A color-coded grid represents every home in the market, providing an at-a-glance view of the ownership landscape.

---
## Built With

* Vanilla HTML, CSS & JavaScript
* [Vite](https://vitejs.dev/)
* [Bun](https://bun.sh/)

---
## Getting Started

To get a local copy up and running, follow these simple steps.

1.  Clone the repo
    ```sh
    git clone https://github.com/tja_dryan/housing_model.git
    ```
2.  Install dependencies
    ```sh
    bun install
    ```
3.  Run the development server
    ```sh
    bun dev
    ```
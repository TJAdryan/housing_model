Brainstormer

Show thinking
Of course. Providing a clear, updated summary is a great idea to get a new assistant up to speed quickly.

Here is an updated README.md file that explains the project's purpose, its current features, and how to run it.

The Wealth Gap Amplifier: An Interactive Model
This project is an interactive web-based model designed to demonstrate how housing market dynamics can perpetuate a wealth crisis and worsen economic inequality. It visually simulates a housing market over multiple years, showing how an initial wealth disparity is magnified through mechanisms like cash buying and an ongoing shortage of new homes.

Current Project Status
The model is partially implemented and functional. The current features include:

Interactive Controls: A "Next Year" button advances the simulation one year at a time.

Dynamic Dashboard: The dashboard displays the current year, average home price, and the total number of homeowners and renters, all of which update annually.

Market Simulation Logic:

The simulation starts with 1,000 households (categorized as investors, mortgage-ready, or renters) and 300 homes.

Each year, the average home price increases by a realistic 5%.

A small number of new homes (15) are added to the market annually.

Investor-class buyers purchase a portion of the new homes, converting them to rentals.

Mortgage-ready buyers compete for the remaining new homes.

Visual Representation:

The housing stock is displayed as a grid of icons.

Icons are color-coded to represent their status: For Sale (green), Owned (blue), and Rental (gold).

The grid updates each year to show the change in homeownership status.

🚀 How to Run
This project is built with Vite and uses Bun as its package manager and runtime.

Install Dependencies:
From the project's root directory (vite-project), run:

Bash

bun install
Run the Local Development Server:
To start the live-reloading development server, run:

Bash

bun dev
The terminal will provide a local URL (usually http://localhost:5173) to view the project in a web browser.

📂 Project Structure
index.html: Contains the HTML structure for the dashboard and the simulation's visual area.

src/main.js: Holds all the JavaScript logic for the simulation, including the initial state setup, the advanceYear function that runs the market logic, and the functions that update the dashboard and visuals.

style.css: Contains all the CSS for the page layout, dashboard styling, and the color-coding of the housing stock visuals.
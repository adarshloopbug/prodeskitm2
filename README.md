# Cash-Flow Tracker

A responsive, single-page web application designed to track personal finances. It allows users to manage their income and expenses, visualizing the data in real-time through dynamic charts. Built purely with Vanilla Web Technologies to demonstrate proficiency in DOM manipulation, state management, and API integrations without the use of heavy frameworks.


## 🚀 Features

- **Real-Time State Logic:** Instantly calculates the remaining balance based on the total salary and logged expenses.
- **Client-Side Validation:** Prevents submission of empty or negative values to ensure data integrity, providing custom error alerts.
- **Data Persistence:** Uses the browser's `LocalStorage` API to ensure your financial data is saved and restored automatically upon page reloads.
- **Dynamic Visualization:** Integrates **Chart.js** to generate a real-time updating Doughnut chart comparing your expenses against your remaining balance.
- **Live Currency Conversion:** Leverages the **ExchangeRate-API** to fetch live exchange rates, allowing you to instantly toggle the dashboard currency between USD and INR.
- **PDF Report Generation:** Uses **jsPDF** to allow users to export their financial list and current balance into a cleanly formatted, downloadable PDF document.
- **Threshold Alerts:** A built-in budget monitor that triggers a critical UI warning if your remaining balance drops below 10% of your allocated salary.

## 🛠️ Technologies Used

- **HTML5:** Semantic structure and form elements.
- **CSS3:** Modern, responsive design featuring a clean, professional light theme with subtle shadows and custom variables.
- **Vanilla JavaScript (ES6+):** Core logic, event handling, DOM manipulation, and asynchronous API calls.
- **Chart.js:** Data visualization via CDN.
- **jsPDF & jsPDF-AutoTable:** PDF generation via CDN.
- **ExchangeRate-API:** External REST API for live currency conversion.

## 💻 Installation & Usage

Because this project is built using Vanilla web technologies, it doesn't require complex build steps to run.

### Option 1: Direct File Access
1. Clone or download this repository to your local machine.
2. Open the project folder.
3. Double-click the `index.html` file to open it directly in your web browser. 

### Option 2: Local Development Server (Recommended)
Running through a local server ensures external APIs and local storage don't hit browser CORS restrictions.
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Open your terminal and navigate to the project directory.
3. Run the following command:
   ```bash
   npm run dev
   ```
4. Open the `localhost` link provided in the terminal (usually `http://localhost:3000`).

## 📂 Project Structure

```text
├── index.html       # The main HTML structure
├── style.css        # Custom styling, layout, and UI themes
├── app.js           # Core state logic, event listeners, and API calls
└── package.json     # Configuration for the local development server
```

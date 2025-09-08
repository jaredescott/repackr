# RePackr - Travel Packing Planner

<!-- ![RePackr Logo](./public/logo.png) -->

RePackr is an interactive travel packing planner that helps you organize your packing list by day, track item totals, and efficiently manage what you need to bring on your travels.

![RePackr Demo](./docs/repackr_demo.png)
<br/>
<sub>Close-up view</sub>

![RePackr Demo Close](./docs/repackr_demo_close.png)

## 🚀 Features

- **Visual Day-by-Day Planning**: Create boards for each day of your trip
- **Master Item List**: Maintain a reusable catalog of your packing items
- **Drag and Drop Interface**: Easily move items between the master list and day boards
- **Context Menus**: Right-click items for quick actions
- **Reusable Items**: Mark items that can be used across multiple days
- **Automatic Totals**: Track how many of each item you need to pack
- **Print-Friendly Totals**: Generate a printable packing list
- **Export/Import Trip Data**: Save your packing lists to reuse for future trips
- **Persistent Storage**: Your packing lists are saved between sessions
- **Responsive Design**: Works on desktop and tablet devices

## 📋 Usage Guide

### Getting Started

1. **Add Days**: Click the "Add Day" button to create a new day board
2. **Edit Day Names**: Click the pencil icon to rename a day board
3. **Add Items**: Use the "Add New Item" dialog to create packing items
4. **Organize Your Packing**: Drag items from the master list to specific days

### Managing Items

- **Drag and Drop**: Move items between the master list and day boards
- **Right-Click Menus**: Access context menus for additional actions
- **Edit Properties**: Modify an item's name, category, quantity, and reusable status
- **Add to All Days**: Quickly add an item to every day of your trip
- **Move Between Days**: Transfer items directly from one day to another
- **Delete Items**: Remove items from a day or from the master list entirely

### Special Features

- **Reusable Items**: Items marked as reusable (blue background) count only once in totals
- **Day Management**: Delete unwanted days with the trash icon
- **Quantity Control**: Set and modify how many of each item you need
- **Print Packing List**: Get a clean, printable version of your final packing list
- **Persistent Storage**: Your data is automatically saved in your browser

### Managing Trip Data

- **Export Trip Data**: Save your packing list to a JSON file for future use
- **Import Trip Data**: Load a previously exported trip data file
- **Reset Data**: Clear all current data and start a new trip from scratch

## 🖨️ Printing Your Packing List

1. Fill out your packing plan by adding items to each day
2. Review the "Packing Totals" section at the bottom
3. Click the "Print Totals" button
4. Use your browser's print dialog to print or save as PDF

## 💾 Exporting and Importing

### Exporting Trip Data
1. Click the menu icon (three vertical dots) in the top-right corner
2. Select "Export Trip Data"
3. The file will automatically download as "repackr_trip_[date].json"

### Importing Trip Data
1. Click the menu icon (three vertical dots) in the top-right corner
2. Select "Import Trip Data"
3. Select your previously exported JSON file
4. Your trip data will be loaded, replacing the current data

### Starting a New Trip
1. Export your current trip data if you want to save it
2. Click the menu icon (three vertical dots) in the top-right corner
3. Select "Reset All Data"
4. Confirm the reset action
5. Start planning your new trip with a clean slate

## 🛠️ Technical Details

RePackr is built with:
- React.js
- TypeScript
- Material-UI
- HTML5 Drag and Drop API
- Browser LocalStorage for data persistence

## 🔧 Installation

If you want to run the app locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/repackr.git

# Navigate to project directory
cd repackr

# Install dependencies
npm install

# Start the development server
npm start
```

## 🌐 Browser Compatibility

RePackr works best in modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📱 Mobile Support

While primarily designed for desktop and tablet use, basic functionality is available on mobile devices. For the best experience, use a device with a larger screen.

## 🔒 Privacy

RePackr stores all data locally in your browser. Your packing lists are never uploaded to any server.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is licensed under [Apache-2.0](LICENSE).

## 🙏 Acknowledgements

- Icons provided by Material-UI
- Inspired by the needs of frequent travelers 
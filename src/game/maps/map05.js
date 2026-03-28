const map = {
  id: 'map05',
  name: 'Long hike',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 75,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 8,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 1,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 1, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 3.0,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.5,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 5,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    type: 'elimination',  // ['elimination', 'capital-loss']
    options: {},
  },

  planets: [
    // top row
    { id: 'A', label: 'A', x: 30, y: 12, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'B', label: 'B', x: 70, y: 12, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },

    // upper mid row
    { id: 'C', label: 'C', x: 30, y: 36, initialOwner: 0, initialShips: 9, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'D', label: 'D', x: 70, y: 36, initialOwner: 0, initialShips: 9, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    // central corridor
    { id: 'E', label: 'E', x: 30, y: 104, initialOwner: 0, initialShips: 9, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'F', label: 'F', x: 70, y: 104, initialOwner: 0, initialShips: 9, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    // bottom mid row
    { id: 'G', label: 'G', x: 30, y: 128, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'H', label: 'H', x: 70, y: 128, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
  ],

  edges: [
    // top structure
    { from: 'A', to: 'B', flightTime: 1.0 },
    { from: 'A', to: 'C', flightTime: 0.9 },
    { from: 'B', to: 'D', flightTime: 0.9 },

    { from: 'C', to: 'D', flightTime: 0.9 },

    // cross diagonals at top
    { from: 'C', to: 'B', flightTime: 1.0 },
    { from: 'A', to: 'D', flightTime: 1.0 },

    // long corridor
    { from: 'C', to: 'E', flightTime: 2.2 },
    { from: 'D', to: 'F', flightTime: 2.2 },

    // long diagonals (main feature)
    { from: 'C', to: 'F', flightTime: 2.6 },
    { from: 'D', to: 'E', flightTime: 2.6 },

    // bottom structure mirrors top
    { from: 'E', to: 'F', flightTime: 0.9 },

    { from: 'E', to: 'G', flightTime: 0.9 },
    { from: 'F', to: 'H', flightTime: 0.9 },

    { from: 'G', to: 'H', flightTime: 1.0 },

    // cross diagonals at bottom
    { from: 'E', to: 'H', flightTime: 1.0 },
    { from: 'F', to: 'G', flightTime: 1.0 },
  ],
}

export default map
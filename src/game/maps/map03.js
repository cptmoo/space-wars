const map = {
  id: 'map03',
  name: 'Hex-land',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 75,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 8,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 1,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 1, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 2.5,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.5,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 4,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    type: 'elimination',  // ['elimination', 'capital-loss']
    options: {},
  },

  planets: [
    { id: 'A', label: 'A', x: 30, y: 16, initialOwner: 2, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'B', label: 'B', x: 70, y: 16, initialOwner: 2, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'C', label: 'C', x: 12, y: 46, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'D', label: 'D', x: 50, y: 46, initialOwner: 0, initialShips: 12, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'E', label: 'E', x: 88, y: 46, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'F', label: 'F', x: 30, y: 74, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'G', label: 'G', x: 70, y: 74, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'H', label: 'H', x: 12, y: 102, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'I', label: 'I', x: 50, y: 102, initialOwner: 0, initialShips: 12, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'J', label: 'J', x: 88, y: 102, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'K', label: 'K', x: 30, y: 130, initialOwner: 1, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'L', label: 'L', x: 70, y: 130, initialOwner: 1, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
  ],

  edges: [
    { from: 'A', to: 'B', flightTime: 1.0 },

    { from: 'A', to: 'C', flightTime: 1.0 },
    { from: 'A', to: 'D', flightTime: 1.0 },
    { from: 'B', to: 'D', flightTime: 1.0 },
    { from: 'B', to: 'E', flightTime: 1.0 },

    { from: 'C', to: 'D', flightTime: 0.9 },
    { from: 'D', to: 'E', flightTime: 0.9 },

    { from: 'C', to: 'F', flightTime: 0.9 },
    { from: 'D', to: 'F', flightTime: 0.95 },
    { from: 'D', to: 'G', flightTime: 0.95 },
    { from: 'E', to: 'G', flightTime: 0.9 },

    { from: 'F', to: 'G', flightTime: 0.9 },

    { from: 'F', to: 'H', flightTime: 0.9 },
    { from: 'F', to: 'I', flightTime: 0.95 },
    { from: 'G', to: 'I', flightTime: 0.95 },
    { from: 'G', to: 'J', flightTime: 0.9 },

    { from: 'H', to: 'I', flightTime: 0.9 },
    { from: 'I', to: 'J', flightTime: 0.9 },

    { from: 'H', to: 'K', flightTime: 1.0 },
    { from: 'I', to: 'K', flightTime: 1.0 },
    { from: 'I', to: 'L', flightTime: 1.0 },
    { from: 'J', to: 'L', flightTime: 1.0 },

    { from: 'K', to: 'L', flightTime: 1.0 },
  ],
}

export default map
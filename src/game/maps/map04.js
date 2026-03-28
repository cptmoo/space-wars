const map = {
  id: 'map04',
  name: 'Neighbours',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 60,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 6,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 1,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 1, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 1.25,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.5,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 3,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    type: 'capital-loss',  // ['elimination', 'capital-loss']
    options: {},
  },

  planets: [
    { id: 'A', label: 'A', x: 30, y: 12, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'B', label: 'B', x: 70, y: 12, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'C', label: 'C', x: 30, y: 40, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'D', label: 'D', x: 70, y: 40, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'E', label: 'E', x: 20, y: 72, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'F', label: 'F', x: 50, y: 58, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'G', label: 'G', x: 80, y: 72, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'H', label: 'H', x: 50, y: 88, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'I', label: 'I', x: 30, y: 104, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'J', label: 'J', x: 70, y: 104, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'K', label: 'K', x: 30, y: 132, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'L', label: 'L', x: 70, y: 132, initialOwner: 0, initialShips: 10, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
  ],

  edges: [
    { from: 'A', to: 'B', flightTime: 1.0 },

    { from: 'A', to: 'C', flightTime: 0.9 },
    { from: 'B', to: 'D', flightTime: 0.9 },

    { from: 'C', to: 'D', flightTime: 0.9 },

    { from: 'C', to: 'E', flightTime: 0.95 },
    { from: 'C', to: 'F', flightTime: 0.9 },
    { from: 'D', to: 'F', flightTime: 0.9 },
    { from: 'D', to: 'G', flightTime: 0.95 },

    { from: 'F', to: 'H', flightTime: 1.2 },

    { from: 'E', to: 'I', flightTime: 0.95 },
    { from: 'G', to: 'J', flightTime: 0.95 },

    { from: 'H', to: 'I', flightTime: 0.85 },
    { from: 'H', to: 'J', flightTime: 0.85 },
    { from: 'I', to: 'J', flightTime: 0.9 },

    { from: 'I', to: 'K', flightTime: 0.9 },
    { from: 'J', to: 'L', flightTime: 0.9 },

    { from: 'K', to: 'L', flightTime: 1.0 },
  ],
}

export default map
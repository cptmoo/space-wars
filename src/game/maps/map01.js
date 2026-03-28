const map = {
  id: 'map01',
  name: 'Basic',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 50,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 5,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 1,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 1, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 1,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.5,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 2,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    // elimination or capital-loss
    type: 'elimination', // ['elimination', 'capital-loss']
    options: {},
  },

  planets: [
    { id: 'A', label: 'A', x: 18, y: 124, initialOwner: 1, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'B', label: 'B', x: 82, y: 124, initialOwner: 1, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'C', label: 'C', x: 50, y: 96, initialOwner: 0, initialShips: 12, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'D', label: 'D', x: 26, y: 71, initialOwner: 0, initialShips: 18, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'E', label: 'E', x: 74, y: 71, initialOwner: 0, initialShips: 18, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'F', label: 'F', x: 50, y: 44, initialOwner: 0, initialShips: 12, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'G', label: 'G', x: 18, y: 18, initialOwner: 2, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'H', label: 'H', x: 82, y: 18, initialOwner: 2, initialShips: 4, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
  ],

  edges: [
    { from: 'A', to: 'C', flightTime: 1 },
    { from: 'A', to: 'D', flightTime: 1 },
    { from: 'B', to: 'C', flightTime: 1 },
    { from: 'B', to: 'E', flightTime: 1 },
    { from: 'C', to: 'D', flightTime: 1 },
    { from: 'C', to: 'E', flightTime: 1 },
    { from: 'D', to: 'F', flightTime: 1 },
    { from: 'E', to: 'F', flightTime: 1 },
    { from: 'D', to: 'G', flightTime: 1 },
    { from: 'F', to: 'G', flightTime: 1 },
    { from: 'E', to: 'H', flightTime: 1 },
    { from: 'F', to: 'H', flightTime: 1 },
  ],
}

export default map
const map = {
  id: 'map02',
  name: 'Fast fight',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 50,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 5,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 1,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 1, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 0.8,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.5,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 2,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    type: 'capital-loss',  // ['elimination', 'capital-loss']
    options: {},
  },

  planets: [
    { id: 'A', label: 'A', x: 50, y: 16, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },

    { id: 'B', label: 'B', x: 18, y: 42, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'C', label: 'C', x: 82, y: 42, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'D', label: 'D', x: 18, y: 84, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'E', label: 'E', x: 82, y: 84, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    { id: 'F', label: 'F', x: 50, y: 110, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
  ],

  edges: [
    { from: 'A', to: 'B', flightTime: 0.8 },
    { from: 'A', to: 'C', flightTime: 0.8 },

    { from: 'B', to: 'C', flightTime: 0.75 },
    { from: 'B', to: 'D', flightTime: 0.75 },
    { from: 'C', to: 'E', flightTime: 0.75 },

    { from: 'D', to: 'E', flightTime: 0.75 },

    { from: 'D', to: 'F', flightTime: 0.8 },
    { from: 'E', to: 'F', flightTime: 0.8 },
  ],
}

export default map
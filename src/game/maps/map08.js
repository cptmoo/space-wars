const map = {
  id: 'map08',
  name: 'River xing surprise',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 50,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 5,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 1,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 1, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 1.25,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.25,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 2,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    type: 'capital-loss',
    options: {},
  },
  planets: [
    // top capitals
    { id: 'A', label: 'A', x: 34, y: 14, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'B', label: 'B', x: 66, y: 14, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },

    // upper row
    { id: 'C', label: 'C', x: 26, y: 38, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'D', label: 'D', x: 50, y: 38, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'E', label: 'E', x: 74, y: 38, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    // upper crossing node
    { id: 'F', label: 'F', x: 50, y: 58, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    // lower crossing node (mirror of F)
    { id: 'G', label: 'G', x: 50, y: 82, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    // lower row (mirror of C/D/E)
    { id: 'H', label: 'H', x: 26, y: 102, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'I', label: 'I', x: 50, y: 102, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },
    { id: 'J', label: 'J', x: 74, y: 102, initialOwner: 0, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

    // bottom capitals (mirror of A/B)
    { id: 'K', label: 'K', x: 34, y: 126, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
    { id: 'L', label: 'L', x: 66, y: 126, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} },
  ],

  edges: [
    // top capitals and upper row
    { from: 'A', to: 'B', flightTime: 0.9 },

    { from: 'A', to: 'C', flightTime: 0.9 },
    { from: 'A', to: 'D', flightTime: 0.85 },

    { from: 'B', to: 'D', flightTime: 0.85 },
    { from: 'B', to: 'E', flightTime: 0.9 },

    { from: 'C', to: 'D', flightTime: 0.75 },
    { from: 'D', to: 'E', flightTime: 0.75 },

    // upper cluster into crossing
    { from: 'C', to: 'F', flightTime: 0.9 },
    { from: 'D', to: 'F', flightTime: 0.75 },
    { from: 'E', to: 'F', flightTime: 0.9 },

    // river crossing
    { from: 'F', to: 'G', flightTime: 4 },

    // lower cluster from crossing
    { from: 'G', to: 'H', flightTime: 0.9 },
    { from: 'G', to: 'I', flightTime: 0.75 },
    { from: 'G', to: 'J', flightTime: 0.9 },

    { from: 'H', to: 'I', flightTime: 0.75 },
    { from: 'I', to: 'J', flightTime: 0.75 },

    // lower row to bottom capitals
    { from: 'H', to: 'K', flightTime: 0.9 },
    { from: 'I', to: 'K', flightTime: 0.85 },

    { from: 'I', to: 'L', flightTime: 0.85 },
    { from: 'J', to: 'L', flightTime: 0.9 },

    { from: 'K', to: 'L', flightTime: 0.9 },

    // surprise
    { from: 'E', to: 'J', flightTime: 6 },

  ],

}

export default map
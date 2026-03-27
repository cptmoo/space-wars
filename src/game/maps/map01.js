const map = {
  id: 'map01',
  name: 'Basic',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 50,
    maxLevel: 5,
    shipTimeFactor: 1,
    upgradeTimeFactor: 1,
    battleRate: 2,
  },

  winCondition: {
    // elimination or capital-loss
    type: 'elimination',
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
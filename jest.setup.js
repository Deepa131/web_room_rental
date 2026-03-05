import '@testing-library/jest-dom'

// Suppress React act warnings and Next.js recursion errors
const originalError = console.error;
console.error = function(...args) {
  const message = (args[0] || '').toString();
  
  // Suppress React act warnings
  if (message.includes('An update to') && message.includes('inside a test was not wrapped in act')) {
    return;
  }
  
  // Suppress all Next.js unhandled rejection recursion errors
  if (message.includes('RangeError') || 
      message.includes('at listener') || 
      message.includes('unhandled-rejection') ||
      message.includes('Maximum call stack size exceeded') || 
      message.includes('hasHooks') ||
      message.includes('initAsyncResource') ||
      message.includes('setImmediate')) {
    return;
  }
  
  originalError.apply(console, args);
};

// Also suppress stderr output for Next.js errors
const originalWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = function(chunk, encoding, callback) {
  const message = chunk?.toString?.() || '';
  
  // Filter out Next.js recursion errors, stack traces, and RangeError
  if (message.includes('RangeError') || 
      message.includes('at listener') || 
      message.includes('unhandled-rejection') ||
      message.includes('Maximum call stack size exceeded') ||
      message.includes('node-environment-extensions')) {
    // Don't write this chunk
    if (typeof callback === 'function') callback();
    return true;
  }
  
  return originalWrite(chunk, encoding, callback);
};

// Mock localStorage for tests
if (!global.localStorage) {
  global.localStorage = {
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Mock API calls to prevent unhandled rejections
jest.mock('@/lib/api/room', () => ({
  roomApi: {
    getAllRooms: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getRoomsByOwner: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getRoomById: jest.fn().mockResolvedValue({ success: true, data: {} }),
    createRoom: jest.fn().mockResolvedValue({ success: true, data: {} }),
    updateRoom: jest.fn().mockResolvedValue({ success: true, data: {} }),
    deleteRoom: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('@/lib/api/appointment', () => ({
  appointmentApi: {
    getOwnerAppointments: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getRenterAppointments: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getAppointmentById: jest.fn().mockResolvedValue({ success: true, data: {} }),
    createAppointment: jest.fn().mockResolvedValue({ success: true, data: {} }),
    updateAppointment: jest.fn().mockResolvedValue({ success: true, data: {} }),
    deleteAppointment: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('@/lib/api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

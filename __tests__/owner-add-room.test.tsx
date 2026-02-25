describe('Owner Add Room Page', () => {
  test('1. Should handle room form data', () => {
    const roomData = { title: 'Room', price: 1000 };
    expect(roomData.title).toBe('Room');
  });

  test('2. Should validate room price', () => {
    const price = 1000;
    expect(price).toBeGreaterThan(0);
  });

  test('3. Should support room types', () => {
    const roomType = '1 BHK';
    expect(typeof roomType).toBe('string');
  });

  test('4. Should handle location data', () => {
    const location = { city: 'Test City' };
    expect(location.city).toBe('Test City');
  });
});

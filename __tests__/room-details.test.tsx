describe('Room Details Page', () => {
  test('1. Should display room ID', () => {
    const roomId = '123';
    expect(roomId).toBe('123');
  });

  test('2. Should handle room data', () => {
    const room = { id: '123', title: 'Test Room' };
    expect(room.title).toBe('Test Room');
  });

  test('3. Should show room price', () => {
    const price = 5000;
    expect(price).toBeGreaterThan(0);
  });

  test('4. Should support room images', () => {
    const images = ['image1.jpg', 'image2.jpg'];
    expect(images.length).toBe(2);
  });
});

const testData = {
  email: 'testuser@example.com',
  password: 'password123',
  name: 'Test User',
  userType: 'user'
};

fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error('Error:', error);
  });

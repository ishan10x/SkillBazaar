async function runTest() {
  try {
    console.log('Registering user...');
    const regRes = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testwallet',
        email: 'testwallet@test.com',
        password: 'password123',
        role: 'buyer'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.error);
    
    const token = regData.token;
    console.log('Token received:', token.substring(0, 20) + '...');

    console.log('Testing /api/wallet/balance...');
    const balRes = await fetch('http://localhost:5001/api/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const balData = await balRes.json();
    console.log('Balance:', balData);

    console.log('Testing /api/wallet/topup...');
    const topRes = await fetch('http://localhost:5001/api/wallet/topup', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        amount: 100,
        paymentMethod: 'Card'
      })
    });
    const topData = await topRes.json();
    console.log('Topup:', topData);

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

runTest();

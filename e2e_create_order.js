(async () => {
  try {
    const body = { amount: 5000, currency: 'INR', receipt: 'e2e_test_3' };
    const res = await fetch('http://localhost:3000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('STATUS:' + res.status);
    console.log(text);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();

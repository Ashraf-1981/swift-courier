// sends 11 wrong logins; the 11th must be blocked (429)
(async () => {
  for (let i = 1; i <= 11; i++) {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@swift.com', password: 'wrong' }),
    });
    const data = await res.json();
    console.log(i, res.status, data.error);
  }
})();
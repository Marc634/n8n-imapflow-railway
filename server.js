const express = require('express');
const { ImapFlow } = require('imapflow');

const app = express();
app.use(express.json());

app.post('/imap/folders', async (req, res) => {
  const client = new ImapFlow({
    host: 'imap.poczta.onet.pl',
    port: 993,
    secure: true,
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS
    },
    logger: false
  });

  const requiredFolders = [
    'Faktury', 'Pilne', 'Zamowienia',
    'Praca', 'Marketing', 'Osobiste', 'Inne'
  ];

  try {
    await client.connect();
    const folders = await client.list();
    const names = folders.map(f => f.name);

    const created = [];

    for (const name of requiredFolders) {
      if (!names.includes(name)) {
        await client.mailboxCreate(name);
        created.push(name);
      }
    }

    await client.logout();
    res.json({ success: true, created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import { Sequelize } from 'sequelize';

const app = express();
const PORT = process.env.PORT || 8082;

app.use(express.json());

const sequelize = new Sequelize('postgres://postgres:password@db:5432/chat_db');

app.post('/api/store', async (req, res) => {
  const { message, sender_id, receiver_id } = req.body;
  console.log('Storing message:', message, sender_id, receiver_id);

  try {
    await sequelize.query(
      'INSERT INTO messages (content, sender_id, receiver_id) VALUES ($1, $2, $3)',
      { bind: [message, sender_id, receiver_id] }
    );
    res.status(200).send('Message stored');
  } catch (err) {
    console.error('Error storing message:', err);
    res.status(500).send('Error storing message');
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT * FROM messages');
    res.json(results);
  } catch (err) {
    console.error('Error retrieving messages:', err);
    res.status(500).send('Error retrieving messages');
  }
});

app.listen(PORT, () => {
  console.log(`API Storage service running on port ${PORT}`);
});

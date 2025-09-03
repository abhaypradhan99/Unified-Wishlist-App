import express from 'express';
import rateLimit from 'express-rate-limit';
import { preview } from './preview';

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip || 'unknown'
});
app.use(limiter);

app.post('/preview', preview);

app.listen(3000, () => console.log('Server on port 3000'));
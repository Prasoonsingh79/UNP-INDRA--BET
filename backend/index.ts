import express from 'express';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// -- Auth Routes --
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, coins: 1000 }
    });
    res.json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, coins: user.coins } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// -- User / Wallet Route --
app.get('/api/user/me', authenticateToken, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
});

// -- AI Topic Generation --
app.get('/api/ai/topics', authenticateToken, async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY?.replace(/"/g, '') || '';
    if (!key || key === 'placeholder') {
      return res.status(500).json({ error: 'API Key missing' });
    }
    const localGenAI = new GoogleGenerativeAI(key);
    const model = localGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Generate exactly 1 trending prediction topic for a betting platform in JSON format.
Your output MUST be a strict JSON array containing exactly one object, with a 'title' string, and an 'options' array of two strings.
DO NOT wrap the response in markdown blocks like \`\`\`json. OUTPUT PURE JSON ONLY.
Example: [{"title": "Will SpaceX reach Mars by 2030?", "options": ["YES", "NO"]}]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Fallback cleanup if the LLM still provided markdown
    if (text.startsWith('```json')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Gen Error:', error.message || error);
    res.status(500).json({ error: 'Failed to generate topics securely' });
  }
});

// -- Bets Routes --
app.post('/api/bets', authenticateToken, async (req: any, res) => {
  const { title, options, entryAmount, deadline } = req.body;
  try {
    const bet = await prisma.bet.create({
      data: {
        title,
        creatorId: req.user.id,
        entryAmount,
        deadline: new Date(deadline),
        options: {
          create: options.map((opt: string) => ({ text: opt }))
        }
      },
      include: { options: true }
    });
    io.emit('new_bet', bet); // Real-time emit
    res.json(bet);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bet' });
  }
});

app.get('/api/bets', async (req, res) => {
  const bets = await prisma.bet.findMany({
    include: {
      options: true,
      creator: { select: { username: true } },
      participations: true
    },
    orderBy: { createdAt: 'desc' }
  });
  // calculate pool and participants length for easy viewing
  const enrichedBets = bets.map((bet: any) => ({
    ...bet,
    totalPool: bet.participations.reduce((acc: number, p: any) => acc + p.amount, 0),
    participantCount: bet.participations.length
  }));
  res.json(enrichedBets);
});

// -- Join Bet --
app.post('/api/bets/:id/join', authenticateToken, async (req: any, res) => {
  const betId = parseInt(req.params.id);
  const { optionId } = req.body;
  const userId = req.user.id;

  try {
    const bet = await prisma.bet.findUnique({ where: { id: betId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!bet || !user) return res.status(404).json({ error: 'Not found' });
    if (bet.status !== 'active') return res.status(400).json({ error: 'Bet is not active' });
    if (new Date() > new Date(bet.deadline)) return res.status(400).json({ error: 'Deadline passed' });
    if (user.coins < bet.entryAmount) return res.status(400).json({ error: 'Insufficient coins' });

    // Deduct coins and add participation atomically via transaction
    const [participation, updatedUser] = await prisma.$transaction([
      prisma.participation.create({
        data: {
          userId,
          betId,
          optionId,
          amount: bet.entryAmount
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: bet.entryAmount } }
      })
    ]);

    // Calculate real-time stats to broadcast
    const updatedBet = await prisma.bet.findUnique({
      where: { id: betId },
      include: { participations: true, options: true }
    });

    if (updatedBet) {
      const totalPool = updatedBet.participations.reduce((acc: number, p: any) => acc + p.amount, 0);
      io.emit('bet_updated', {
        betId,
        totalPool,
        participantCount: updatedBet.participations.length,
        participations: updatedBet.participations
      });
    }

    res.json({ message: 'Joined successfully', user: updatedUser });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Already joined' });
    res.status(500).json({ error: 'Failed to join bet' });
  }
});

// -- Result System (Determine Winners) --
app.post('/api/bets/:id/simulate', async (req, res) => {
  const betId = parseInt(req.params.id);
  try {
    const bet = await prisma.bet.findUnique({ where: { id: betId }, include: { options: true } });
    if (!bet || bet.status !== 'active') return res.status(400).json({ error: 'Bet not active' });

    for (let i = 0; i < 3; i++) {
      const botName = `bot_${Math.floor(Math.random() * 10000)}`;
      const botUser = await prisma.user.create({
        data: { username: botName, password: 'sim', coins: 5000 }
      });

      const randomOpt = bet.options[Math.floor(Math.random() * bet.options.length)];

      await prisma.$transaction([
        prisma.participation.create({
          data: { userId: botUser.id, betId, optionId: randomOpt.id, amount: bet.entryAmount }
        }),
        prisma.user.update({
          where: { id: botUser.id },
          data: { coins: { decrement: bet.entryAmount } }
        })
      ]);
    }

    const updatedBet = await prisma.bet.findUnique({
      where: { id: betId }, include: { participations: true, options: true }
    });
    if (updatedBet) {
      const totalPool = updatedBet.participations.reduce((acc: number, p: any) => acc + p.amount, 0);
      io.emit('bet_updated', {
        betId, totalPool, participantCount: updatedBet.participations.length, participations: updatedBet.participations
      });
    }

    res.json({ message: 'Simulation complete' });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

app.post('/api/bets/:id/resolve', authenticateToken, async (req: any, res) => {
  const betId = parseInt(req.params.id);
  const { winningOptionId } = req.body;

  try {
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: { participations: true }
    });

    if (!bet || bet.status !== 'active') return res.status(400).json({ error: 'Bet cannot be resolved' });
    if (bet.creatorId !== req.user.id) return res.status(403).json({ error: 'Only creator can resolve' });

    const winningParticipations = bet.participations.filter((p: any) => p.optionId === winningOptionId);
    const totalPool = bet.participations.reduce((acc: number, p: any) => acc + p.amount, 0);

    // Distribute rewards
    const rewardPerWinner = winningParticipations.length > 0 ? (totalPool / winningParticipations.length) : 0;

    await prisma.$transaction(async (prisma: any) => {
      // Mark bet as resolved
      await prisma.bet.update({
        where: { id: betId },
        data: { status: 'resolved', resultOptionId: winningOptionId }
      });
      // Distribute coins
      if (rewardPerWinner > 0) {
        for (const p of winningParticipations) {
          await prisma.user.update({
            where: { id: p.userId },
            data: { coins: { increment: rewardPerWinner } }
          });
        }
      }
    });

    const updatedBet = await prisma.bet.findUnique({ where: { id: betId } });
    io.emit('bet_resolved', { betId, winningOptionId, rewardPerWinner });

    res.json({ message: 'Bet resolved', rewardPerWinner });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { coins: 'desc' },
      take: 10,
      include: {
        participations: { include: { bet: true } }
      }
    });

    const leaders = users.map(u => {
      let wins = 0;
      let resolvedCount = 0;
      u.participations.forEach(p => {
        if (p.bet.status === 'resolved') {
          resolvedCount++;
          if (p.bet.resultOptionId === p.optionId) wins++;
        }
      });
      return {
        id: u.id,
        username: u.username,
        coins: u.coins,
        winRate: resolvedCount > 0 ? Math.round((wins / resolvedCount) * 100) : 0
      };
    });

    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: 'Server error parsing leaderboard' });
  }
});

app.get('/api/portfolio', authenticateToken, async (req: any, res) => {
  try {
    const participations = await prisma.participation.findMany({
      where: { userId: req.user.id },
      include: {
        bet: { include: { participations: true, options: true } },
        option: true
      }
    });

    let activeStake = 0;
    let totalWon = 0;
    let totalLost = 0;
    const positions: any[] = [];

    participations.forEach(p => {
      if (p.bet.status === 'active') {
        activeStake += p.amount;
        const totalPool = p.bet.participations.reduce((acc, curr) => acc + curr.amount, 0);
        const optAmount = p.bet.participations.filter(curr => curr.optionId === p.optionId).reduce((acc, curr) => acc + curr.amount, 0);
        const currentOdds = totalPool > 0 ? Math.round((optAmount / totalPool) * 100) : 0;

        positions.push({
          id: p.id,
          betTitle: p.bet.title,
          stake: p.amount,
          prediction: p.option.text,
          currentOdds: `${currentOdds}%`
        });
      } else if (p.bet.status === 'resolved') {
        if (p.bet.resultOptionId === p.optionId) {
          const winningParticipations = p.bet.participations.filter((curr: any) => curr.optionId === p.bet.resultOptionId);
          const totalPool = p.bet.participations.reduce((acc: number, curr: any) => acc + curr.amount, 0);
          const rewardPerWinner = winningParticipations.length > 0 ? (totalPool / winningParticipations.length) : 0;
          totalWon += Math.max(0, rewardPerWinner - p.amount);
        } else {
          totalLost += p.amount;
        }
      }
    });

    res.json({ activeStake, totalWon: Math.floor(totalWon), totalLost: Math.floor(totalLost), positions });
  } catch (err) {
    res.status(500).json({ error: 'Server error parsing portfolio' });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  try {
    let user;
    if (req.params.id === 'me' || !req.params.id) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'User not registered' });
      const decoded: any = jwt.verify(token, JWT_SECRET);
      user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { participations: { include: { bet: true } } } });
    } else {
      user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) }, include: { participations: { include: { bet: true } } } });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    let wins = 0;
    let resolvedCount = 0;
    user.participations.forEach((p: any) => {
      if (p.bet.status === 'resolved') {
        resolvedCount++;
        if (p.bet.resultOptionId === p.optionId) wins++;
      }
    });

    res.json({
      id: user.id,
      username: user.username,
      coins: user.coins,
      winRate: resolvedCount > 0 ? Math.round((wins / resolvedCount) * 100) : 0,
      bio: 'Crypto enthusiast & AI Predictor',
      joined: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error parsing profile' });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

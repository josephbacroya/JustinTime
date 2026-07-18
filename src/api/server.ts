import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAuth } from '../shared/middleware/auth';
import { Logger } from '../shared/infrastructure/Logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const logger = new Logger('APIGateway');

// Middleware
app.use(cors());
app.use(express.json());

// Public Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', service: 'JIT-API-Gateway' });
});

// Secure API Routes (Protected by Mock Auth)
app.use('/v1', requireAuth);

app.get('/v1/rules', (req: Request, res: Response) => {
  // Mock response wrapping the RuleService logic for MVP
  // In production, we'd instantiate Prisma and inject it into RuleService here
  const tenantId = req.user?.tenantId;
  
  logger.info(`Fetching rules for tenant ${tenantId}`);
  
  res.status(200).json([
    {
      id: 'rule_1',
      applicationPattern: 'salesforce.com',
      urlPattern: '.*\\/lightning\\/r\\/Opportunity\\/.*',
      articleId: 'art_123',
      title: 'Opportunity Creation SOP'
    },
    {
      id: 'rule_2',
      applicationPattern: 'google.com',
      urlPattern: '.*google\\.com.*',
      articleId: 'art_456',
      title: 'Company Search Guidelines'
    },
    {
      id: 'rule_3',
      applicationPattern: 'github.com',
      urlPattern: '.*github\\.com.*',
      articleId: 'art_789',
      title: 'Code Review Standards'
    }
  ]);
});

app.post('/v1/articles', (req: Request, res: Response) => {
  // In production, this proxies to ArticleService.draftArticle()
  const { title, content } = req.body;
  logger.info(`Drafting new article: ${title} for tenant ${req.user?.tenantId}`);
  
  res.status(201).json({
    id: 'mock_article_123',
    title,
    status: 'DRAFT',
    version: 1
  });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 JIT Workflow Overlay API Gateway running on port ${PORT}`);
});

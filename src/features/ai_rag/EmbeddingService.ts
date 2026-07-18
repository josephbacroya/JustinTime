import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/core/Result';

export class EmbeddingService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generates a vector embedding for a piece of text.
   * In a real enterprise application, this would call an external API (e.g., OpenAI text-embedding-ada-002).
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    console.log('[EmbeddingService] Generating embedding for text length:', text.length);
    // Mocking an embedding generation of length 1536 (OpenAI standard)
    // In production: const response = await openai.createEmbedding({ model: "text-embedding-3-small", input: text });
    return new Array(1536).fill(0).map(() => Math.random());
  }

  /**
   * Semantic chunking pipeline. Breaks down large SOPs into manageable chunks
   * while preserving context boundaries (paragraphs, sections).
   */
  private chunkText(text: string, maxTokens = 500): string[] {
    // Basic newline/paragraph chunking for MVP.
    // An enterprise implementation uses LangChain's RecursiveCharacterTextSplitter.
    const chunks = text.split('\n\n');
    return chunks.filter(c => c.trim().length > 0);
  }

  /**
   * Processes a published article:
   * 1. Extracts plain text.
   * 2. Generates embedding.
   * 3. Stores embedding in pgvector.
   */
  public async embedArticle(articleId: string): Promise<Result<boolean, Error>> {
    try {
      const article = await this.prisma.knowledgeArticle.findUnique({
        where: { id: articleId }
      });

      if (!article || article.status !== 'PUBLISHED') {
        return Result.fail(new Error('Article must be PUBLISHED to be embedded.'));
      }

      // Convert JSON content to raw text for embedding
      const rawText = JSON.stringify(article.content);
      
      // In a more robust system, we would embed individual chunks.
      // For this MVP architecture, we embed the entire article document vector.
      const embedding = await this.generateEmbedding(rawText);

      // Using raw SQL for pgvector as Prisma's native insert support for Unsupported types requires it
      await this.prisma.$executeRaw`
        UPDATE knowledge_articles
        SET embedding = ${embedding}::vector
        WHERE id = ${articleId}::uuid
      `;

      console.log(`[EmbeddingService] Successfully embedded article ${articleId}`);
      return Result.ok(true);
    } catch (error) {
      console.error('[EmbeddingService] Error embedding article:', error);
      return Result.fail(new Error('Failed to generate and store embeddings.'));
    }
  }
}

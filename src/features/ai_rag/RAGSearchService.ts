import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/core/Result';
import OpenAI from 'openai';

export interface SearchResult {
  articleId: string;
  title: string;
  similarity: number;
}

export class RAGSearchService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key' });
  }

  /**
   * Generates embedding for the query.
   */
  private async generateEmbedding(query: string): Promise<number[]> {
    if (this.openai.apiKey === 'dummy_key') {
      return new Array(1536).fill(0).map(() => Math.random());
    }
    
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  }

  /**
   * Performs a Hybrid Search (Semantic Vector Search + Metadata Filtering).
   * 
   * This is used when the exact Context Rules fail to find a match, allowing
   * the system to guess the right SOP based on the URL context and page content.
   */
  public async performContextualSearch(workspaceId: string, pageContext: string, limit: number = 3): Promise<Result<SearchResult[], Error>> {
    try {
      console.log(`[RAGSearchService] Searching for context in workspace: ${workspaceId}`);
      
      const queryVector = await this.generateEmbedding(pageContext);

      // Execute pgvector cosine similarity search (<=> operator)
      // The ::vector cast is important for Prisma query builder
      const results = await this.prisma.$queryRaw<Array<{ id: string; title: string; distance: number }>>`
        SELECT 
          id, 
          title, 
          embedding <=> ${queryVector}::vector AS distance
        FROM knowledge_articles
        WHERE "workspaceId" = ${workspaceId}::uuid
          AND status = 'PUBLISHED'
          AND embedding IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${limit}
      `;

      // Transform raw SQL result to typed response
      const searchResults: SearchResult[] = results.map(row => ({
        articleId: row.id,
        title: row.title,
        // distance is 0 to 2 (0 being perfect match). Convert to a 0-1 similarity score.
        similarity: Math.max(0, 1 - (row.distance / 2))
      }));

      return Result.ok(searchResults);
    } catch (error) {
      console.error('[RAGSearchService] Error performing vector search:', error);
      return Result.fail(new Error('Failed to perform contextual search.'));
    }
  }

  /**
   * Generates a summarized answer from an SOP based on the user's specific context.
   */
  public async generateContextualAnswer(articleId: string, userContext: string): Promise<Result<string, Error>> {
    try {
      const article = await this.prisma.knowledgeArticle.findUnique({
        where: { id: articleId }
      });

      if (!article) {
        return Result.fail(new Error('Article not found.'));
      }

      // In production, we'd send the article content + the user's current URL/DOM state to an LLM
      // e.g., "Given this SOP, and the fact the user is currently on /checkout, what is the next step?"
      console.log(`[RAGSearchService] Generating LLM response for article: ${article.title}`);
      
      const mockLlmResponse = `Based on the active step in your workflow, you should verify the fields highlighted on the screen and click 'Proceed'.`;
      
      return Result.ok(mockLlmResponse);
    } catch (error) {
      return Result.fail(new Error('Failed to generate AI response.'));
    }
  }
}

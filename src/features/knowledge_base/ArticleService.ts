import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/core/Result';

export interface CreateArticleDTO {
  workspaceId: string;
  title: string;
  content: Record<string, any>;
}

export interface ArticleResponse {
  id: string;
  title: string;
  status: string;
  version: number;
}

export class ArticleService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new knowledge article (SOP) in DRAFT status.
   */
  public async draftArticle(dto: CreateArticleDTO): Promise<Result<ArticleResponse, Error>> {
    try {
      if (!dto.workspaceId || !dto.title) {
        return Result.fail(new Error('Workspace ID and Title are required to draft an article.'));
      }

      // Verify workspace exists
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: dto.workspaceId },
      });

      if (!workspace) {
        return Result.fail(new Error(`Workspace with ID ${dto.workspaceId} does not exist.`));
      }

      const article = await this.prisma.knowledgeArticle.create({
        data: {
          workspaceId: dto.workspaceId,
          title: dto.title,
          content: dto.content,
          status: 'DRAFT',
          version: 1,
        },
      });

      return Result.ok({
        id: article.id,
        title: article.title,
        status: article.status,
        version: article.version,
      });
    } catch (error) {
      console.error('[ArticleService] Error drafting article:', error);
      return Result.fail(new Error('Failed to create article draft due to an internal error.'));
    }
  }

  /**
   * Publishes an article, making it available to the detection rules engine.
   */
  public async publishArticle(id: string): Promise<Result<ArticleResponse, Error>> {
    try {
      const article = await this.prisma.knowledgeArticle.findUnique({ where: { id } });

      if (!article) {
        return Result.fail(new Error('Article not found.'));
      }

      if (article.status === 'PUBLISHED') {
        return Result.fail(new Error('Article is already published.'));
      }

      const updatedArticle = await this.prisma.knowledgeArticle.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          // In a real scenario, this is where we would trigger an event
          // to generate embeddings (AI context) asynchronously.
        },
      });

      return Result.ok({
        id: updatedArticle.id,
        title: updatedArticle.title,
        status: updatedArticle.status,
        version: updatedArticle.version,
      });
    } catch (error) {
      console.error(`[ArticleService] Error publishing article ${id}:`, error);
      return Result.fail(new Error('Failed to publish article.'));
    }
  }
}

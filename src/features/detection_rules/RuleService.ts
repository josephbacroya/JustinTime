import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/core/Result';

export interface CreateRuleDTO {
  workspaceId: string;
  knowledgeArticleId: string;
  applicationPattern: string;
  urlPattern?: string;
  domSelectors?: Record<string, any>;
}

export interface RuleResponse {
  id: string;
  applicationPattern: string;
  urlPattern: string | null;
}

export class RuleService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new context rule that links an application state to an SOP.
   */
  public async createRule(dto: CreateRuleDTO): Promise<Result<RuleResponse, Error>> {
    try {
      if (!dto.workspaceId || !dto.knowledgeArticleId || !dto.applicationPattern) {
        return Result.fail(new Error('Workspace ID, Article ID, and Application Pattern are required.'));
      }

      // Ensure article exists and is published (business rule)
      const article = await this.prisma.knowledgeArticle.findUnique({
        where: { id: dto.knowledgeArticleId },
      });

      if (!article || article.workspaceId !== dto.workspaceId) {
        return Result.fail(new Error('Invalid Knowledge Article for this workspace.'));
      }

      if (article.status !== 'PUBLISHED') {
        return Result.fail(new Error('Rules can only be created for PUBLISHED articles.'));
      }

      const rule = await this.prisma.contextRule.create({
        data: {
          workspaceId: dto.workspaceId,
          knowledgeArticleId: dto.knowledgeArticleId,
          applicationPattern: dto.applicationPattern,
          urlPattern: dto.urlPattern,
          domSelectors: dto.domSelectors,
        },
      });

      return Result.ok({
        id: rule.id,
        applicationPattern: rule.applicationPattern,
        urlPattern: rule.urlPattern,
      });
    } catch (error) {
      console.error('[RuleService] Error creating detection rule:', error);
      return Result.fail(new Error('Failed to create detection rule due to an internal error.'));
    }
  }

  /**
   * Evaluates rules against a given client context payload to find matching SOPs.
   * This is a critical path for the Browser Extension overlay.
   */
  public async findMatchingRules(workspaceId: string, currentUrl: string): Promise<Result<RuleResponse[], Error>> {
    try {
      // In a production scenario, this query would be highly optimized, potentially backed by Redis.
      // For now, we perform a pattern matching check using PostgreSQL capabilities.
      const rules = await this.prisma.contextRule.findMany({
        where: {
          workspaceId,
          // Simplistic matching for MVP. Real enterprise implementation would use
          // pg_trgm or regex matching in Postgres, or offload to a specialized rules engine.
        },
      });

      // Filter rules in memory for the MVP (this should be pushed to DB in v2)
      const matchingRules = rules.filter(rule => {
        if (!rule.urlPattern) return true; // Matches everything on the application
        
        // Convert wildcard pattern to regex
        const regexStr = rule.urlPattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexStr}$`);
        return regex.test(currentUrl);
      });

      return Result.ok(matchingRules.map(r => ({
        id: r.id,
        applicationPattern: r.applicationPattern,
        urlPattern: r.urlPattern,
      })));
    } catch (error) {
      console.error(`[RuleService] Error finding matching rules for workspace ${workspaceId}:`, error);
      return Result.fail(new Error('Failed to evaluate detection rules.'));
    }
  }
}

import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { DeepPartial, EntityManager, EntityTarget, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { BaseEntity } from '@/modules/database/entities';
import { TBaseRepository, TFindAllOptions, TFindOneByIdOptions, TPagination } from '@/modules/database/helpers';

/**
 * Base repository class that provides common CRUD operations for all entities
 */
export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> implements TBaseRepository<T> {
  private readonly logger = new Logger(BaseRepository.name);
  private readonly tableName: string = this.metadata.tableName.toUpperCase();

  constructor(
    protected readonly entity: EntityTarget<T>,
    protected readonly entityManager: EntityManager,
  ) {
    super(entity, entityManager);
  }

  public async createOne(data: DeepPartial<T>): Promise<T> {
    try {
      const newEntity: T = this.create(data);

      // Validate entity before saving
      const errors = await validate(newEntity as object);
      if (errors.length > 0) {
        const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
        throw new BadRequestException(`Validation failed: ${errorMessages}`);
      }

      const saved: T = await this.save(newEntity);
      this.logger.log(`[${this.tableName}] Created entity with ID ${saved.id}`);
      return saved;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`[${this.tableName}] Failed to create entity: ${message}`);
      throw new ConflictException(`Failed to create ${this.tableName}: ${message}`);
    }
  }

  public async findOneById(id: number, options?: TFindOneByIdOptions<T>): Promise<T> {
    if (!id || id < 1) {
      throw new BadRequestException(`Invalid ID provided for ${this.tableName}`);
    }

    const entity = await this.findOne({
      where: { ...options?.where, id } as FindOptionsWhere<T>,
      relations: options?.relations,
      select: options?.select,
    });

    if (!entity) {
      this.logger.error(`[${this.tableName}] Entity not found with ID ${id}`);
      throw new NotFoundException(`${this.tableName} with ID ${id} not found`);
    }

    this.logger.log(`[${this.tableName}] Retrieved entity with ID ${id}`);
    return entity;
  }

  public async findAll({ paginationDto, relations, where, order }: TFindAllOptions<T>): Promise<TPagination<T[]>> {
    try {
      const { limit = 10, page = 1 } = paginationDto;

      if (page < 1) {
        throw new BadRequestException('Page number must be greater than 0');
      }

      if (limit < 1) {
        throw new BadRequestException('Limit must be greater than 0');
      }

      const [entities, total] = await this.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        relations,
        where,
        order,
      });

      const totalPages = Math.ceil(total / limit);
      this.logger.log(`[${this.tableName}] Retrieved ${entities.length} records (Page ${page}/${totalPages})`);

      return {
        items: entities,
        meta: {
          current_page: page,
          limit,
          total_pages: totalPages,
          total_items: total,
        },
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`[${this.tableName}] Failed to fetch entities: ${message}`);
      throw new ConflictException(`Failed to fetch ${this.tableName} list: ${message}`);
    }
  }

  public async updateOneById(id: number, partialEntity: QueryDeepPartialEntity<T>): Promise<T> {
    if (!id || id < 1) {
      throw new BadRequestException(`Invalid ID provided for ${this.tableName}`);
    }

    try {
      // Verify entity exists
      await this.findOneById(id);

      const updateResult: UpdateResult = await this.update(id, partialEntity);

      if (!updateResult.affected) {
        throw new ConflictException(`Failed to update ${this.tableName} with ID ${id}`);
      }

      const updated = await this.findOneById(id);
      this.logger.log(`[${this.tableName}] Updated entity with ID ${id}`);
      return updated;
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`[${this.tableName}] Failed to update entity with ID ${id}: ${message}`);
      throw new ConflictException(`Failed to update ${this.tableName}: ${message}`);
    }
  }

  public async deleteOneById(id: number): Promise<T> {
    if (!id || id < 1) {
      throw new BadRequestException(`Invalid ID provided for ${this.tableName}`);
    }

    try {
      const entity: T = await this.findOneById(id);
      const deleted: T = await this.softRemove(entity);

      if (!deleted) {
        throw new ConflictException(`Failed to delete ${this.tableName} with ID ${id}`);
      }

      this.logger.warn(`[${this.tableName}] Soft-deleted entity with ID ${id}`);
      return deleted;
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`[${this.tableName}] Failed to delete entity with ID ${id}: ${message}`);
      throw new ConflictException(`Failed to delete ${this.tableName}: ${message}`);
    }
  }
}

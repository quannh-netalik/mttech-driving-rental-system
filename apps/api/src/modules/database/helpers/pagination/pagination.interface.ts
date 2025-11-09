import { DeepPartial, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PaginationDto } from './pagination.dto';

export type TPagination<T> = {
	items: T;
	meta: {
		current_page?: number;
		limit?: number;
		total_items?: number;
		total_pages?: number;
	};
};

export type TFindOneByIdOptions<T> = {
	relations?: FindOptionsRelations<T>;
	where?: FindOptionsWhere<T>;
	select?: FindOptionsSelect<T>;
};

export type TFindAllOptions<T> = {
	paginationDto: PaginationDto;
	relations?: FindOptionsRelations<T>;
	order?: FindOptionsOrder<T>;
	where?: FindOptionsWhere<T>;
};

export type TBaseRepository<T> = {
	createOne(data: DeepPartial<T>): Promise<T>;
	findOneById(id: number, options?: TFindOneByIdOptions<T>): Promise<T>;
	findAll(options: TFindAllOptions<T>): Promise<TPagination<T[]>>;
	updateOneById(id: number, partialEntity: QueryDeepPartialEntity<T>): Promise<T>;
	deleteOneById(id: number): Promise<T>;
};

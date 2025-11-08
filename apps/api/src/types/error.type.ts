import { ApiProperty } from '@nestjs/swagger';

export interface ErrorResponse {
	path: string;
	method: string;
	status: number;
	exceptionType: string;
	timestamp: string;
	message: string;
	requestId: string;
	stack: string | undefined;
}

export class ErrorResponseDto implements ErrorResponse {
	@ApiProperty()
	path!: string;

	@ApiProperty()
	method!: string;

	@ApiProperty()
	status!: number;

	@ApiProperty()
	exceptionType!: string;

	@ApiProperty()
	timestamp!: string;

	@ApiProperty()
	message!: string;

	@ApiProperty()
	requestId!: string;

	@ApiProperty()
	stack!: string | undefined;
}

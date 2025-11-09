import { ApiProperty } from '@nestjs/swagger';

export interface ErrorResponse {
	path: string;
	method: string;
	status: number;
	exceptionType: string;
	timestamp: string;
	message: string;
	requestId: string;
	stack?: string | undefined;
}

export class ErrorResponseDto implements ErrorResponse {
	@ApiProperty({ description: 'Request path', example: '/api/users/123' })
	path!: string;

	@ApiProperty({ description: 'HTTP method', example: 'GET' })
	method!: string;

	@ApiProperty({ description: 'HTTP status code', example: 404 })
	status!: number;

	@ApiProperty({ description: 'Exception type', example: 'HttpException' })
	exceptionType!: string;

	@ApiProperty({ description: 'Error timestamp', example: '2025-11-08T21:42:10.000Z' })
	timestamp!: string;

	@ApiProperty({ description: 'Error message', example: 'Resource not found' })
	message!: string;

	@ApiProperty({ description: 'Request correlation ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
	requestId!: string;

	@ApiProperty({ description: 'Stack trace (development only)', required: false, nullable: true })
	stack?: string;
}

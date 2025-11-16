import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserRole } from '@/modules/database/entities';

export interface Payload {
	id: number;
	email: string;
	firstName: string;
	nonce: string;
	lastName: string;
	role: UserRole;
}

export class PayloadDto implements Payload {
	@IsNumber()
	@IsNotEmpty()
	id!: number;

	@IsString()
	@IsNotEmpty()
	nonce!: string;

	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@IsString()
	@IsNotEmpty()
	firstName!: string;

	@IsString()
	@IsNotEmpty()
	lastName!: string;

	@IsEnum(UserRole)
	@IsNotEmpty()
	role!: UserRole;

	constructor({ id, email, nonce, firstName, lastName, role }: Payload) {
		this.id = id;
		this.email = email;
		this.nonce = nonce;
		this.firstName = firstName;
		this.lastName = lastName;
		this.role = role;
	}
}

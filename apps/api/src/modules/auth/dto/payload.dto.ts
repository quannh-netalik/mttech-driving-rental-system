import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserRole } from '@/modules/database/entities';

export interface Payload {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
}

export class PayloadDto implements Payload {
	@IsNumber()
	@IsNotEmpty()
	id!: number;

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

	constructor({ id, email, firstName, lastName, role }: Payload) {
		this.id = id;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.role = role;
	}
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNotEmpty, Matches, IsIn } from 'class-validator';
import { UserRole } from '@/modules/database/entities/user.entity';

export class SignUpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description:
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: [UserRole.STAFF, UserRole.EXECUTIVE], default: UserRole.EXECUTIVE })
  @IsEnum(UserRole)
  @IsOptional()
  @IsIn([UserRole.STAFF, UserRole.EXECUTIVE], {
    message: 'Role must be either STAFF or EXECUTIVE',
  })
  role?: UserRole;
}

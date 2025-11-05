import { DocumentBuilder } from '@nestjs/swagger';

export const buildOpenApiConfig = (port: number) => {
  const configBuilder = new DocumentBuilder()
    .setTitle('MTTech Driving Rental System')
    .setDescription('The official API for Driving Rental System (By MTTech).\n## Authentication')
    .setContact('Quan Nguyen', '', 'quannh.netalik@gmail.com')
    .setVersion('1.0')
    .addBearerAuth(
      {
        in: 'header',
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Access token',
        description: 'Enter JWT token',
      },
      'access-token',
    );

  configBuilder.addServer(`http://localhost:${port}`, 'Local Development');

  return configBuilder.build();
};

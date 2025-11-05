import { DocumentBuilder } from '@nestjs/swagger';

const descriptions = [
  'The official API for Driving Rental System (By MTTech).\n',
  '## Authentication\n',
  'The API supports Bearer Auth type only, please insert your token for making request\n',
  '## Quick Links\n',
  '- Github: https://github.com/quannh-netalik/mttech-driving-rental-system',
];

export const buildOpenApiConfig = (port: number) => {
  const configBuilder = new DocumentBuilder()
    .setTitle('MTTech Driving Rental System')
    .setDescription(descriptions.join('\n'))
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

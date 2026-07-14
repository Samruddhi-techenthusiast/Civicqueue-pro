const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CivicQueue API',
      version: '1.0.0',
      description: 'Smart queue management system for government & public offices',
      contact: { name: 'CivicQueue Support', email: 'support@civicqueue.gov' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}/api/v1`, description: 'Development' },
      { url: 'https://api.civicqueue.gov/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/v1/*.js', './src/models/*.js'],
};

module.exports = swaggerJsDoc(options);

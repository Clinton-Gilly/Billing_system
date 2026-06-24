// Prisma v7 config — defines database connection URL
// This replaces the `url` field in datasource in schema.prisma
const { defineConfig } = require('prisma/config');
require('dotenv').config();

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

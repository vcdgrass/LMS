const { PrismaClient } =  require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pkg = require('pg')

const { Pool } = pkg

// Tạo pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Khởi tạo adapter PostgreSQL
const adapter = new PrismaPg(pool)

// Khởi tạo PrismaClient với adapter
const prisma = new PrismaClient({ adapter })

module.exports = {
  prisma,
};

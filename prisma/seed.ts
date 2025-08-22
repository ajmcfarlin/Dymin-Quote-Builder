import { PrismaClient } from '@/generated/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + symbols
  
  // Ensure at least one character from each category
  let password = ''
  password += uppercase[crypto.randomInt(uppercase.length)]
  password += lowercase[crypto.randomInt(lowercase.length)]
  password += numbers[crypto.randomInt(numbers.length)]
  password += symbols[crypto.randomInt(symbols.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('')
}

async function seedDefaults() {
  console.log('🌱 Seeding default data...')

  // Create default labor rates if they don't exist
  const laborRates = [
    { skillLevel: 1, costPerHour: 22, businessHoursPrice: 155, afterHoursPrice: 155 },
    { skillLevel: 2, costPerHour: 37, businessHoursPrice: 185, afterHoursPrice: 275 },
    { skillLevel: 3, costPerHour: 46, businessHoursPrice: 275, afterHoursPrice: 375 }
  ]

  for (const rate of laborRates) {
    await prisma.laborRate.upsert({
      where: { skillLevel: rate.skillLevel },
      update: rate,
      create: rate,
    })
  }

  console.log('💰 Created labor rates for skill levels 1-3')
}

async function createUser(username: string, name?: string, role: string = 'sales') {
  console.log(`👤 Creating user: ${username}`)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username }
  })

  if (existingUser) {
    console.log(`❌ User '${username}' already exists`)
    return
  }

  // Generate secure password
  const password = generateSecurePassword()
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  await prisma.user.create({
    data: {
      username,
      name: name || username.charAt(0).toUpperCase() + username.slice(1),
      password: hashedPassword,
      role: role,
      email: `${username}@dymin.local`
    }
  })

  console.log(`✅ User created successfully!`)
  console.log(`   Username: ${username}`)
  console.log(`   Password: ${password}`)
  console.log(`   Role: ${role}`)
  console.log(`   🔐 SAVE THIS PASSWORD - IT WILL NOT BE SHOWN AGAIN!`)
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // Default seed - create admin user and seed defaults
    console.log('🌱 Running default seed...')
    
    await seedDefaults()
    
    // Create admin user if it doesn't exist
    const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } })
    if (!adminExists) {
      await createUser('admin', 'System Administrator', 'admin')
    } else {
      console.log('👤 Admin user already exists')
    }
    
  } else if (args[0] === 'user') {
    // Create specific user: npm run db:seed user <username> [name] [role]
    const username = args[1]
    const name = args[2]
    const role = args[3] || 'sales'
    
    if (!username) {
      console.log('❌ Usage: npm run db:seed user <username> [name] [role]')
      console.log('   Example: npm run db:seed user john "John Smith" sales')
      process.exit(1)
    }
    
    await createUser(username, name, role)
    
  } else {
    console.log('❌ Unknown command. Available commands:')
    console.log('   npm run db:seed                              # Default seed')
    console.log('   npm run db:seed user <username> [name] [role] # Create user')
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
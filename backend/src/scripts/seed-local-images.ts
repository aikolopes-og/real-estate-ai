import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

/**
 * WARNING: This script will delete existing data in many tables. For safety it only runs
 * when the environment variable RUN_SEED_LOCAL=true is set.
 *
 * Usage:
 *   RUN_SEED_LOCAL=true tsx src/scripts/seed-local-images.ts
 *
 * It expects images in the following folders (as you described):
 *  - C:\\Users\\folli\\Pictures\\img-imoveis\\casa
 *  - C:\\Users\\folli\\Pictures\\img-imoveis\\apartamento
 *
 * The script will copy images to backend/uploads and create 10 properties (5 casas, 5 apartamentos),
 * 5 users, 5 brokers (agents) and 5 directors with companies. It will also clear many tables before inserting.
 */

async function main() {
  if (process.env.RUN_SEED_LOCAL !== 'true') {
    console.log('Seed aborted: set RUN_SEED_LOCAL=true to run this script')
    process.exit(0)
  }

  const sourceCasa = 'C:\\Users\\folli\\Pictures\\img-imoveis\\casa'
  const sourceApt = 'C:\\Users\\folli\\Pictures\\img-imoveis\\apartamento'
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

  if (!fs.existsSync(sourceCasa) || !fs.existsSync(sourceApt)) {
    console.error('Image folders not found. Make sure the two folders exist:')
    console.error(sourceCasa)
    console.error(sourceApt)
    process.exit(1)
  }

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

  // Read files
  const casaFiles = fs.readdirSync(sourceCasa).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)).slice(0,5)
  const aptFiles = fs.readdirSync(sourceApt).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)).slice(0,5)

  if (casaFiles.length < 5 || aptFiles.length < 5) {
    console.error('Each folder must have at least 5 images')
    process.exit(1)
  }

  console.log('Copying images to uploads folder...')
  const copiedCasa: string[] = []
  const copiedApt: string[] = []

  for (const f of casaFiles) {
    const src = path.join(sourceCasa, f)
    const destName = `${Date.now()}-${Math.round(Math.random()*1e6)}-${f.replace(/[^a-zA-Z0-9.\-_]/g,'_')}`
    const dest = path.join(uploadsDir, destName)
    fs.copyFileSync(src, dest)
    copiedCasa.push(`/uploads/${destName}`)
  }

  for (const f of aptFiles) {
    const src = path.join(sourceApt, f)
    const destName = `${Date.now()}-${Math.round(Math.random()*1e6)}-${f.replace(/[^a-zA-Z0-9.\-_]/g,'_')}`
    const dest = path.join(uploadsDir, destName)
    fs.copyFileSync(src, dest)
    copiedApt.push(`/uploads/${destName}`)
  }

  console.log('Preparing to wipe database tables (in safe order)...')

  // Delete dependent records first
  await prisma.propertyView.deleteMany().catch(()=>{})
  await prisma.viewHistory.deleteMany().catch(()=>{})
  await prisma.favorite.deleteMany().catch(()=>{})
  await prisma.inquiry.deleteMany().catch(()=>{})
  await prisma.lead.deleteMany().catch(()=>{})
  await prisma.interaction.deleteMany().catch(()=>{})
  await prisma.savedSearch.deleteMany().catch(()=>{})
  await prisma.property.deleteMany().catch(()=>{})
  await prisma.$executeRaw`DELETE FROM "company_members"`.catch(()=>{}) // N:N relation
  await prisma.company.deleteMany().catch(()=>{})
  await prisma.refreshToken.deleteMany().catch(()=>{})
  await prisma.user.deleteMany().catch(()=>{})

  console.log('Database cleared (attempted deleteMany on known tables)')

  // Create 5 users
  const users: any[] = []
  for (let i=1;i<=5;i++){
    const pwd = await bcrypt.hash(`user${i}123`, 10)
    const u = await prisma.user.create({ data: { email: `user${i}@goiania.test`, password: pwd, firstName: `Usuario${i}`, lastName: 'Teste', role: 'USER', isVerified: true }})
    users.push({ email: `user${i}@goiania.test`, password: `user${i}123`, id: u.id })
  }

  // Create 5 broker agents (corretores comuns)
  const brokers: any[] = []
  for (let i=1;i<=5;i++){
    const pwd = await bcrypt.hash(`broker${i}123`, 10)
    const u = await prisma.user.create({ data: { email: `broker${i}@goiania.test`, password: pwd, firstName: `Corretor${i}`, lastName: 'Teste', role: 'BROKER', brokerRole: 'AGENT', isVerified: true }})
    brokers.push({ email: `broker${i}@goiania.test`, password: `broker${i}123`, id: u.id })
  }

  // Create 5 companies with directors (diretores de imobiliária)
  const directors: any[] = []
  for (let i=1;i<=5;i++){
    const pwd = await bcrypt.hash(`director${i}123`, 10)
    const director = await prisma.user.create({ data: { email: `director${i}@goiania.test`, password: pwd, firstName: `Diretor${i}`, lastName: 'Imobiliaria', role: 'BROKER', brokerRole: 'DIRECTOR', isVerified: true }})
    const company = await prisma.company.create({ data: { name: `Imobiliária ${i} Goiânia`, type: 'BROKER', licenseNumber: `CRECI-FAKE-${i}`, email: `imobiliaria${i}@goiania.test`, phone: '+55 62 99999-0000', address: `Endereco ${i}` }})
    
    // Adicionar diretor como membro DIRECTOR da empresa
    await prisma.companyMember.create({ data: { userId: director.id, companyId: company.id, role: 'DIRECTOR' }})
    
    directors.push({ email: `director${i}@goiania.test`, password: `director${i}123`, id: director.id, companyId: company.id })
  }

  console.log('Created users, broker agents and company directors')

  // Create properties: 5 houses (owned by broker agents) and 5 apartments (owned by directors)
  const properties: any[] = []
  for (let i=0;i<5;i++){
    const prop = await prisma.property.create({ data: {
      title: `Casa Modelo ${i+1} - Goiânia`,
      description: 'Casa ótima em bairro familiar',
      propertyType: 'HOUSE',
      price: 350000 + i*50000,
      priceType: 'SALE',
      bedrooms: 3,
      bathrooms: 2,
      area: 120 + i*10,
      parkingSpaces: 2,
      address: `Rua das Flores ${10+i} - Bairro Centro`,
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74000-000',
      images: [copiedCasa[i]],
      ownerId: brokers[i].id
    }})
    properties.push(prop)
  }

  for (let i=0;i<5;i++){
    const prop = await prisma.property.create({ data: {
      title: `Apartamento Modelo ${i+1} - Goiânia`,
      description: 'Apartamento confortável e bem localizado',
      propertyType: 'APARTMENT',
      price: 250000 + i*30000,
      priceType: 'SALE',
      bedrooms: 2,
      bathrooms: 1,
      area: 70 + i*5,
      parkingSpaces: 1,
      address: `Av. Goiás ${200+i} - Bairro Centro`,
      city: 'Goiânia',
      state: 'GO',
      zipCode: '74000-000',
      images: [copiedApt[i]],
      ownerId: directors[i].id,
      companyId: directors[i].companyId
    }})
    properties.push(prop)
  }

  console.log('Inserted properties')

  // Write credentials file for easy login
  const credsPath = path.join(__dirname, '..', '..', 'SEED-CREDENTIALS.txt')
  const lines: string[] = []
  lines.push('=== USUÁRIOS (USER) ===')
  users.forEach(u => lines.push(`${u.email} / ${u.password}`))
  lines.push('\n=== CORRETORES (BROKER - AGENT) ===')
  brokers.forEach(b => lines.push(`${b.email} / ${b.password}`))
  lines.push('\n=== DIRETORES DE IMOBILIÁRIA (BROKER - DIRECTOR) ===')
  directors.forEach((d: any) => lines.push(`${d.email} / ${d.password}`))

  fs.writeFileSync(credsPath, lines.join('\n'))
  console.log('Credentials written to', credsPath)

  console.log('Seeding complete')
}

main().catch(e => {
  console.error('Seed error', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

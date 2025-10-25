/**
 * Script para inserir 10 casas de luxo (acima de R$ 1.000.000)
 * 
 * Objetivo: Testar se o sistema de busca dinâmica atualiza automaticamente
 * os valores min/max do slider quando novos imóveis são inseridos
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Dados das 10 casas de luxo
const luxuryHouses = [
  {
    title: 'Casa de Luxo com Piscina e Jardim Amplo',
    description: 'Magnífica casa de alto padrão com 4 suítes, piscina aquecida, churrasqueira gourmet, jardim com paisagismo, garagem para 4 carros e sistema de segurança completo.',
    price: 1250000,
    bedrooms: 4,
    bathrooms: 5,
    area: 350,
    address: 'Rua dos Jacarandás, 1234',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-200',
    latitude: -23.561684,
    longitude: -46.656139,
    propertyType: 'HOUSE',
    image: '4420024189.jpg'
  },
  {
    title: 'Mansão em Condomínio Fechado de Alto Padrão',
    description: 'Casa espetacular em condomínio exclusivo, com 5 suítes, sala de cinema, academia, spa, piscina infinity, adega climatizada e vista panorâmica.',
    price: 2800000,
    bedrooms: 5,
    bathrooms: 6,
    area: 550,
    address: 'Avenida das Magnólias, 456',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01451-000',
    latitude: -23.574729,
    longitude: -46.681503,
    propertyType: 'HOUSE',
    image: 'casa-em-condominio-a-venda-4-quartos-atibaia-sp-no-bairro-atibaia-park-com-garagem-230m2-1fe438f6cde44f93b0af255da32...'
  },
  {
    title: 'Casa Moderna com Design Contemporâneo',
    description: 'Arquitetura moderna com linhas retas, acabamento premium, 4 suítes, cozinha gourmet integrada, piscina com borda infinita, deck e automação total.',
    price: 1850000,
    bedrooms: 4,
    bathrooms: 5,
    area: 420,
    address: 'Rua dos Arquitetos, 789',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04543-120',
    latitude: -23.587416,
    longitude: -46.682945,
    propertyType: 'HOUSE',
    image: 'maxresdefault (1).jpg'
  },
  {
    title: 'Sobrado de Luxo com 3 Pavimentos',
    description: 'Casa de alto padrão com 3 andares, elevador privativo, 5 suítes master, terraço com churrasqueira, piscina coberta e aquecida, sauna e hidromassagem.',
    price: 3200000,
    bedrooms: 5,
    bathrooms: 7,
    area: 600,
    address: 'Alameda dos Sonhos, 321',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01452-002',
    latitude: -23.572326,
    longitude: -46.679872,
    propertyType: 'HOUSE',
    image: 'maxresdefault.jpg'
  },
  {
    title: 'Casa com Vista para o Mar e Praia Privativa',
    description: 'Propriedade exclusiva com acesso direto à praia, 4 suítes, varanda gourmet, piscina com borda infinita, deck de madeira e jardim tropical.',
    price: 4500000,
    bedrooms: 4,
    bathrooms: 5,
    area: 480,
    address: 'Rua da Praia, 100',
    city: 'Guarujá',
    state: 'SP',
    zipCode: '11432-000',
    latitude: -23.993585,
    longitude: -46.256279,
    propertyType: 'HOUSE',
    image: 'OIP (1).webp'
  },
  {
    title: 'Chácara Urbana de Alto Padrão',
    description: 'Casa principal com 6 suítes, casa de hóspedes, quadra poliesportiva, piscina olímpica, lago com peixes, pomar, horta orgânica e heliponto.',
    price: 5800000,
    bedrooms: 6,
    bathrooms: 8,
    area: 850,
    address: 'Estrada do Campo, 2000',
    city: 'Cotia',
    state: 'SP',
    zipCode: '06709-015',
    latitude: -23.603713,
    longitude: -46.919070,
    propertyType: 'HOUSE',
    image: 'OIP (2).webp'
  },
  {
    title: 'Casa de Campo com Área de Lazer Completa',
    description: 'Residência campestre com 5 suítes, salão de festas para 200 pessoas, piscina semi-olímpica, quadra de tênis, campo de futebol e estábulo.',
    price: 3900000,
    bedrooms: 5,
    bathrooms: 6,
    area: 700,
    address: 'Rodovia dos Bandeirantes, Km 45',
    city: 'Jundiaí',
    state: 'SP',
    zipCode: '13212-010',
    latitude: -23.186475,
    longitude: -46.884036,
    propertyType: 'HOUSE',
    image: 'OIP (3).webp'
  },
  {
    title: 'Casa Neoclássica com Jardim Europeu',
    description: 'Arquitetura clássica europeia, 4 suítes master, biblioteca, sala de música, jardim com fontes e estátuas, garagem subterrânea para 6 carros.',
    price: 2650000,
    bedrooms: 4,
    bathrooms: 5,
    area: 520,
    address: 'Avenida Europa, 1500',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01449-000',
    latitude: -23.577178,
    longitude: -46.686222,
    propertyType: 'HOUSE',
    image: 'OIP (6).webp'
  },
  {
    title: 'Casa Tecnológica Totalmente Automatizada',
    description: 'Smart home de última geração, 5 suítes, controle total por aplicativo, painéis solares, sistema de reuso de água, cinema 4D e garagem inteligente.',
    price: 3400000,
    bedrooms: 5,
    bathrooms: 6,
    area: 580,
    address: 'Rua da Inovação, 2025',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04711-000',
    latitude: -23.616295,
    longitude: -46.697916,
    propertyType: 'HOUSE',
    image: 'OIP.webp'
  },
  {
    title: 'Casa com Mirante e Vista 360° da Cidade',
    description: 'Localização privilegiada no topo da colina, 4 suítes, mirante panorâmico, piscina com borda infinita, adega para 500 garrafas e observatório astronômico.',
    price: 4200000,
    bedrooms: 4,
    bathrooms: 5,
    area: 490,
    address: 'Rua do Mirante, 777',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '02511-000',
    latitude: -23.494581,
    longitude: -46.636587,
    propertyType: 'HOUSE',
    image: 'R.jpg'
  }
];

async function copyImages() {
  console.log('📸 Copiando imagens...\n');
  
  const sourceDir = 'C:\\Users\\folli\\Pictures\\img-imoveis\\new';
  const destDir = path.join(__dirname, '../../uploads');
  
  // Criar pasta uploads se não existir
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  for (const house of luxuryHouses) {
    const sourcePath = path.join(sourceDir, house.image);
    const destPath = path.join(destDir, house.image);
    
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copiado: ${house.image}`);
      } else {
        console.log(`⚠️  Não encontrado: ${house.image}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao copiar ${house.image}:`, error);
    }
  }
  
  console.log('\n');
}

async function insertLuxuryHouses() {
  console.log('🏠 Inserindo casas de luxo no banco de dados...\n');
  
  try {
    // Buscar empresa e corretor para associar aos imóveis
    const company = await prisma.company.findFirst();
    const broker = await prisma.user.findFirst({
      where: { role: 'BROKER' }
    });
    
    if (!company || !broker) {
      console.error('❌ Empresa ou corretor não encontrado. Execute o seed primeiro.');
      return;
    }
    
    console.log(`📌 Usando empresa: ${company.name}`);
    console.log(`📌 Usando corretor: ${broker.firstName} ${broker.lastName}\n`);
    
    let insertedCount = 0;
    
    for (const house of luxuryHouses) {
      try {
        const property = await prisma.property.create({
          data: {
            title: house.title,
            description: house.description,
            price: house.price,
            bedrooms: house.bedrooms,
            bathrooms: house.bathrooms,
            area: house.area,
            address: house.address,
            city: house.city,
            state: house.state,
            zipCode: house.zipCode,
            latitude: house.latitude,
            longitude: house.longitude,
            propertyType: house.propertyType as any,
            status: 'AVAILABLE',
            images: [`/uploads/${house.image}`],
            companyId: company.id,
            ownerId: broker.id
          }
        });
        
        insertedCount++;
        console.log(`✅ [${insertedCount}/10] ${house.title}`);
        console.log(`   💰 R$ ${house.price.toLocaleString('pt-BR')}`);
        console.log(`   📍 ${house.city}, ${house.state}`);
        console.log(`   🏠 ${house.bedrooms} quartos, ${house.bathrooms} banheiros, ${house.area}m²\n`);
        
      } catch (error) {
        console.error(`❌ Erro ao inserir ${house.title}:`, error);
      }
    }
    
    console.log(`\n✅ Total inserido: ${insertedCount}/10 casas de luxo\n`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function verifyPriceRange() {
  console.log('📊 Verificando faixa de preços no banco...\n');
  
  const result = await prisma.property.aggregate({
    where: { status: 'AVAILABLE' },
    _min: { price: true },
    _max: { price: true },
    _count: true
  });
  
  console.log(`Total de imóveis: ${result._count}`);
  console.log(`Preço mínimo: R$ ${result._min.price?.toLocaleString('pt-BR')}`);
  console.log(`Preço máximo: R$ ${result._max.price?.toLocaleString('pt-BR')}`);
  
  // Contar casas
  const housesCount = await prisma.property.count({
    where: { 
      propertyType: 'HOUSE',
      status: 'AVAILABLE'
    }
  });
  
  // Contar casas acima de 1M
  const luxuryHousesCount = await prisma.property.count({
    where: { 
      propertyType: 'HOUSE',
      price: { gte: 1000000 },
      status: 'AVAILABLE'
    }
  });
  
  console.log(`Total de casas: ${housesCount}`);
  console.log(`Casas acima de R$ 1.000.000: ${luxuryHousesCount}`);
  
  console.log('\n✅ O slider dinâmico DEVE atualizar automaticamente para:');
  console.log(`   Min: R$ ${result._min.price?.toLocaleString('pt-BR')}`);
  console.log(`   Max: R$ ${result._max.price?.toLocaleString('pt-BR')}`);
  console.log('\n🔄 Recarregue a página http://localhost:3000 para ver a mudança!\n');
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🏠 SEED: CASAS DE LUXO (Acima de R$ 1.000.000)');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  // Passo 1: Copiar imagens
  await copyImages();
  
  // Passo 2: Inserir imóveis
  await insertLuxuryHouses();
  
  // Passo 3: Verificar faixa de preços
  await verifyPriceRange();
  
  console.log('════════════════════════════════════════════════════════════════');
  console.log('✅ SEED COMPLETO!');
  console.log('════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

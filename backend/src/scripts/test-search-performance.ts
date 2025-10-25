/**
 * Test Search Performance Script
 * 
 * Este script testa o sistema de busca com 100 faixas de preços diferentes
 * para validar robustez, performance e precisão dos filtros.
 * 
 * Funcionalidades:
 * - Testa 100 combinações de filtros (preço, tipo, localização)
 * - Mede tempo de resposta de cada requisição
 * - Valida integridade dos dados retornados
 * - Gera relatório detalhado de performance
 * 
 * Uso:
 * npm run test:search-performance
 * ou
 * tsx backend/src/scripts/test-search-performance.ts
 * 
 * @version 1.0.0
 * @date 2025-10-25
 */

import axios, { AxiosError } from 'axios'
import fs from 'fs'
import path from 'path'

// Configurações
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001'
const SUPER_ADMIN_KEY = 'SUPER_ADMIN_KEY_2025_DEV_ONLY'
const NUM_TESTS = 100
const OUTPUT_DIR = path.join(__dirname, '../../test-results')

// Tipos
interface TestCase {
  id: number
  description: string
  filters: {
    type?: string
    value?: number
    priceMin?: number
    priceMax?: number
    city?: string
    bedrooms?: number
  }
}

interface TestResult {
  testId: number
  description: string
  filters: any
  success: boolean
  responseTime: number
  propertiesFound: number
  error?: string
  validated: boolean
  validationErrors: string[]
}

interface TestSummary {
  totalTests: number
  successfulTests: number
  failedTests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  totalPropertiesFound: number
  testsWithResults: number
  testsWithoutResults: number
  validationsPassed: number
  validationsFailed: number
  timestamp: string
  results: TestResult[]
}

// Gerar casos de teste
function generateTestCases(): TestCase[] {
  const cases: TestCase[] = []
  let id = 1

  // 1. Testes de faixas de preço (50 testes)
  const priceRanges = [
    50000, 75000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000,
    500000, 550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000,
    1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000,
    2000000, 2200000, 2400000, 2600000, 2800000, 3000000, 3500000, 4000000, 4500000, 5000000,
    5500000, 6000000, 6500000, 7000000, 7500000, 8000000, 8500000, 9000000, 9500000, 10000000
  ]

  priceRanges.forEach(maxPrice => {
    cases.push({
      id: id++,
      description: `Buscar imóveis até R$ ${maxPrice.toLocaleString('pt-BR')}`,
      filters: { value: maxPrice }
    })
  })

  // 2. Testes de tipo + preço (20 testes)
  const types = ['Casa', 'Apartamento']
  const pricePoints = [150000, 300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000]
  
  types.forEach(type => {
    pricePoints.forEach(price => {
      cases.push({
        id: id++,
        description: `${type} até R$ ${price.toLocaleString('pt-BR')}`,
        filters: { type, value: price }
      })
    })
  })

  // 3. Testes de localização + preço (15 testes)
  const cities = ['Goiânia', 'Aparecida de Goiânia', 'Senador Canedo']
  const cityPrices = [200000, 400000, 600000, 800000, 1000000]
  
  cities.forEach(city => {
    cityPrices.forEach(price => {
      cases.push({
        id: id++,
        description: `Imóveis em ${city} até R$ ${price.toLocaleString('pt-BR')}`,
        filters: { city, value: price }
      })
    })
  })

  // 4. Testes de características (15 testes)
  const bedroomOptions = [1, 2, 3, 4, 5]
  const bedroomPrices = [300000, 500000, 1000000]
  
  bedroomOptions.forEach(bedrooms => {
    bedroomPrices.forEach(price => {
      cases.push({
        id: id++,
        description: `${bedrooms} quartos até R$ ${price.toLocaleString('pt-BR')}`,
        filters: { bedrooms, value: price }
      })
    })
  })

  // Retornar apenas os primeiros 100
  return cases.slice(0, NUM_TESTS)
}

// Validar resultado da busca
function validateSearchResult(result: any, filters: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!result || typeof result !== 'object') {
    errors.push('Resultado não é um objeto válido')
    return { valid: false, errors }
  }

  if (!result.success) {
    errors.push('success !== true')
  }

  if (!result.data) {
    errors.push('data não existe')
    return { valid: false, errors }
  }

  if (!Array.isArray(result.data.properties)) {
    errors.push('properties não é um array')
    return { valid: false, errors }
  }

  // Validar filtro de preço
  if (filters.value || filters.priceMax) {
    const maxPrice = filters.value || filters.priceMax
    const invalidProperties = result.data.properties.filter((p: any) => p.price > maxPrice)
    
    if (invalidProperties.length > 0) {
      errors.push(`${invalidProperties.length} imóveis excedem o preço máximo de R$ ${maxPrice}`)
    }
  }

  // Validar filtro de tipo
  if (filters.type || filters.propertyType) {
    const typeMap: Record<string, string> = {
      'casa': 'HOUSE',
      'apartamento': 'APARTMENT'
    }
    const expectedType = filters.propertyType || typeMap[filters.type?.toLowerCase()]
    
    if (expectedType) {
      const invalidTypes = result.data.properties.filter((p: any) => p.propertyType !== expectedType)
      if (invalidTypes.length > 0) {
        errors.push(`${invalidTypes.length} imóveis não correspondem ao tipo ${expectedType}`)
      }
    }
  }

  // Validar estrutura de paginação
  if (!result.data.pagination) {
    errors.push('Paginação não existe')
  } else {
    if (typeof result.data.pagination.total !== 'number') {
      errors.push('pagination.total não é número')
    }
    if (typeof result.data.pagination.page !== 'number') {
      errors.push('pagination.page não é número')
    }
  }

  return { valid: errors.length === 0, errors }
}

// Executar um teste
async function runTest(testCase: TestCase): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Construir query string
    const params = new URLSearchParams()
    Object.entries(testCase.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value))
      }
    })

    // Fazer requisição
    const response = await axios.get(`${API_BASE_URL}/imoveis?${params.toString()}`, {
      headers: {
        'X-Super-Admin-Key': SUPER_ADMIN_KEY
      },
      timeout: 10000
    })

    const responseTime = Date.now() - startTime
    const data = response.data

    // Validar resultado
    const validation = validateSearchResult(data, testCase.filters)

    return {
      testId: testCase.id,
      description: testCase.description,
      filters: testCase.filters,
      success: true,
      responseTime,
      propertiesFound: data.data?.properties?.length || 0,
      validated: validation.valid,
      validationErrors: validation.errors
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime
    
    let errorMessage = 'Erro desconhecido'
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.error || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      testId: testCase.id,
      description: testCase.description,
      filters: testCase.filters,
      success: false,
      responseTime,
      propertiesFound: 0,
      error: errorMessage,
      validated: false,
      validationErrors: [errorMessage]
    }
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de performance do sistema de busca...\n')
  console.log(`📊 Total de testes: ${NUM_TESTS}`)
  console.log(`🔗 API URL: ${API_BASE_URL}`)
  console.log(`🔑 Super Admin Key: ${SUPER_ADMIN_KEY}\n`)

  const testCases = generateTestCases()
  const results: TestResult[] = []

  // Executar testes sequencialmente (para não sobrecarregar)
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    process.stdout.write(`\r⏳ Executando teste ${i + 1}/${testCases.length}: ${testCase.description}`.padEnd(100))
    
    const result = await runTest(testCase)
    results.push(result)

    // Pequeno delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log('\n\n✅ Todos os testes concluídos!\n')

  // Gerar sumário
  const summary = generateSummary(results)
  
  // Exibir sumário
  displaySummary(summary)
  
  // Salvar relatório
  saveReport(summary)
  
  return summary
}

// Gerar sumário dos testes
function generateSummary(results: TestResult[]): TestSummary {
  const successfulTests = results.filter(r => r.success).length
  const failedTests = results.filter(r => !r.success).length
  const responseTimes = results.map(r => r.responseTime)
  const testsWithResults = results.filter(r => r.propertiesFound > 0).length
  const testsWithoutResults = results.filter(r => r.propertiesFound === 0).length
  const validationsPassed = results.filter(r => r.validated).length
  const validationsFailed = results.filter(r => !r.validated).length

  return {
    totalTests: results.length,
    successfulTests,
    failedTests,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    totalPropertiesFound: results.reduce((sum, r) => sum + r.propertiesFound, 0),
    testsWithResults,
    testsWithoutResults,
    validationsPassed,
    validationsFailed,
    timestamp: new Date().toISOString(),
    results
  }
}

// Exibir sumário no console
function displaySummary(summary: TestSummary) {
  console.log('=' .repeat(80))
  console.log('📈 RELATÓRIO DE PERFORMANCE - SISTEMA DE BUSCA')
  console.log('='.repeat(80))
  console.log('')
  console.log(`📅 Data/Hora: ${new Date(summary.timestamp).toLocaleString('pt-BR')}`)
  console.log('')
  console.log('📊 ESTATÍSTICAS GERAIS:')
  console.log(`   Total de testes: ${summary.totalTests}`)
  console.log(`   ✅ Sucessos: ${summary.successfulTests} (${(summary.successfulTests/summary.totalTests*100).toFixed(1)}%)`)
  console.log(`   ❌ Falhas: ${summary.failedTests} (${(summary.failedTests/summary.totalTests*100).toFixed(1)}%)`)
  console.log('')
  console.log('⚡ PERFORMANCE:')
  console.log(`   Tempo médio: ${summary.averageResponseTime.toFixed(2)}ms`)
  console.log(`   Tempo mínimo: ${summary.minResponseTime}ms`)
  console.log(`   Tempo máximo: ${summary.maxResponseTime}ms`)
  console.log('')
  console.log('🎯 RESULTADOS:')
  console.log(`   Total de imóveis encontrados: ${summary.totalPropertiesFound}`)
  console.log(`   Buscas com resultados: ${summary.testsWithResults}`)
  console.log(`   Buscas sem resultados: ${summary.testsWithoutResults}`)
  console.log('')
  console.log('✔️  VALIDAÇÕES:')
  console.log(`   Validações passou: ${summary.validationsPassed}`)
  console.log(`   Validações falhou: ${summary.validationsFailed}`)
  console.log('')
  
  if (summary.failedTests > 0) {
    console.log('❌ TESTES COM FALHAS:')
    summary.results.filter(r => !r.success).forEach(r => {
      console.log(`   #${r.testId}: ${r.description}`)
      console.log(`      Erro: ${r.error}`)
    })
    console.log('')
  }
  
  if (summary.validationsFailed > 0) {
    console.log('⚠️  VALIDAÇÕES QUE FALHARAM:')
    summary.results.filter(r => !r.validated).forEach(r => {
      console.log(`   #${r.testId}: ${r.description}`)
      r.validationErrors.forEach(err => console.log(`      - ${err}`))
    })
    console.log('')
  }
  
  console.log('='.repeat(80))
}

// Salvar relatório em arquivo
function saveReport(summary: TestSummary) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `search-performance-${timestamp}.json`
  const filepath = path.join(OUTPUT_DIR, filename)

  fs.writeFileSync(filepath, JSON.stringify(summary, null, 2), 'utf-8')
  
  console.log(`\n💾 Relatório salvo em: ${filepath}`)
  
  // Também salvar versão legível
  const readableFilename = `search-performance-${timestamp}.txt`
  const readableFilepath = path.join(OUTPUT_DIR, readableFilename)
  
  let readable = '='.repeat(80) + '\n'
  readable += 'RELATÓRIO DE PERFORMANCE - SISTEMA DE BUSCA\n'
  readable += '='.repeat(80) + '\n\n'
  readable += `Data/Hora: ${new Date(summary.timestamp).toLocaleString('pt-BR')}\n\n`
  readable += `Total de testes: ${summary.totalTests}\n`
  readable += `Sucessos: ${summary.successfulTests}\n`
  readable += `Falhas: ${summary.failedTests}\n`
  readable += `Tempo médio: ${summary.averageResponseTime.toFixed(2)}ms\n`
  readable += `Total de imóveis: ${summary.totalPropertiesFound}\n\n`
  
  readable += 'DETALHES DOS TESTES:\n'
  readable += '-'.repeat(80) + '\n'
  summary.results.forEach(r => {
    readable += `\nTeste #${r.testId}: ${r.description}\n`
    readable += `  Status: ${r.success ? '✅ Sucesso' : '❌ Falha'}\n`
    readable += `  Tempo: ${r.responseTime}ms\n`
    readable += `  Imóveis: ${r.propertiesFound}\n`
    readable += `  Validação: ${r.validated ? '✅ OK' : '❌ Falhou'}\n`
    if (r.error) {
      readable += `  Erro: ${r.error}\n`
    }
    if (r.validationErrors.length > 0) {
      readable += `  Erros de validação:\n`
      r.validationErrors.forEach(err => readable += `    - ${err}\n`)
    }
  })
  
  fs.writeFileSync(readableFilepath, readable, 'utf-8')
  console.log(`💾 Relatório legível salvo em: ${readableFilepath}\n`)
}

// Executar
if (require.main === module) {
  runAllTests()
    .then(summary => {
      if (summary.failedTests > 0 || summary.validationsFailed > 0) {
        console.log('\n⚠️  Alguns testes falharam. Verifique o relatório para detalhes.')
        process.exit(1)
      } else {
        console.log('\n🎉 Todos os testes passaram com sucesso!')
        process.exit(0)
      }
    })
    .catch(error => {
      console.error('\n❌ Erro fatal ao executar testes:', error)
      process.exit(1)
    })
}

export { runAllTests, generateTestCases, validateSearchResult }

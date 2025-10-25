/**
 * SCRIPT DE TESTE MASSIVO DO SISTEMA DE BUSCA
 * 
 * Este script testa o sistema de busca com 100 faixas diferentes de preço
 * para validar a robustez e correção dos filtros implementados.
 * 
 * OBJETIVO:
 * - Validar que os filtros de preço funcionam corretamente
 * - Testar performance com múltiplas requisições
 * - Identificar possíveis bugs ou inconsistências
 * - Gerar relatório detalhado dos testes
 * 
 * COMO EXECUTAR:
 * 1. Certifique-se de que o backend está rodando
 * 2. Ative o TEST_MODE no .env: TEST_MODE=true
 * 3. Execute: tsx src/scripts/test-search.ts
 * 
 * REQUISITOS:
 * - Backend rodando em http://localhost:8001
 * - Banco de dados com imóveis cadastrados
 * - Rate limiting configurado para modo de teste
 */

// ====================================
// CONFIGURAÇÕES
// ====================================

const API_BASE_URL = 'http://localhost:8001'
const ENDPOINT = '/api/search'

// Gerar 100 faixas de preço para teste
const generatePriceRanges = (): Array<{ min: number; max: number }> => {
  const ranges: Array<{ min: number; max: number }> = []
  
  // Faixas de 50k até 2M (incrementos variados)
  const pricePoints = []
  
  // 0-500k: incrementos de 25k (20 pontos)
  for (let i = 50000; i <= 500000; i += 25000) {
    pricePoints.push(i)
  }
  
  // 500k-1M: incrementos de 50k (10 pontos)
  for (let i = 550000; i <= 1000000; i += 50000) {
    pricePoints.push(i)
  }
  
  // 1M-2M: incrementos de 100k (10 pontos)
  for (let i = 1100000; i <= 2000000; i += 100000) {
    pricePoints.push(i)
  }
  
  // Criar faixas: cada ponto é um max, min é o anterior
  for (let i = 0; i < pricePoints.length; i++) {
    const min = i === 0 ? 0 : pricePoints[i - 1]
    const max = pricePoints[i]
    ranges.push({ min, max })
  }
  
  return ranges.slice(0, 100) // Garantir exatamente 100 faixas
}

// ====================================
// TIPOS
// ====================================

interface TestResult {
  testNumber: number
  priceMin: number
  priceMax: number
  success: boolean
  count: number
  executionTime: number
  error?: string
  allPropertiesInRange: boolean
  lowestPrice?: number
  highestPrice?: number
}

interface TestSummary {
  totalTests: number
  successful: number
  failed: number
  totalProperties: number
  averageExecutionTime: number
  totalExecutionTime: number
  errors: string[]
}

// ====================================
// FUNÇÕES DE TESTE
// ====================================

/**
 * Testa uma faixa de preço específica
 */
async function testPriceRange(
  testNumber: number,
  priceMin: number,
  priceMax: number
): Promise<TestResult> {
  try {
    // Construir URL
    const params = new URLSearchParams({
      priceMin: priceMin.toString(),
      priceMax: priceMax.toString(),
      limit: '100' // Buscar mais resultados para validar
    })
    
    const url = `${API_BASE_URL}${ENDPOINT}?${params.toString()}`
    
    // Fazer requisição
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const endTime = Date.now()
    
    if (!response.ok) {
      const errorData = await response.text()
      return {
        testNumber,
        priceMin,
        priceMax,
        success: false,
        count: 0,
        executionTime: endTime - startTime,
        error: `HTTP ${response.status}: ${errorData}`,
        allPropertiesInRange: false
      }
    }
    
    const data: any = await response.json()
    
    // Validar estrutura da resposta
    if (!data.success || !data.data || !data.data.properties) {
      return {
        testNumber,
        priceMin,
        priceMax,
        success: false,
        count: 0,
        executionTime: endTime - startTime,
        error: 'Estrutura de resposta inválida',
        allPropertiesInRange: false
      }
    }
    
    const properties = data.data.properties
    const count = properties.length
    
    // Validar que todos os imóveis estão na faixa de preço
    let allInRange = true
    let lowestPrice = Infinity
    let highestPrice = -Infinity
    
    for (const prop of properties) {
      const price = prop.price
      
      if (price < lowestPrice) lowestPrice = price
      if (price > highestPrice) highestPrice = price
      
      if (price < priceMin || price > priceMax) {
        allInRange = false
        console.error(`❌ ERRO: Imóvel fora da faixa! ID: ${prop.id}, Preço: ${price}, Faixa: ${priceMin}-${priceMax}`)
      }
    }
    
    return {
      testNumber,
      priceMin,
      priceMax,
      success: true,
      count,
      executionTime: data.data.executionTime || (endTime - startTime),
      allPropertiesInRange: allInRange,
      lowestPrice: lowestPrice === Infinity ? undefined : lowestPrice,
      highestPrice: highestPrice === -Infinity ? undefined : highestPrice
    }
    
  } catch (error: any) {
    return {
      testNumber,
      priceMin,
      priceMax,
      success: false,
      count: 0,
      executionTime: 0,
      error: error.message,
      allPropertiesInRange: false
    }
  }
}

/**
 * Formata número em BRL
 */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Executa todos os testes
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 INICIANDO TESTE MASSIVO DO SISTEMA DE BUSCA')
  console.log('=' .repeat(70))
  console.log(`📊 Endpoint: ${API_BASE_URL}${ENDPOINT}`)
  console.log(`🎯 Total de testes: 100 faixas de preço diferentes`)
  console.log('=' .repeat(70))
  console.log()
  
  const ranges = generatePriceRanges()
  const results: TestResult[] = []
  
  const totalStartTime = Date.now()
  
  // Executar testes sequencialmente (para não sobrecarregar)
  for (let i = 0; i < ranges.length; i++) {
    const { min, max } = ranges[i]
    const testNumber = i + 1
    
    // Log de progresso
    if (testNumber % 10 === 0) {
      console.log(`📈 Progresso: ${testNumber}/100 testes completos...`)
    }
    
    const result = await testPriceRange(testNumber, min, max)
    results.push(result)
    
    // Log de erro imediato
    if (!result.success) {
      console.error(`❌ Teste ${testNumber} FALHOU: ${result.error}`)
    } else if (!result.allPropertiesInRange) {
      console.error(`⚠️  Teste ${testNumber}: Alguns imóveis fora da faixa!`)
    }
    
    // Pequeno delay para evitar sobrecarga (10ms)
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  const totalEndTime = Date.now()
  const totalExecutionTime = totalEndTime - totalStartTime
  
  // ====================================
  // GERAR RELATÓRIO
  // ====================================
  
  console.log()
  console.log('=' .repeat(70))
  console.log('📋 RELATÓRIO DE TESTES')
  console.log('=' .repeat(70))
  console.log()
  
  // Calcular estatísticas
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const totalProperties = results.reduce((sum, r) => sum + r.count, 0)
  const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length
  const validationErrors = results.filter(r => r.success && !r.allPropertiesInRange).length
  
  // Resultados gerais
  console.log('✅ RESULTADOS GERAIS:')
  console.log(`   Total de testes: ${results.length}`)
  console.log(`   Sucesso: ${successful} (${((successful / results.length) * 100).toFixed(1)}%)`)
  console.log(`   Falhas: ${failed} (${((failed / results.length) * 100).toFixed(1)}%)`)
  console.log(`   Erros de validação: ${validationErrors}`)
  console.log()
  
  // Performance
  console.log('⚡ PERFORMANCE:')
  console.log(`   Tempo total: ${(totalExecutionTime / 1000).toFixed(2)}s`)
  console.log(`   Tempo médio por teste: ${avgExecutionTime.toFixed(2)}ms`)
  console.log(`   Total de imóveis retornados: ${totalProperties}`)
  console.log()
  
  // Testes com mais resultados
  console.log('🏆 TOP 10 FAIXAS COM MAIS IMÓVEIS:')
  const topResults = [...results]
    .filter(r => r.success)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  topResults.forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${formatBRL(r.priceMin)} - ${formatBRL(r.priceMax)}: ${r.count} imóveis`)
  })
  console.log()
  
  // Erros encontrados
  if (failed > 0) {
    console.log('❌ ERROS ENCONTRADOS:')
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   Teste ${r.testNumber} (${formatBRL(r.priceMin)} - ${formatBRL(r.priceMax)}): ${r.error}`)
      })
    console.log()
  }
  
  // Erros de validação
  if (validationErrors > 0) {
    console.log('⚠️  ERROS DE VALIDAÇÃO (imóveis fora da faixa):')
    results
      .filter(r => r.success && !r.allPropertiesInRange)
      .forEach(r => {
        console.log(`   Teste ${r.testNumber} (${formatBRL(r.priceMin)} - ${formatBRL(r.priceMax)})`)
        console.log(`     Esperado: ${formatBRL(r.priceMin)} - ${formatBRL(r.priceMax)}`)
        console.log(`     Encontrado: ${formatBRL(r.lowestPrice || 0)} - ${formatBRL(r.highestPrice || 0)}`)
      })
    console.log()
  }
  
  // Conclusão
  console.log('=' .repeat(70))
  if (failed === 0 && validationErrors === 0) {
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!')
    console.log('🎉 Sistema de busca está funcionando corretamente!')
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM!')
    console.log('🔧 Revise os erros acima e corrija os problemas.')
  }
  console.log('=' .repeat(70))
  console.log()
  
  // Salvar resultados em JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      successful,
      failed,
      validationErrors,
      totalProperties,
      averageExecutionTime: avgExecutionTime,
      totalExecutionTime
    },
    results
  }
  
  const fs = require('fs')
  const path = require('path')
  const reportPath = path.join(__dirname, '../../test-results.json')
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2))
  console.log(`💾 Relatório completo salvo em: ${reportPath}`)
}

// ====================================
// EXECUTAR
// ====================================

// Verificar se é execução direta
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✅ Script finalizado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error)
      process.exit(1)
    })
}

export { runAllTests, testPriceRange, generatePriceRanges }

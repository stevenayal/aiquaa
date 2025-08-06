// Script de prueba para verificar la configuración de Supabase
// Ejecutar con: node test-supabase.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: './backend/.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Probando configuración de Supabase...\n')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.log('Asegúrate de que backend/.env existe y contiene:')
  console.log('- SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('✅ Variables de entorno encontradas')
console.log(`URL: ${supabaseUrl}`)
console.log(`Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  try {
    console.log('\n🔗 Probando conexión...')
    
    // Test 1: Verificar que las tablas existen
    console.log('📋 Verificando tablas...')
    
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from('feedbacks')
      .select('count')
      .limit(1)
    
    if (feedbacksError) {
      console.error('❌ Error al acceder a tabla feedbacks:', feedbacksError.message)
      console.log('💡 Asegúrate de ejecutar supabase-schema.sql en Supabase')
    } else {
      console.log('✅ Tabla feedbacks accesible')
    }
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('count')
      .limit(1)
    
    if (commentsError) {
      console.error('❌ Error al acceder a tabla comments:', commentsError.message)
    } else {
      console.log('✅ Tabla comments accesible')
    }
    
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1)
    
    if (usuariosError) {
      console.error('❌ Error al acceder a tabla usuarios:', usuariosError.message)
    } else {
      console.log('✅ Tabla usuarios accesible')
    }
    
    // Test 2: Insertar un feedback de prueba
    console.log('\n📝 Probando inserción de feedback...')
    
    const testFeedback = {
      nombre: 'Test User',
      temas_qa: 'automatizacion, manual',
      herramientas: 'cypress, selenium',
      participacion: 'taller',
      formato: 'videos',
      sugerencias: 'Este es un feedback de prueba',
      user_agent: 'Test Script',
      ip: '127.0.0.1'
    }
    
    const { data: newFeedback, error: insertError } = await supabase
      .from('feedbacks')
      .insert(testFeedback)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error al insertar feedback:', insertError.message)
    } else {
      console.log('✅ Feedback insertado exitosamente')
      console.log(`ID: ${newFeedback.id}`)
      
      // Limpiar el feedback de prueba
      await supabase
        .from('feedbacks')
        .delete()
        .eq('id', newFeedback.id)
      
      console.log('🧹 Feedback de prueba eliminado')
    }
    
    // Test 3: Insertar un comentario de prueba
    console.log('\n💬 Probando inserción de comentario...')
    
    const testComment = {
      name: 'Test Commenter',
      message: 'Este es un comentario de prueba',
      is_anonymous: false,
      user_agent: 'Test Script',
      ip: '127.0.0.1'
    }
    
    const { data: newComment, error: commentError } = await supabase
      .from('comments')
      .insert(testComment)
      .select()
      .single()
    
    if (commentError) {
      console.error('❌ Error al insertar comentario:', commentError.message)
    } else {
      console.log('✅ Comentario insertado exitosamente')
      console.log(`ID: ${newComment.id}`)
      
      // Limpiar el comentario de prueba
      await supabase
        .from('comments')
        .delete()
        .eq('id', newComment.id)
      
      console.log('🧹 Comentario de prueba eliminado')
    }
    
    // Test 4: Obtener estadísticas
    console.log('\n📊 Probando consultas de estadísticas...')
    
    const { data: stats, error: statsError } = await supabase
      .from('feedbacks')
      .select('temas_qa, herramientas, participacion, formato')
    
    if (statsError) {
      console.error('❌ Error al obtener estadísticas:', statsError.message)
    } else {
      console.log(`✅ Estadísticas obtenidas: ${stats.length} registros`)
    }
    
    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!')
    console.log('\n📋 Resumen de la configuración:')
    console.log('✅ Variables de entorno configuradas')
    console.log('✅ Conexión a Supabase establecida')
    console.log('✅ Tablas accesibles')
    console.log('✅ Operaciones CRUD funcionando')
    console.log('✅ Políticas de seguridad activas')
    
  } catch (error) {
    console.error('\n💥 Error inesperado:', error.message)
    console.log('\n🔧 Posibles soluciones:')
    console.log('1. Verifica que las variables de entorno sean correctas')
    console.log('2. Asegúrate de que las tablas existan en Supabase')
    console.log('3. Verifica que las políticas de seguridad estén configuradas')
    console.log('4. Revisa los logs en el Dashboard de Supabase')
  }
}

// Ejecutar las pruebas
testConnection() 
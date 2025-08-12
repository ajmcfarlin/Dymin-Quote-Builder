import { NextRequest, NextResponse } from 'next/server'
import { haloPSA } from '@/lib/halopsa'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing HaloPSA connection...')
    
    const isConnected = await haloPSA.testConnection()
    
    if (isConnected) {
      // Try to get some basic data to verify the connection works
      const clients = await haloPSA.getClients(5)
      
      return NextResponse.json({
        success: true,
        message: 'HaloPSA connection successful!',
        clientCount: clients.length,
        sampleClient: clients[0] || null
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'HaloPSA connection failed'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('HaloPSA test error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'HaloPSA connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
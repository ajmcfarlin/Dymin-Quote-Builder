import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { DEFAULT_DEVICES } from '@/lib/defaultSupportDevices'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Check if devices already exist
    const existingDevices = await prisma.supportDevice.count()
    
    if (existingDevices > 0) {
      return NextResponse.json({ message: 'Support devices already initialized' })
    }
    
    // Convert DEFAULT_DEVICES to database format
    const devicesToCreate = DEFAULT_DEVICES.map(device => ({
      deviceId: device.id,
      name: device.name,
      defaultSkillLevel: device.skillLevel,
      predictableOnsiteBusiness: device.hours.predictable.onsiteBusiness,
      predictableRemoteBusiness: device.hours.predictable.remoteBusiness,
      predictableOnsiteAfterHours: device.hours.predictable.onsiteAfterHours,
      predictableRemoteAfterHours: device.hours.predictable.remoteAfterHours,
      reactiveOnsiteBusiness: device.hours.reactive.onsiteBusiness,
      reactiveRemoteBusiness: device.hours.reactive.remoteBusiness,
      reactiveOnsiteAfterHours: device.hours.reactive.onsiteAfterHours,
      reactiveRemoteAfterHours: device.hours.reactive.remoteAfterHours,
      emergencyOnsiteBusiness: device.hours.emergency.onsiteBusiness,
      emergencyRemoteBusiness: device.hours.emergency.remoteBusiness,
      emergencyOnsiteAfterHours: device.hours.emergency.onsiteAfterHours,
      emergencyRemoteAfterHours: device.hours.emergency.remoteAfterHours,
    }))
    
    // Create all devices
    const createdDevices = await prisma.supportDevice.createMany({
      data: devicesToCreate
    })
    
    return NextResponse.json({ 
      message: 'Support devices initialized successfully',
      count: createdDevices.count 
    })
  } catch (error) {
    console.error('Error initializing support devices:', error)
    return NextResponse.json({ error: 'Failed to initialize support devices' }, { status: 500 })
  }
}
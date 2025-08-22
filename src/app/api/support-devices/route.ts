import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const devices = await prisma.supportDevice.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(devices)
  } catch (error) {
    console.error('Error fetching support devices:', error)
    return NextResponse.json({ error: 'Failed to fetch support devices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const device = await prisma.supportDevice.create({
      data: {
        deviceId: data.deviceId,
        name: data.name,
        defaultSkillLevel: data.defaultSkillLevel,
        predictableOnsiteBusiness: data.hours.predictable.onsiteBusiness,
        predictableRemoteBusiness: data.hours.predictable.remoteBusiness,
        predictableOnsiteAfterHours: data.hours.predictable.onsiteAfterHours,
        predictableRemoteAfterHours: data.hours.predictable.remoteAfterHours,
        reactiveOnsiteBusiness: data.hours.reactive.onsiteBusiness,
        reactiveRemoteBusiness: data.hours.reactive.remoteBusiness,
        reactiveOnsiteAfterHours: data.hours.reactive.onsiteAfterHours,
        reactiveRemoteAfterHours: data.hours.reactive.remoteAfterHours,
        emergencyOnsiteBusiness: data.hours.emergency.onsiteBusiness,
        emergencyRemoteBusiness: data.hours.emergency.remoteBusiness,
        emergencyOnsiteAfterHours: data.hours.emergency.onsiteAfterHours,
        emergencyRemoteAfterHours: data.hours.emergency.remoteAfterHours,
      }
    })
    
    return NextResponse.json(device)
  } catch (error) {
    console.error('Error creating support device:', error)
    return NextResponse.json({ error: 'Failed to create support device' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    const device = await prisma.supportDevice.update({
      where: { deviceId: data.deviceId },
      data: {
        name: data.name,
        defaultSkillLevel: data.defaultSkillLevel,
        predictableOnsiteBusiness: data.hours.predictable.onsiteBusiness,
        predictableRemoteBusiness: data.hours.predictable.remoteBusiness,
        predictableOnsiteAfterHours: data.hours.predictable.onsiteAfterHours,
        predictableRemoteAfterHours: data.hours.predictable.remoteAfterHours,
        reactiveOnsiteBusiness: data.hours.reactive.onsiteBusiness,
        reactiveRemoteBusiness: data.hours.reactive.remoteBusiness,
        reactiveOnsiteAfterHours: data.hours.reactive.onsiteAfterHours,
        reactiveRemoteAfterHours: data.hours.reactive.remoteAfterHours,
        emergencyOnsiteBusiness: data.hours.emergency.onsiteBusiness,
        emergencyRemoteBusiness: data.hours.emergency.remoteBusiness,
        emergencyOnsiteAfterHours: data.hours.emergency.onsiteAfterHours,
        emergencyRemoteAfterHours: data.hours.emergency.remoteAfterHours,
      }
    })
    
    return NextResponse.json(device)
  } catch (error) {
    console.error('Error updating support device:', error)
    return NextResponse.json({ error: 'Failed to update support device' }, { status: 500 })
  }
}
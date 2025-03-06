import { saveUser } from '@/actions/user.action'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
    const user = await req.json()
    await saveUser(user)
    return NextResponse.json({ success: true })
}

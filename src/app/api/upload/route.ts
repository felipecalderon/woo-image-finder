import { uploadToCDN } from '@/actions/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
    url: string
    name: string
}
export const POST = async (req: NextRequest) => {
    try {
        const { url, name }: RequestBody = await req.json()
        const uploadedURL = await uploadToCDN(url, name)
        return NextResponse.json({ url: uploadedURL })
    } catch (error) {
        return NextResponse.json({ error: true }, { status: 500 })
    }
}

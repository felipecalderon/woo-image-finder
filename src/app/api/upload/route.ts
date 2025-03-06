import { uploadToCDN } from '@/actions/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
    url: string
    name: string
}
export const POST = async (req: NextRequest) => {
    const { url, name }: RequestBody = await req.json()
    const uploadedURL = await uploadToCDN(url, name)
    return NextResponse.json({ url: uploadedURL })
}

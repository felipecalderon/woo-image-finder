import { hashSync } from 'bcryptjs'

export const getUser = async (email?: string) => {
    if (!email) return null
    const demoUser = {
        id: '1',
        name: 'Demo User',
        email,
        password: hashSync('123'),
        image: 'https://i.pravatar.cc/150?img=3',
    }
    return demoUser
}

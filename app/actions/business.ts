'use server'

import { cookies } from 'next/headers'

export async function setActiveBusiness(businessId: string) {
    cookies().set('active_business_id', businessId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
}

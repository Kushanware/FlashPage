'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

const STORAGE_KEY = 'flashpages_user_id'

export function useUserId() {
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        // Function to get or create guest ID
        const getGuestId = () => {
            let storedId = localStorage.getItem(STORAGE_KEY)
            if (!storedId) {
                if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                    storedId = crypto.randomUUID()
                } else {
                    storedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
                        return v.toString(16)
                    })
                }
                localStorage.setItem(STORAGE_KEY, storedId)
            }
            return storedId
        }

        // Initialize ID
        const initUserId = async () => {
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    setUserId(session.user.id)
                    return
                }
            }
            // Fallback to guest
            setUserId(getGuestId())
        }

        initUserId()

        // Listen for auth changes
        const { data: authListener } = supabase?.auth.onAuthStateChange((event: any, session: any) => {
            if (session?.user) {
                setUserId(session.user.id)
            } else {
                // On logout, revert to guest ID
                setUserId(getGuestId())
            }
        }) || { data: { subscription: { unsubscribe: () => { } } } }

        return () => {
            authListener?.subscription.unsubscribe()
        }
    }, [])

    return userId
}

import { writable } from 'svelte/store'
import { supabase } from '$lib/supabaseClient'

export const user = writable(null)
export const isLoading = writable(true)

if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    user.set(session?.user ?? null)
    isLoading.set(false)
  })

  supabase.auth.onAuthStateChange((event, session) => {
    user.set(session?.user ?? null)
  })
}
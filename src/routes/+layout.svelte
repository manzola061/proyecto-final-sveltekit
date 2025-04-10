<script>
  import { user, isLoading } from '$lib/stores/auth'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  onMount(() => {
    if (typeof window !== 'undefined') {
      const unsubscribe = isLoading.subscribe(($loading) => {
        if (!$loading && !$user && window.location.pathname !== '/login') {
          goto('/login')
        }
      })
      
      return () => unsubscribe()
    }
  })
</script>

<slot />
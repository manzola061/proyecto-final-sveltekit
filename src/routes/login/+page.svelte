<script>
  import { supabase } from '$lib/supabaseClient'
  import { goto } from '$app/navigation'
  import { user } from '$lib/stores/auth'

  let email = ''
  let password = ''
  let error = ''
  let loading = false

  async function handleLogin() {
    loading = true
    error = ''

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      let unsubscribe
      await new Promise(resolve => {
        unsubscribe = user.subscribe(($user) => {
          if ($user) resolve()
        })
      })
      unsubscribe()

      await goto('/welcome')
    } catch (err) {
      error = err.message || 'Error al iniciar sesión'
      console.error('Login error:', err)
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
    <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">Iniciar Sesión</h1>

    {#if error}
      <div class="bg-red-100 text-red-600 px-4 py-2 rounded-md mb-4 text-sm text-center">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {#if loading}
          Iniciando...
        {:else}
          Ingresar
        {/if}
      </button>
    </form>

    <p class="text-sm text-center text-gray-500 mt-4">
      ¿No tienes una cuenta?
      <a href="/register" class="text-indigo-600 hover:underline">Registrarse</a>
    </p>
  </div>
</div>
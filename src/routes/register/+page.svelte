<script>
    import { supabase } from '$lib/supabaseClient'
    import { goto } from '$app/navigation'
  
    let email = ''
    let password = ''
    let confirmPassword = ''
    let error = ''
    let loading = false
  
    async function handleRegister() {
      error = ''
      if (password !== confirmPassword) {
        error = 'Las contraseñas no coinciden'
        return
      }
  
      loading = true
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password
        })
  
        if (signUpError) throw signUpError
  
        // Redirigir al login tras registrarse
        await goto('/login')
      } catch (err) {
        error = err.message || 'Error al registrarse'
        console.error('Register error:', err)
      } finally {
        loading = false
      }
    }
  </script>
  
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">Crear cuenta</h1>
  
      {#if error}
        <div class="bg-red-100 text-red-600 px-4 py-2 rounded-md mb-4 text-sm text-center">{error}</div>
      {/if}
  
      <form on:submit|preventDefault={handleRegister} class="space-y-4">
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
  
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
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
            Registrando...
          {:else}
            Registrarse
          {/if}
        </button>
      </form>
  
      <p class="text-sm text-center text-gray-500 mt-4">
        ¿Ya tienes una cuenta?
        <a href="/login" class="text-indigo-600 hover:underline">Iniciar sesión</a>
      </p>
    </div>
  </div>
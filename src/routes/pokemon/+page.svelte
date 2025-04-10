<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { supabase } from '$lib/supabaseClient'
  import { user } from '$lib/stores/auth'
  
  let pokemons = []
  let limit = 16
  let offset = 0
  let total = 0
  let selectedPokemon = null
  let pokemonDetails = null
  let showPokemonModal = false
  let loadingPokemons = false

  let showProfileModal = false
  let activeTab = 'profile'
  let profileData = {
    email: '',
    created_at: '',
    last_sign_in: ''
  }
  let passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  let passwordError = ''
  let passwordSuccess = ''
  let profileLoading = false
  let passwordLoading = false

  async function fetchPokemons() {
    loadingPokemons = true
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
      const data = await res.json()
      
      pokemons = data.results.map(pokemon => {
        const id = pokemon.url.split('/').filter(Boolean).pop()
        return {
          ...pokemon,
          id,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          imageOfficial: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        }
      })
      
      total = data.count
    } catch (error) {
      console.error('Error fetching pokemons:', error)
    } finally {
      loadingPokemons = false
    }
  }

  async function fetchPokemonDetails(url) {
    try {
      const res = await fetch(url)
      return await res.json()
    } catch (error) {
      console.error('Error fetching pokemon details:', error)
      return null
    }
  }

  async function showPokemonDetails(pokemon) {
    selectedPokemon = pokemon
    pokemonDetails = await fetchPokemonDetails(pokemon.url)
    showPokemonModal = true
  }

  function closePokemonModal() {
    showPokemonModal = false
    selectedPokemon = null
    pokemonDetails = null
  }

  async function openProfileModal() {
    showProfileModal = true
    profileLoading = true
    
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (currentUser) {
      profileData = {
        email: currentUser.email,
        created_at: new Date(currentUser.created_at).toLocaleDateString(),
        last_sign_in: new Date(currentUser.last_sign_in_at).toLocaleDateString()
      }
    }
    
    profileLoading = false
  }

  async function updatePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      passwordError = 'Las contraseñas no coinciden'
      return
    }
    
    passwordLoading = true
    passwordError = ''
    passwordSuccess = ''
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })
      
      if (error) throw error
      
      passwordSuccess = '¡Contraseña actualizada correctamente!'
      passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' }
      
      setTimeout(() => {
        closeProfileModal()
      }, 2000)
    } catch (error) {
      passwordError = error.message || 'Error al actualizar la contraseña'
      console.error('Error updating password:', error)
    } finally {
      passwordLoading = false
    }
  }

  function closeProfileModal() {
    showProfileModal = false
    activeTab = 'profile'
    passwordError = ''
    passwordSuccess = ''
  }

  async function handleLogout() {
    const confirmLogout = confirm("¿Estás seguro de que quieres cerrar sesión?");
    
    if (confirmLogout) {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        await goto('/login');
      }
    }
  }

  function nextPage() {
    if (offset + limit < total) {
      offset += limit
      fetchPokemons()
    }
  }

  function prevPage() {
    if (offset - limit >= 0) {
      offset -= limit
      fetchPokemons()
    }
  }

  onMount(fetchPokemons)
</script>

<div class="min-h-screen bg-gray-100">
  <nav class="bg-indigo-600 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold">PokeTaTiste</h1>
      
      <div class="flex space-x-4">
        <button 
          on:click={openProfileModal}
          class="px-3 py-1 bg-indigo-700 rounded-md hover:bg-indigo-800 transition"
        >
          Perfil
        </button>
        
        <button 
          on:click={handleLogout}
          class="px-3 py-1 bg-red-500 rounded-md hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  </nav>

  <div class="p-6">
    {#if loadingPokemons && pokemons.length === 0}
      <div class="flex justify-center items-center h-64">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each pokemons as pokemon}
          <div class="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col items-center">
            <span class="text-gray-500 text-sm">#{pokemon.id}</span>
            <img 
              src={pokemon.image} 
              alt={pokemon.name} 
              class="w-24 h-24 object-contain hover:scale-110 transition-transform" 
            />
            <p class="capitalize font-semibold mt-2">{pokemon.name}</p>
            <button 
              on:click={() => showPokemonDetails(pokemon)}
              class="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
            >
              Ver detalles
            </button>
          </div>
        {/each}
      </div>

      <div class="mt-6 flex justify-between items-center">
        <button
          on:click={prevPage}
          class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50 transition-colors"
          disabled={offset === 0 || loadingPokemons}
        >
          Anterior
        </button>

        <span class="text-gray-600">
          Página {Math.floor(offset / limit) + 1} de {Math.ceil(total / limit)}
        </span>

        <button
          on:click={nextPage}
          class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50 transition-colors"
          disabled={offset + limit >= total || loadingPokemons}
        >
          Siguiente
        </button>
      </div>
    {/if}
  </div>

  {#if showPokemonModal && pokemonDetails && selectedPokemon}
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      on:click|self={closePokemonModal}
    >
      <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold capitalize">{selectedPokemon.name}</h2>
              <span class="text-gray-500">#{selectedPokemon.id}</span>
            </div>
            <button 
              on:click={closePokemonModal}
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <div class="flex flex-col items-center mb-4">
            <img 
              src={selectedPokemon.imageOfficial} 
              alt={`Ilustración oficial de ${selectedPokemon.name}`}
              class="w-48 h-48 object-contain"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 class="font-semibold">Altura</h3>
              <p>{(pokemonDetails.height / 10).toFixed(1)} m</p>
            </div>
            <div>
              <h3 class="font-semibold">Peso</h3>
              <p>{(pokemonDetails.weight / 10).toFixed(1)} kg</p>
            </div>
          </div>

          <div class="mb-4">
            <h3 class="font-semibold">Tipos</h3>
            <div class="flex gap-2 mt-1">
              {#each pokemonDetails.types as type}
                <span class="px-2 py-1 bg-gray-200 rounded-full text-sm capitalize">
                  {type.type.name}
                </span>
              {/each}
            </div>
          </div>

          <div class="mb-4">
            <h3 class="font-semibold">Habilidades</h3>
            <div class="flex flex-wrap gap-2 mt-1">
              {#each pokemonDetails.abilities as ability}
                <span class="px-2 py-1 bg-gray-200 rounded-full text-sm capitalize">
                  {ability.ability.name}
                </span>
              {/each}
            </div>
          </div>

          <div>
            <h3 class="font-semibold">Estadísticas</h3>
            <div class="mt-2 space-y-2">
              {#each pokemonDetails.stats as stat}
                <div>
                  <div class="flex justify-between text-sm">
                    <span class="capitalize">{stat.stat.name.replace('-', ' ')}</span>
                    <span>{stat.base_stat}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-indigo-600 h-2 rounded-full" 
                      style={`width: ${Math.min(100, stat.base_stat)}%`}
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showProfileModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full overflow-hidden">
        <div class="flex border-b">
          <button 
            class={`px-4 py-3 font-medium ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            on:click={() => activeTab = 'profile'}
          >
            Mi Perfil
          </button>
          <button 
            class={`px-4 py-3 font-medium ${activeTab === 'password' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            on:click={() => activeTab = 'password'}
          >
            Cambiar Contraseña
          </button>
        </div>

        <div class="p-6">
          {#if activeTab === 'profile'}
            {#if profileLoading}
              <div class="flex justify-center py-8">
                <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            {:else}
              <div class="space-y-4">
                <div>
                  <h3 class="font-semibold text-gray-500">Email</h3>
                  <p class="text-lg mt-1">{profileData.email}</p>
                </div>
                
                <div>
                  <h3 class="font-semibold text-gray-500">Cuenta creada</h3>
                  <p class="text-lg mt-1">{profileData.created_at}</p>
                </div>
                
                <div>
                  <h3 class="font-semibold text-gray-500">Último acceso</h3>
                  <p class="text-lg mt-1">{profileData.last_sign_in}</p>
                </div>
              </div>
            {/if}

          {:else}
            <form on:submit|preventDefault={updatePassword} class="space-y-4">
              {#if passwordError}
                <div class="bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm">
                  {passwordError}
                </div>
              {/if}
              
              {#if passwordSuccess}
                <div class="bg-green-100 text-green-600 px-4 py-2 rounded-md text-sm">
                  {passwordSuccess}
                </div>
              {/if}

              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700">Contraseña actual</label>
                <input
                  id="currentPassword"
                  type="password"
                  bind:value={passwordData.currentPassword}
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                <input
                  id="newPassword"
                  type="password"
                  bind:value={passwordData.newPassword}
                  required
                  minlength="6"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  bind:value={passwordData.confirmPassword}
                  required
                  minlength="6"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div class="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if passwordLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  {:else}
                    Cambiar Contraseña
                  {/if}
                </button>
              </div>
            </form>
          {/if}
        </div>

        <div class="bg-gray-50 px-4 py-3 flex justify-end">
          <button
            on:click={closeProfileModal}
            class="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
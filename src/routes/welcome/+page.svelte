<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  let pokemons = []
  let limit = 16
  let offset = 0
  let total = 0

  async function fetchPokemons() {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
    const data = await res.json()
    pokemons = data.results
    total = data.count
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

<div class="min-h-screen bg-gray-100 p-6">
  <h1 class="text-3xl font-bold mb-6 text-center">PokeTaTiste</h1>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each pokemons as pokemon}
      <div class="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
        <p class="capitalize font-semibold">{pokemon.name}</p>
        <a href={pokemon.url} target="_blank" class="text-sm text-indigo-600 hover:underline">
          Ver detalles
        </a>
      </div>
    {/each}
  </div>

  <div class="mt-6 flex justify-between items-center">
    <button
      on:click={prevPage}
      class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
      disabled={offset === 0}
    >
      Anterior
    </button>

    <span class="text-gray-600">
      Página {Math.floor(offset / limit) + 1} de {Math.ceil(total / limit)}
    </span>

    <button
      on:click={nextPage}
      class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
      disabled={offset + limit >= total}
    >
      Siguiente
    </button>
  </div>
</div>
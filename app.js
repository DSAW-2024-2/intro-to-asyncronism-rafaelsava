const pokemonGrid = document.querySelector('.pokemon-grid');
const main =document.querySelector('main');
const typeFilter = document.getElementById('type-filter');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const modal = document.getElementById('pokemon-modal');

const URLGeneral = 'https://pokeapi.co/api/v2/pokemon/';
const URLType = 'https://pokeapi.co/api/v2/type/';
const URLSpecies = 'https://pokeapi.co/api/v2/pokemon-species/'

let inicio = 0;
let limite = 20;

async function loadPokelinks(){
    const response = await fetch(`${URLGeneral}?offset=${inicio}&limit=${limite}`);
    const data = await response.json();
    
    // Crear promesas para cargar todos los Pokémon
    const pokemonPromises = data.results.map(pokemon => loadPokemon(pokemon.url));
    
    // Esperar a que todas las promesas se resuelvan antes de añadir el botón
    await Promise.all(pokemonPromises);

    // Añadir el botón "Load More" después de que todos los Pokémon se hayan cargado
    addButtonMorePokemons();
}

async function loadPokemon(url) {
    const response = await fetch(url);
    const data = await response.json();
    showPokemon(data);
}

function addButtonMorePokemons() {
    const morePoke = document.createElement('button');
    morePoke.textContent = 'Load More';
    morePoke.classList.add('load-more-btn');
    main.append(morePoke);

    morePoke.addEventListener('click', () => {
        morePoke.remove(); // Remover el botón antes de cargar más Pokémon
        inicio += limite;  // Incrementar el valor de `inicio`
        loadPokelinks();   // Cargar más Pokémon
    });

}

// Modifica la función `showPokemon` para añadir el evento de clic
function showPokemon(data) {
    let tipos = data.types.map(type => type.type.name);
    if (tipos.length === 1) {
        tipos = `<p class="type-${tipos[0]} type">${tipos[0]}</p>`;
    } else {
        tipos = `
            <p class="type-${tipos[0]} type">${tipos[0]}</p>
            <p class="type-${tipos[1]} type">${tipos[1]}</p>`;
    }

    const div = document.createElement('div');
    div.classList.add('pokemon-card');
    div.innerHTML = `
        <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
        <h2>${data.name}</h2>
        <div class="pokemon-types">
            ${tipos}
        </div>
        <div class="pokemon-stats">
            <p class="stat">${data.height}m</p>
            <p class="stat">${data.weight}kg</p>
        </div>`;
    
    // Añadir evento de clic a la tarjeta de Pokémon
    div.addEventListener('click', () => {
        loadPokemonSpecies(data.id);  // Cargar detalles del Pokémon en el modal
    });

    pokemonGrid.append(div);
}


async function filterPokemons() {
    const selectedType = typeFilter.value;
    const searchText = searchInput.value.toLowerCase(); 
    pokemonGrid.innerHTML = '';

    if (selectedType !== '' && searchText === '') {
        const response = await fetch(`${URLType}${selectedType}`);
        const data = await response.json();
        data.pokemon.forEach(pokemonEntry => {
            const pokemonData = pokemonEntry.pokemon;
            loadPokemon(pokemonData.url);
        });
    } else if (searchText !== '') {
        loadPokemon(`${URLGeneral}${searchText}`);
    } else {
        inicio = 0; // Reiniciar el índice cuando no hay filtros aplicados
        loadPokelinks(); // Cargar los Pokémon de manera predeterminada
    }
    const button = document.querySelector('.load-more-btn')
    button.remove();
}

// Función para mostrar el modal
function showModal() {
    modal.style.display = 'block';
}

// Cerrar el modal cuando se hace clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

//Funcion para traer la informacion del endpoint pokemon-species
async function loadPokemonSpecies(id){
    const response = await fetch(`${URLSpecies}${id}`);
    const data = await response.json();
    showPokemonSpecies(data,id)
}
// Función para mostrar la información de pokemon-species
async function showPokemonSpecies(data,id) {
    const description = data.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
    const habitat = data.habitat ? data.habitat.name : 'Unknown';
    const generation = data.generation.name;

    // Actualizar el innerHTML del modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${data.name} shiny</h2>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png" alt="${data.name}">
            <p>${description}</p>
            <p><b>Habitat</b>: ${habitat}</p>
            <p><b>Generation</b>: ${generation}</p>

        </div>`;

    // Mostrar el modal
    showModal();
    const closeModalBtn = modal.querySelector('.close');
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

}


// Event listeners para filtros y búsqueda
typeFilter.addEventListener('change', filterPokemons);
searchBtn.addEventListener('click', filterPokemons);
searchInput.addEventListener('input', filterPokemons);

// Cargar la lista inicial de Pokémon
loadPokelinks();

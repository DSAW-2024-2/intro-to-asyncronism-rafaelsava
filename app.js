// === Constants ===
const URLGeneral = 'https://pokeapi.co/api/v2/pokemon/';
const URLType = 'https://pokeapi.co/api/v2/type/';
const URLSpecies = 'https://pokeapi.co/api/v2/pokemon-species/';

const pokemonGrid = document.querySelector('.pokemon-grid');
const main = document.querySelector('main');
const typeFilter = document.getElementById('type-filter');
const searchInput = document.getElementById('search');
const modal = document.getElementById('pokemon-modal');
const btnSearch = document.getElementById('search-btn');
const imgPokedex = document.querySelector('.imgPokeName');

// State variables
let start = 0;
let limit = 20;

// === Utility Functions ===

// Function to fetch data from the API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// === Pokémon Loading Functions ===

// Load Pokémon links
async function loadPokelinks() {
    const data = await fetchData(`${URLGeneral}?offset=${start}&limit=${limit}`);
    if (data) {
        const pokemonPromises = data.results.map(pokemon => loadPokemon(pokemon.url));
        await Promise.all(pokemonPromises);
        addButtonMorePokemons();
    }
}

// Load an individual Pokémon
async function loadPokemon(url) {
    showLoader();
    
    const data = await fetchData(url);
    if (data) {
        showPokemon(data);
        hideLoader();
        return true;
    } else {
        showErrorMessage();
        hideLoader();
        return false;
    }
}

// Show an error message in the grid
function showErrorMessage() {
    pokemonGrid.innerHTML = '<p class="no-pokemon">This pokemon doesn\'t exist.<br>Click on pokedex image to come back.</p>';
}

// Show the loader
function showLoader() {
    let loader = document.querySelector('.loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.classList.add('loader');
        pokemonGrid.append(loader);
    }
    loader.style.display = 'block';
}

// Hide the loader
function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.style.display = 'none';
}

// === UI Functions ===

// Display a Pokémon in the grid
function showPokemon(data) {
    const tipos = data.types.map(type => `<p class="type-${type.type.name} type">${type.type.name}</p>`).join('');
    
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
    
    div.addEventListener('click', () => loadPokemonSpecies(data.id));
    pokemonGrid.append(div);
}

// Add the button to load more Pokémon
function addButtonMorePokemons() {
    removeExistingLoadMoreButton();

    const morePoke = document.createElement('button');
    morePoke.textContent = 'Load More';
    morePoke.classList.add('load-more-btn');
    main.append(morePoke);

    morePoke.addEventListener('click', () => {
        morePoke.remove();
        start += limit;
        loadPokelinks();
    });
}

// Remove the existing "Load More" button
function removeExistingLoadMoreButton() {
    const existingButton = document.querySelector('.load-more-btn');
    if (existingButton) existingButton.remove();
}

// === Filtering Functions ===

// Filter Pokémon by type or search
async function filterPokemons() {
    resetPokemonGrid();
    const selectedType = typeFilter.value;
    const searchText = searchInput.value.toLowerCase();

    if (selectedType && !searchText) {
        const data = await fetchData(`${URLType}${selectedType}`);
        if (data) {
            const promises = data.pokemon.map(pokemonEntry => loadPokemon(pokemonEntry.pokemon.url));
            await Promise.all(promises);
        }
    } else if (!selectedType && !searchText) {
        start = 0;
        loadPokelinks();
    }
}

// Reset the grid and buttons
function resetPokemonGrid() {
    pokemonGrid.innerHTML = '';
    removeExistingLoadMoreButton();
}

// === Modal Functions ===

// Show the modal with Pokémon information
function showModal() {
    modal.style.display = 'block';
}

// Close the modal if clicked outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Load Pokémon species and show in the modal
async function loadPokemonSpecies(id) {
    const data = await fetchData(`${URLSpecies}${id}`);
    if (data) {
        showPokemonSpecies(data, id);
    }
    else{
        window.alert('It is likely that there is still no information in \'pokemon species\' about this pokemon.')
    }
}

// Display Pokémon species information in the modal
function showPokemonSpecies(data, id) {
    let description = data.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
    description = description.replace(/\u000c/g, ' ');

    const habitat = data.habitat ? data.habitat.name : 'Unknown';
    const generation = data.generation.name;

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${data.name} shiny</h2>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png" alt="${data.name}">
            <p>${description}</p>
            <p><b>Habitat</b>: ${habitat}</p>
            <p><b>Generation</b>: ${generation}</p>
        </div>`;

    showModal();

    const closeModalBtn = modal.querySelector('.close');
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// === Search Functions ===

// Handle Pokémon search by name or ID
async function handlePokemonSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    const validInput = /^[a-z0-9-]+$/i;

    if (validInput.test(searchText)) {
        const success = await loadPokemon(`${URLGeneral}${searchText}`);
        if (success) {
            showReloadMessage();
        }
        searchInput.value = '';
    } else {
        window.alert('Please enter a valid Pokemon name (letters, numbers, and hyphens only).');
    }
}

// Show a reload message
function showReloadMessage() {
    const message = document.createElement('p');
    message.classList.add('reload-message');
    message.textContent = 'Click on Pokedex image to go back.';
    main.append(message);
}

// === Event Listeners ===
typeFilter.addEventListener('change', filterPokemons);
searchInput.addEventListener('input', () => {
    typeFilter.value = '';
    const reloadMessage = document.querySelector('.reload-message');
    if (reloadMessage) reloadMessage.remove();
    filterPokemons();
});
btnSearch.addEventListener('click', handlePokemonSearch);
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handlePokemonSearch();
});

imgPokedex.addEventListener('click', () => {
    resetFilters();
    loadPokelinks();
});

// Reset filters and reload Pokémon list
function resetFilters() {
    typeFilter.value = '';
    searchInput.value = '';
    resetPokemonGrid();
    start = 0;
    const reloadMessage = document.querySelector('.reload-message');
    if (reloadMessage) reloadMessage.remove();
}

// Initialization
resetFilters();
loadPokelinks();

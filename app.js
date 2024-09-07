const pokemonGrid = document.querySelector('.pokemon-grid');
const main = document.querySelector('main');
const typeFilter = document.getElementById('type-filter');
const searchInput = document.getElementById('search');
const modal = document.getElementById('pokemon-modal');
const btnSearch = document.getElementById('search-btn');
const imgPokedex = document.querySelector('.imgPokeName');

const URLGeneral = 'https://pokeapi.co/api/v2/pokemon/';
const URLType = 'https://pokeapi.co/api/v2/type/';
const URLSpecies = 'https://pokeapi.co/api/v2/pokemon-species/';

let start = 0;
let limit = 20;

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function loadPokelinks() {
    const data = await fetchData(`${URLGeneral}?offset=${start}&limit=${limit}`);
    if (data) {
        const pokemonPromises = data.results.map(pokemon => loadPokemon(pokemon.url));
        await Promise.all(pokemonPromises);
        addButtonMorePokemons();
    }
}

async function loadPokemon(url) {
    let loader = document.querySelector('.loader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.classList.add('loader');
        pokemonGrid.append(loader);  
    }

    loader.style.display = 'block'; 

    const data = await fetchData(url);
    if (data) {
        showPokemon(data);
        loader.style.display = 'none'; 
        return true; 
    } else {
        pokemonGrid.innerHTML = '<p class="no-pokemon">This pokemon doesn\'t exist.<br>Click on pokedex image to come back.</p>';
        loader.style.display = 'none'; 
        return false; 
    } 
}

function addButtonMorePokemons() {
    const existingButton = document.querySelector('.load-more-btn');
    if (existingButton) existingButton.remove();

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

async function filterPokemons() {
    const selectedType = typeFilter.value;
    const searchText = searchInput.value.toLowerCase();
    const reloadMessage = document.querySelector('.reload-message');
    if (reloadMessage) {
        reloadMessage.remove();
    }

    pokemonGrid.innerHTML = '';
    const existingButton = document.querySelector('.load-more-btn');
    if (existingButton) existingButton.remove();

    if (selectedType && !searchText) {
        const data = await fetchData(`${URLType}${selectedType}`);
        if (data) {
            const promises = data.pokemon.map(pokemonEntry => loadPokemon(pokemonEntry.pokemon.url));
            await Promise.all(promises);
        }
    } else if(!selectedType && !searchText){
        start = 0;
        loadPokelinks();
    }
}

function showModal() {
    modal.style.display = 'block';
}

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

async function loadPokemonSpecies(id) {
    const data = await fetchData(`${URLSpecies}${id}`);
    if (data) {
        showPokemonSpecies(data, id);
    }
}

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

async function handlePokemonSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    const validInput = /^[a-z0-9]+$/i;

    if (validInput.test(searchText)) {
        const success = await loadPokemon(`${URLGeneral}${searchText}`);
        if(success){
            const message = document.createElement('p');
            message.classList.add('reload-message');
            message.textContent = 'Click on Pokedex image to go back.';
            main.append(message);
        }
        searchInput.value = '';
    } else {
        window.alert('Please enter a valid Pokemon name (letters and numbers only).');
    }
}

typeFilter.addEventListener('change', filterPokemons);
searchInput.addEventListener('input', filterPokemons);
btnSearch.addEventListener('click', handlePokemonSearch);
searchInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        handlePokemonSearch();
    }
});



imgPokedex.addEventListener('click', () => {
    typeFilter.value = '';
    searchInput.value = '';
    pokemonGrid.innerHTML = '';
    start = 0;
    loadPokelinks();
    const reloadMessage = document.querySelector('.reload-message');
    if (reloadMessage) {
        reloadMessage.remove();
    }
});

loadPokelinks();

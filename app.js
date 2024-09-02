const pokemonGrid = document.querySelector('.pokemon-grid');
const typeFilter = document.getElementById('type-filter');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');

const URLGeneral = 'https://pokeapi.co/api/v2/pokemon/';
const URLType = 'https://pokeapi.co/api/v2/type/';


let index = 1;
let limit = 100;

async function loadPokemons() {
    while(index < limit) {
        const response = await fetch(URLGeneral + index);
        const data = await response.json();
        showPokemon(data);
        index++;
    }
    addButtonMorePokemons();
}

function addButtonMorePokemons() {
    const morePoke = document.createElement('button');
    morePoke.textContent = 'Load More';
    pokemonGrid.append(morePoke);
    morePoke.addEventListener('click', () => {
        loadPokemons();
        morePoke.remove();
        limit +=100;
    });
}

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
    pokemonGrid.append(div);
}

async function filterPokemons() {
    const selectedType = typeFilter.value;
    const searchText = searchInput.value.toLowerCase(); 
    pokemonGrid.innerHTML = '';

    if (selectedType !== '' && searchText==='') {
        const response = await fetch(`${URLType}${selectedType}`);
        const data = await response.json();
        data.pokemon.forEach(pokemonEntry => {
            const pokemonData = pokemonEntry.pokemon;
            fetchAndShowPokemon(pokemonData.url);
        });
    } else if (searchText !== '') {
        fetchAndShowPokemon(`${URLGeneral}${searchText}`);
    } else {
        index=1;
        loadPokemons();
    }
}

async function fetchAndShowPokemon(url) {
    const response = await fetch(url);
    const data = await response.json();
    showPokemon(data);
}



typeFilter.addEventListener('change', filterPokemons);
searchBtn.addEventListener('click', filterPokemons);
searchInput.addEventListener('input', filterPokemons);

loadPokemons();

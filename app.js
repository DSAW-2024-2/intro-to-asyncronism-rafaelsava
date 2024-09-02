const pokemonGrid = document.querySelector('.pokemon-grid');
const typeFilter = document.getElementById('type-filter');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const URL = 'https://pokeapi.co/api/v2/pokemon/';

let allPokemons = [];
let index=1;
let limit=100;

async function loadPokemons() {
    while(index<limit){
        const response = await fetch(URL + index);
        const data = await response.json();
        allPokemons.push(data);
        showPokemon(data);
        index++;
    }
    limit=limit+100;
    addbButtonMorePokemons()
}

function addbButtonMorePokemons(){
    const morePoke = document.createElement('button');
    morePoke.textContent = 'Load More';
    pokemonGrid.append(morePoke);
    morePoke.addEventListener('click',()=>{
        loadPokemons();
        morePoke.remove();
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

function filterPokemons() {
    const selectedType = typeFilter.value;
    const searchText = searchInput.value.toLowerCase(); 
    pokemonGrid.innerHTML = ''; 
    allPokemons.forEach(pokemon => {
        const types = pokemon.types.map(type => type.type.name);
        const name = pokemon.name.toLowerCase(); 
        if (
            (selectedType === '' || types.includes(selectedType)) &&
            (name.includes(searchText) || searchText === '')
        ) {
            showPokemon(pokemon);
        }
    });
    if (selectedType === '' && searchText===''){
        addbButtonMorePokemons();
    }
}

typeFilter.addEventListener('change', filterPokemons);
searchBtn.addEventListener('click', filterPokemons);
searchInput.addEventListener('input', filterPokemons);

loadPokemons();

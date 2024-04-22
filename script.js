// Obtener elementos del DOM
const mainPage = document.getElementById('mainPage');
const resultsPage = document.getElementById('resultsPage');
const recipePage = document.getElementById('recipePage');
const searchButton = document.getElementById('searchButton');
const backButton = document.getElementById('backButton');
const backButton2 = document.getElementById('backButton2');
const backButton3 = document.getElementById('backButton3');
const searchCriteria = document.getElementById('searchCriteria');
const searchInput = document.getElementById('searchInput');
const resultsGallery = document.getElementById('resultsGallery');
const recipeTitle = document.getElementById('recipeTitle');
const recipeImage = document.getElementById('recipeImage');
const recipeIngredients = document.getElementById('recipeIngredients');
const recipeInstructions = document.getElementById('recipeInstructions');

// Event listeners
searchButton.addEventListener('click', () => {
    const criteria = searchCriteria.value;
    const term = searchInput.value.trim();
    if (criteria && term) {
        searchRecipes(criteria, term);
    } else {
        alert('Por favor seleccione un criterio de búsqueda y escriba un término.');
    }
});

let lastAction = '';
let lastAction1='';


// Event listener para el botón de regresar en la página principal
backButton.addEventListener('click', () => {
    // Limpiar resultados anteriores
    resultsGallery.innerHTML = '';
    // Mostrar la página principal
    showPage(mainPage);
});

// Event listener para el botón de regresar en otras páginas
backButton2.addEventListener('click', () => {
    if (lastAction1 === 'showRecipeDetails' && lastAction === 'showResultsByName') {
        showPage(mainPage) // Mostrar la página principal en lugar de la de resultados
    } else {
        showPage(resultsPage); // Mostrar la página de resultados
    }
  });

// Función para mostrar la página correspondiente y ocultar las demás
function showPage(page) {
    mainPage.style.display = 'none';
    resultsPage.style.display = 'none';
    recipePage.style.display = 'none';
    page.style.display = 'block';

}

/// Función para realizar la búsqueda y mostrar los resultados o los detalles del plato
async function searchRecipes(criteria, term) {
    try {
        let endpoint = '';
        switch (criteria) {
            case 'name':
                endpoint = `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`;
                const response = await fetch(endpoint);
                const data = await response.json();
                if (data.meals) {
                    if (data.meals.length === 1) {
                        showRecipeDetails(data.meals[0].idMeal);
                        lastAction = 'showResultsByName'; // Establecer la última acción
                    } else {
                        displayResults(data.meals);
                        lastAction = 'showResultsByName'; // Establecer la última acción
                    }
                } else {
                    alert('No se encontraron resultados para ese plato.');
                }
                break;
            case 'ingredient':
                endpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${term}`;
                lastAction = 'showResultsByIngredient'; // Establecer la última acción
                break;
            case 'category':
                endpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${term}`;
                lastAction = 'showResultsByCategory'; // Establecer la última acción
                break;
            case 'area':
                endpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${term}`;
                lastAction = 'showResultsByArea'; // Establecer la última acción
                break;
            default:
                break;
        }

        if (endpoint !== '' && criteria !== 'name') {
            const response = await fetch(endpoint);
            const data = await response.json();
            displayResults(data.meals);
        }
    } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
    }
}


// Función para mostrar los resultados de la búsqueda
function displayResults(meals) {
    if (meals) {
        if (meals.length === 1) { // Si se encuentra exactamente un resultado
            showRecipeDetails(meals[0].idMeal); // Mostrar directamente los detalles del plato
        } else {
            resultsGallery.innerHTML = ''; // Limpiar la galería de resultados
            meals.slice(0, 18).forEach(meal => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <p>${meal.strMeal}</p>
                `;
                card.addEventListener('click', () => {
                    showRecipeDetails(meal.idMeal);
                });
                resultsGallery.appendChild(card);
            });
            if (lastAction !== 'showResultsByName') {
                showPage(resultsPage); // Mostrar la página de resultados solo si la última acción no fue mostrar resultados por nombre del plato
            }
        }
    } else {
        alert('No se encontraron resultados.');
    }
}

// Función para mostrar los detalles de la receta
async function showRecipeDetails(id) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];
        recipeTitle.textContent = meal.strMeal;
        recipeImage.innerHTML = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}">`;

        // Crear una lista desordenada para los ingredientes
        const ingredientsList = document.createElement('ul');
        ingredientsList.innerHTML = getIngredients(meal);

        // Actualizar el contenedor de los ingredientes con la lista desordenada
        recipeIngredients.innerHTML = '<h3><img src="Imagenes/ingredientes.png" alt="Icono de ingredientes"> Ingredients:</h3>';
        recipeIngredients.appendChild(ingredientsList);

        // Dividir las instrucciones por saltos de línea y crear párrafos para cada línea
        const instructionsParagraphs = meal.strInstructions.split('\n').map(instruction => {
            const paragraph = document.createElement('p');
            paragraph.textContent = instruction;
            return paragraph;
        });

        // Limpiar el contenedor de instrucciones y agregar los párrafos
        recipeInstructions.innerHTML = '<h3><img src="Imagenes/instrucciones.png" alt="Icono de instrucciones"> Instructions:</h3>';
        instructionsParagraphs.forEach(paragraph => {
            recipeInstructions.appendChild(paragraph);
        });
        
        // Mostrar la página de detalles de la receta
        showPage(recipePage);

        // Actualizar la última acción
        lastAction1 = 'showRecipeDetails';
    } catch (error) {
        console.error('Error al obtener los detalles de la receta:', error);
    }
}

// Función para obtener los ingredientes formateados como elementos de lista
function getIngredients(meal) {
    let ingredientsHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && measure) {
            ingredientsHTML += `<li>${ingredient} (${measure})</li>`;
        } else if (ingredient) {
            ingredientsHTML += `<li>${ingredient}</li>`;
        }
    }
    return ingredientsHTML;
}

// Mostrar la página principal al cargar la página
showPage(mainPage);





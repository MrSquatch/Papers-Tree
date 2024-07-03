import { configureVis, updateGraph } from './nodos.js';
import { headers, base_openalex_url } from './js/utils.js';

document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('results');
  const resultCount = document.getElementById('resultCount');
  const template = document.getElementById('template').innerHTML.trim();

  searchButton.addEventListener('click', function () {
    const query = searchInput.value;
    fetchResults(query);
  });

  function fetchResults(query) {
    const apiUrl =
      base_openalex_url +
      `default.search:${query}` +
      '&sort=relevance_score:desc';
    fetch(apiUrl, { headers: headers })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.results);
        displayResults(query, data.results);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  function displayResults(query, results) {
    resultsContainer.innerHTML = '';
    resultCount.innerHTML = `La búsqueda de <strong>${query}</strong> retornó <strong>${results.length}</strong> resultados.`;

    results.forEach((result) => {
      const title = getTitle(result.title);
      const authors = getAuthors(result.authorships);
      const year = result.publication_year || 'Año no definido';

      const itemElement = document.createElement('div');
      itemElement.innerHTML = template;

      itemElement.querySelector('.result-title').textContent = title;
      itemElement.querySelector('.result-authors').textContent = authors;
      itemElement.querySelector('.result-year').textContent = year;

      itemElement.classList.add('result-item');

      itemElement.addEventListener('click', function () {
        selectItem(itemElement, result.id);
      });

      resultsContainer.appendChild(itemElement);
    });
  }

  function getTitle(title) {
    if (!title || title === '') {
      return 'Sin título';
    }

    const title_max = 150;
    if (title.length > title_max) {
      return title.slice(0, title_max) + ' (...)';
    }

    return title;
  }

  function getAuthors(authorships) {
    // si no existen autores o es un array vacio
    if (!authorships || authorships.length === 0) {
      return 'Autores no definidos';
    }

    // si existen mas de 3 autores
    if (authorships.length > 2) {
      return (
        authorships
          .slice(0, 3)
          .map((a) => a.author.display_name)
          .join(', ') + ', et al.'
      );
    }

    // caso general
    return authorships.map((a) => a.author.display_name).join(', ');
  }

  function selectItem(element, id) {
    console.log(
      'Item clicked:',
      element.querySelector('.result-title').textContent
    ); // Debug message

    // Remove 'selected' class from all items
    document
      .querySelectorAll('.result-item')
      .forEach((item) => item.classList.remove('selected'));

    // Add 'selected' class to the clicked item
    element.classList.add('selected');

    // Execute your function
    id = id.split('/').pop();
    console.log('Selected item ID:', id);

    configureVis();
    updateGraph({ id: id });
  }
});

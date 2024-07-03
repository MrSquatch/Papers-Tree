export const headers = { 'User-Agent': 'mailto:jean.lavaud@unmsm.edu.pe' };

const startYear = 2014;
const endYear = 2024;

export const base_openalex_url =
  'https://api.openalex.org/works?' +
  'page=1' +
  '&filter=open_access.is_oa:true,' +
  'type:types/article,' +
  `publication_year:${startYear}-${endYear},`;

function getHSL(hue, lightness) {
  const saturation = 100;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

async function fetchDetails(rootId) {
  const url = `https://api.openalex.org/works/${rootId}`;

  const response = await fetch(url, { headers: headers });
  const data = await response.json();

  return data;
}

async function getRootDetails(root) {
  const data = await fetchDetails(root.id);

  root.title = data.title;
  root.authors = data.authorships;
  root.year = data.publication_year;

  root.open_url = data.id;
  root.doi_url = data.doi;

  // Verificación de primary_location y source
  if (data.primary_location && data.primary_location.source) {
    root.source = data.primary_location.source.display_name;
  } else {
    root.source = 'Unknown';
  }

  root.language = data.language.toUpperCase() || 'Unknown';
  root.topics = data.topics || [];

  return root;
}

function nodeInformation(clickedNode) {
  // Actualizar la información del nodo en el HTML
  document.getElementById('node-title').textContent = clickedNode.title;

  document.getElementById('node-authors').innerHTML = '';
  clickedNode.authors.forEach((author) => {
    const authorElement = document.createElement('li');
    authorElement.textContent = `${author.author.display_name}`;
    document.getElementById('node-authors').appendChild(authorElement);
  });

  document.getElementById('node-year').textContent = clickedNode.year;
  document.getElementById('node-language').textContent = clickedNode.language;
  document.getElementById('node-source').textContent = clickedNode.source;

  document.getElementById('node-topics').innerHTML = '';
  clickedNode.topics.forEach((topic) => {
    const topicElement = document.createElement('li');
    topicElement.textContent = `${topic.display_name} (${topic.field.display_name})`;
    document.getElementById('node-topics').appendChild(topicElement);
  });

  document.getElementById('node-open-url').href = clickedNode.open_url;
  document.getElementById('node-doi-url').href = clickedNode.doi_url;
}

export { getHSL, randomHue, getRootDetails, nodeInformation };

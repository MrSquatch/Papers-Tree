import { base_openalex_url, headers } from './utils.js';

// Function to fetch data from OpenAlex API
const page_limit = 6;

async function fetchData(searchId, option) {
  let filter;
  if (option === 'cited by') {
    filter = 'cited_by';
  } else if (option === 'cites') {
    filter = 'cites';
  }

  const url =
    base_openalex_url + `${filter}:${searchId}&per-page=${page_limit}`;

  const response = await fetch(url, { headers: headers });
  const data = await response.json();

  return data;
}

export { fetchData };

import { fetchData } from './js/openalex.js';
import {
  getHSL,
  getRootDetails,
  nodeInformation,
  randomHue,
} from './js/utils.js';

let nodes, edges;

// Funcion para inicializar el grafo de Vis.js
function configureVis() {
  const container = document.getElementById('network');

  nodes = new vis.DataSet([]);
  edges = new vis.DataSet([]);

  const visData = {
    nodes: nodes,
    edges: edges,
  };
  const options = {
    nodes: {
      color: {
        border: 'black',
      },
    },
    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 1,
          type: 'arrow',
        },
      },
    },
    // layout: {
    //   hierarchical: {
    //     direction: 'LR',
    //     sortMethod: 'directed',
    //   },
    // },
  };
  const network = new vis.Network(container, visData, options);

  network.on('click', function (properties) {
    if (properties.nodes.length === 0) return;

    const id = properties.nodes[0];
    const clickedNode = nodes.get(id);
    console.log('Single:', clickedNode);

    nodeInformation(clickedNode);
  });

  network.on('doubleClick', function (properties) {
    if (properties.nodes.length === 0) return;

    const id = properties.nodes[0];
    const dClickedNode = nodes.get(id);
    console.log('Double:', dClickedNode);

    updateGraph(dClickedNode);
  });
}

// Funcion para actualizar el grafo
async function updateGraph(root) {
  const rootId = root.id;
  const hue = randomHue();

  const rootExists = nodes.get(rootId) !== null;
  if (!rootExists) {
    root = await getRootDetails(root);
    root.color = { background: getHSL(hue, 40) };

    console.log(root);

    nodes.add(root);
  }

  await addNodes(rootId, hue, 'cited by');
  await addNodes(rootId, hue, 'cites');

  console.log(nodes);
  console.log(edges);
}

// Funcion para añadir nodos al grafo
async function addNodes(nodeId, hue, option) {
  try {
    const data = await fetchData(nodeId, option);
    console.log(data);

    const tmpNodes = [];
    const tmpEdges = [];

    data.results.forEach((result) => {
      const id = result.id.split('/').pop();

      const title = result.title;
      const authors = result.authorships;
      const year = result.publication_year;

      const open_url = result.id;
      const doi_url = result.doi;

      let source;
      if (result.primary_location && result.primary_location.source) {
        source = result.primary_location.source.display_name;
      } else {
        source = 'Unknown';
      }

      const language = result.language.toUpperCase() || 'Unknown';
      const topics = result.topics || [];

      const nodeExists = nodes.get(id) !== null;
      if (!nodeExists) {
        const lum = option === 'cites' ? 60 : 20;

        const node = {
          id: id,
          title: title,
          authors: authors,
          year: year,
          open_url: open_url,
          doi_url: doi_url,
          language: language,
          source: source,
          topics: topics,
          color: { background: getHSL(hue, lum) },
        };

        tmpNodes.push(node);

        const edge = {
          from: '',
          to: '',
        };

        if (option === 'cited by') {
          edge.from = id;
          edge.to = nodeId;
        }
        if (option === 'cites') {
          edge.from = nodeId;
          edge.to = id;
        }

        tmpEdges.push(edge);
      }
    });

    nodes.add(tmpNodes);
    edges.add(tmpEdges);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Initicializacion
// configureVis();

// const firstNode = JSON.parse(`{
//   "id": "W2159549133",
//   "title": "A Grand Gender Convergence: Its Last Chapter"
// }`);

// updateGraph(firstNode);

export { configureVis, updateGraph };

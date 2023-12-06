// Variables
let currentPage = 1;
let totalPages = 1;
let championships = [];
let teams = [];
const numberOfClusters = 3; // Você pode ajustar conforme necessário
const maxIterations = 100; // Número máximo de iterações



const displayClustersData = (clusters) => {
  const tbody = $('.response-box tbody');
  tbody.html('');

  clusters.forEach((cluster, index) => {
    const separatorRow = $('<tr>').addClass('border-t-2 border-gray-400');
    const separatorCell = $('<td>').attr('colspan', '4').addClass('py-2 font-bold text-center').text(`Cluster ${index + 1}`);
    separatorRow.append(separatorCell);
    tbody.append(separatorRow);

    cluster.forEach(team => {
      const row = $('<tr>').addClass('hover:bg-gray-500');
      const nameCell = $('<td>').addClass('py-2 text-center').text(team.teamName);
      const countryCell = $('<td>').addClass('py-2 text-center').text(team.teamCountry || 'N/A');
      const concededCell = $('<td>').addClass('py-2 text-center').text(team.golsConceded);
      const scoredCell = $('<td>').addClass('py-2 text-center').text(team.golsScored);

      row.append(nameCell, countryCell, concededCell, scoredCell);
      tbody.append(row);
    });
  });
};


function euclideanDistance(a, b) {
  return Math.sqrt(Math.pow(a.golsScored - b.golsScored, 2) + Math.pow(a.golsConceded - b.golsConceded, 2));
}

function kmeans(data, k, maxIterations) {
  function getRandomCentroids(data, k) {
    const centroids = [];
    const randomIndices = [];

    while (centroids.length < k) {
      const randomIndex = Math.floor(Math.random() * data.length);
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
        centroids.push(data[randomIndex]);
      }
    }

    return centroids;
  }

  function assignToCluster(point, centroids) {
    let minDistance = Infinity;
    let clusterIndex = -1;

    for (let i = 0; i < centroids.length; i++) {
      const distance = euclideanDistance(point, centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        clusterIndex = i;
      }
    }

    return clusterIndex;
  }

  function calculateCentroids(clusters) {
    const centroids = [];
    for (let i = 0; i < clusters.length; i++) {
      let sumGolsScored = 0;
      let sumGolsConceded = 0;

      for (let j = 0; j < clusters[i].length; j++) {
        sumGolsScored += clusters[i][j].golsScored;
        sumGolsConceded += clusters[i][j].golsConceded;
      }

      centroids.push({
        golsScored: sumGolsScored / clusters[i].length,
        golsConceded: sumGolsConceded / clusters[i].length
      });
    }

    return centroids;
  }

  function hasConverged(oldCentroids, newCentroids) {
    for (let i = 0; i < oldCentroids.length; i++) {
      if (euclideanDistance(oldCentroids[i], newCentroids[i]) !== 0) {
        return false;
      }
    }
    return true;
  }

  let centroids = getRandomCentroids(data, k);
  let iterations = 0;
  let clusters = Array.from({ length: k }, () => []);

  while (iterations < maxIterations) {
    clusters = Array.from({ length: k }, () => []);

    for (let i = 0; i < data.length; i++) {
      const clusterIndex = assignToCluster(data[i], centroids);
      clusters[clusterIndex].push(data[i]);
    }

    const oldCentroids = [...centroids];
    centroids = calculateCentroids(clusters);

    if (hasConverged(oldCentroids, centroids)) {
      break;
    }

    iterations++;
  }

  return clusters;
}
// Functions 
const addChampionship = (id, name, country) => {
  const existingChampionship = championships.find(championship => championship.name === name);

  if (!existingChampionship) {
      championships.push({ id, name, country });
      addTable();
      toggleSearchButton();
      console.log('Lista de Ligas:', championships);
  } else {
      console.log('Championship já existe:', existingChampionship);
  }
};

const removeChampionship = (name) => {
  championships = championships.filter(championship => championship.name !== name);
  addTable();
  toggleSearchButton();
  console.log('Lista de Ligas após remoção:', championships);
};

const addTable = () => {
  const tbody = $('.intermediate-box tbody');
  tbody.html('');
  championships.forEach(championship => {
      const row = $('<tr>').addClass('hover:bg-gray-500');
      const nameCell = $('<td>').addClass('py-2 font-bold text-center').text(championship.name);
      const countryCell = $('<td>').addClass('py-2 text-sm text-center').text(championship.country || 'N/A');
      const deleteCell = $('<td>').addClass('py-2 text-center');
      const deleteButton = $('<button>').addClass('button-delete bg-red-500 py-2 px-2 m-2 rounded-md hover:bg-red-600 transition-all duration-300ms active:bg-red-700').text('x');

      deleteCell.append(deleteButton);

      row.append(nameCell, countryCell, deleteCell);
      tbody.append(row);
  });
};

const previousPage = () => {
  if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage)
          .then(updatePageNumber)
          .catch(error => console.error(error));
  }
};

const nextPage = () => {
if (currentPage < totalPages) {
  currentPage++;
  fetchData(currentPage)
    .then(updatePageNumber)
    .catch(error => console.error(error));
}
};

const updatePageNumber = () => {
  const pageNumber = $('.page-number');
  if (pageNumber.length > 0) {
      pageNumber.text(`Page ${currentPage}`);
  }
};

const toggleSearchButton = () => {
  const searchButton = $('#searchButton');

  if (championships.length >= 1) {
      searchButton.removeClass('hidden');
  } else {
      searchButton.addClass('hidden');
  }
};




// Initial fetch / LIST-CHAMPIONSHIPS
const fetchData = async (page) => {
  try {
    const response = await fetch(`https://soccer-football-info.p.rapidapi.com/championships/list/?p=${page}&c=all&l=en_US`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
        'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
      }
    });

    const data = await response.json();

    const tbody = $('.search-box tbody');
    tbody.html('');

    if (data && data.result) {
      data.result.forEach(championship => {
        const row = $('<tr>').addClass('hover:bg-gray-500');
        const idCell = $('<td>').addClass('py-2 font-bold text-center').text(championship.id);
        const nameCell = $('<td>').addClass('py-2 font-bold text-center').text(championship.name);
        const countryCell = $('<td>').addClass('py-2 text-sm text-center').text(championship.country || 'N/A');
        const addCell = $('<td>').addClass('py-2 text-center');
        const addButton = $('<button>').addClass('button-add bg-green-500 py-2 px-2 m-2 rounded-md hover:bg-green-600 transition-all duration-300ms active:bg-green-700').text('+');

        addCell.append(addButton);

        row.append(idCell, nameCell, countryCell, addCell);
        tbody.append(row);

        totalPages = Math.ceil(data.pagination[0].items / data.pagination[0].per_page);
      });
    } else {
      console.log('Nenhum resultado encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
};


const handleWorkerTask = async (championship) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./scripts/fetchWorker.js');

    worker.postMessage(championship);

    worker.onmessage = (e) => {
      const teamsData = e.data;
      console.log('Times da Liga:', teamsData);
      resolve(teamsData);
    };

    worker.onerror = (error) => {
      console.error('Erro no worker:', error);
      reject(error);
    };
  });
};





// EVENTS LISTENERS
$(document).ready(() => {
    fetchData(currentPage)
      .then(updatePageNumber)
      .catch(error => console.error(error));
    
    $(document).on('click', '.button-add', function () {
      const row = $(this).closest('tr');
      const id = row.find('td:nth-child(1)').text();
      const name = row.find('td:nth-child(2)').text();
      const country = row.find('td:nth-child(3)').text();
      
      addChampionship(id, name, country);
    });
  
    $(document).on('click', '.button-delete', function () {
      const row = $(this).closest('tr');
      const name = row.find('td:nth-child(1)').text();
      
      removeChampionship(name);
    });
  
    $('#nextButton').on('click', nextPage);
    $('#prevButton').on('click', previousPage);
    
    $('#searchButton').on('click', async function () {
      try {
        const allTeamsData = [];
        const workerPromises = [];
    
        for (const championship of championships) {
          const promise = handleWorkerTask(championship)
            .then(teamsData => {
              allTeamsData.push(...teamsData);
            })
            .catch(error => {
              console.error('Erro ao buscar dados das equipes:', error);
            });
    
          workerPromises.push(promise);
        }
    
        await Promise.all(workerPromises);
        const clusters = kmeans(allTeamsData, numberOfClusters, maxIterations);
        displayClustersData(clusters);
        console.log(clusters);
      } catch (error) {
        console.error('Erro ao buscar dados das equipes:', error);
      }
    });
    
  });

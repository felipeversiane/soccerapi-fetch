// Variables
let currentPage = 1;
let totalPages = 1;
let championships = [];

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
        'X-RapidAPI-Key': 'a6d4001f04mshb1b2dfdbb508facp1f0ed0jsn1299de137ebb',
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
    const worker = new Worker('./scripts/worker.js');

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
        console.log('Dados de Todos os Times:', allTeamsData);
      } catch (error) {
        console.error('Erro ao buscar dados das equipes:', error);
      }
    });
    
  });

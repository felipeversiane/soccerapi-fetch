// Variables
let currentPage = 1;
let totalPages = 1;
let championships = [];
let teams = [];

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




// Teams data fetch / VIEW-CHAMPIONSHIPS /
const getTeamsFromChampionships = async (championships) => {
  const data = [];

  try {
    const promises = championships.map(async (championship) => {
      const response = await fetch(`https://soccer-football-info.p.rapidapi.com/championships/view/?i=${championship.id}&l=en_US`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
          'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
        }
      });

      const responseData = await response.json();

      if (responseData.result && responseData.result[0] && responseData.result[0].seasons && responseData.result[0].seasons[0] && responseData.result[0].seasons[0].groups && responseData.result[0].seasons[0].groups[0] && responseData.result[0].seasons[0].groups[0].table) {
        const table = responseData.result[0].seasons[0].groups[0].table;

        table.forEach(teamInfo => {
          if (teamInfo.team && teamInfo.team.id) {
            const teamId = teamInfo.team.id;
            const teamName = teamInfo.team.name;
            const teamCountry = responseData.result[0].country;
            data.push({ teamId, teamName, teamCountry });
          }
        });
      }
    });

    await Promise.all(promises);
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados das equipes:', error);
    throw error;
  }
};




// Teams score fetch / TEAM-HISTORY /
const getTeamsScore = async (teamsData) => {
  const data = [];

  try {
    const promises = teamsData.map(async (team) => {
      const response = await fetch(`https://soccer-football-info.p.rapidapi.com/teams/history/?i=${team.teamId}&l=en_US`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
          'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
        }
      });

      const responseData = await response.json();

      if (responseData.result && responseData.result[0] && responseData.result[0].matches) {
        const matches = responseData.result[0].matches;

        let golsScored = 0;
        let golsConceded = 0;

        matches.forEach(matchInfo => {
          if (matchInfo.teamA && matchInfo.teamB) {
            golsScored += parseInt(matchInfo.teamA.score);
            golsConceded += parseInt(matchInfo.teamB.score);
          }
        });

        data.push({ golsScored, golsConceded });
      }
    });

    await Promise.all(promises);
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados da pontuação das equipes:', error);
    throw error;
  }
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
        const teamsData = await getTeamsFromChampionships(championships);
        console.log('Dados das Equipes:', teamsData);

        const teamsScore = await getTeamsScore(teamsData);
        console.log('Pontuação das Equipes:', teamsScore);
      } catch (error) {
        console.error('Erro ao buscar dados das equipes:', error);
      }
    });
  
    
  });

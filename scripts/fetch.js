let currentPage = 1;
let totalPages = 1;

function fetchData(page) {
    return new Promise((resolve, reject) => {
        
        const settings = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
                'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
            }
        };

        $.ajax({
            url: `https://soccer-football-info.p.rapidapi.com/championships/list/?p=${page}&c=all&l=en_US`,
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
                'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
            },
            success: function(data) {
                const tbody = $('.search-box tbody');
                tbody.html('');

                if (data && data.result) {
                    data.result.forEach(championship => {
                        const row = $('<tr>').addClass('hover:bg-gray-500');

                        const nameCell = $('<td>').addClass('py-2 font-bold text-center').text(championship.name);
                        const countryCell = $('<td>').addClass('py-2 text-sm text-center').text(championship.country || 'N/A');
                        const selectCell = $('<td>').addClass('py-2 text-center');
                        const checkbox = $('<input>').attr('type', 'checkbox').addClass('checkbox-custom');

                        selectCell.append(checkbox);
                        row.append(nameCell, countryCell, selectCell);
                        tbody.append(row);

                        totalPages = Math.ceil(data.pagination[0].items / data.pagination[0].per_page);
                    });

                    resolve();
                } else {
                    console.log('Nenhum resultado encontrado');
                    reject('Nenhum resultado encontrado');
                }
            },
            error: function(error) {
                console.error('Erro ao buscar dados:', error);
                reject(error);
            }
        });
    });
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        fetchData(currentPage)
            .then(updatePageNumber)
            .catch(error => console.error(error));
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchData(currentPage)
            .then(updatePageNumber)
            .catch(error => console.error(error));
    }
}

function updatePageNumber() {
    const pageNumber = $('.page-number');
    if (pageNumber.length > 0) {
        pageNumber.text(`Page ${currentPage}`);
    }
}

$(document).ready(function() {
    fetchData(currentPage)
        .then(updatePageNumber)
        .catch(error => console.error(error));

    $('#nextButton').on('click', nextPage);
    $('#prevButton').on('click', previousPage);
});
self.onmessage = async function (e) {
  console.log("Worker rodando!")
  const championship = e.data;

  try {
    const response = await fetch(`https://soccer-football-info.p.rapidapi.com/championships/view/?i=${championship.id}&l=en_US`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
        'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
      }
    });

    const responseData = await response.json();
    const teamsData = [];

    if (
      responseData &&
      responseData.result &&
      responseData.result.length > 0 &&
      responseData.result[0].seasons &&
      responseData.result[0].seasons.length > 0 &&
      responseData.result[0].seasons[0].groups &&
      responseData.result[0].seasons[0].groups.length > 0 &&
      responseData.result[0].seasons[0].groups[0].table
    ) {
      const table = responseData.result[0].seasons[0].groups[0].table;

      for (const teamInfo of table) {
        if (teamInfo.team && teamInfo.team.id) {
          const teamId = teamInfo.team.id;

          const teamResponse = await fetch(`https://soccer-football-info.p.rapidapi.com/teams/view/?i=${teamId}&l=en_US`, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': 'f43e6e5db1msh46b37900e14ad70p114c77jsnfd8f88b76023',
              'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
            }
          });

          const teamData = await teamResponse.json();

          let golsScored = 0;
          let golsConceded = 0;

          if (
            teamData &&
            teamData.result &&
            teamData.result.length > 0 &&
            teamData.result[0].last_matches
          ) {
            const matches = teamData.result[0].last_matches;

            for (const matchInfo of matches) {
              if (matchInfo.teamA && matchInfo.teamB && !isNaN(parseInt(matchInfo.teamA.score)) && !isNaN(parseInt(matchInfo.teamB.score))) {
                golsScored += parseInt(matchInfo.teamA.score);
                golsConceded += parseInt(matchInfo.teamB.score);
              }
            }
          }

          teamsData.push({
            teamId,
            teamName: teamData.result[0].name,
            teamCountry: teamData.result[0].country,
            golsScored,
            golsConceded
          });
        }
      }
    }

    self.postMessage(teamsData);
    console.log("Worker finalizado!")
  } catch (error) {
    console.error('Erro ao buscar dados das equipes:', error);
    self.postMessage({ error: 'Ocorreu um erro ao buscar os dados das equipes.' });
  }
};

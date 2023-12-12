
self.onmessage = async function (e) {

  console.log("Worker started!")
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

    if (responseData.result && responseData.result[0] && responseData.result[0].seasons && responseData.result[0].seasons[0] && responseData.result[0].seasons[0].groups && responseData.result[0].seasons[0].groups[0] && responseData.result[0].seasons[0].groups[0].table) {
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

          if (teamData.result && teamData.result[0] && teamData.result[0].last_matches) {
            const last_matches = teamData.result[0].last_matches;
            let matches = [];
            for (const match of last_matches) {
              if (match.teamA && match.teamB) {
                const goalsScored = parseInt(match.teamA.score);
                const goalsConceded = parseInt(match.teamB.score);
                const goalsDifference = goalsScored - goalsConceded;
                matches.push(goalsDifference);
              }
            }
            teamsData.push({
              teamId,
              teamName: teamData.result[0].name,
              teamCountry: teamData.result[0].country,
              matches
            });
          }
        }
      }
    }
    console.log("Worker finished!")
    self.postMessage(teamsData);
  } catch (error) {
    console.error('Erro ao buscar dados das equipes:', error);
    throw error;
  }
};

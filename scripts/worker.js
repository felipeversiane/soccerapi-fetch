// worker.js

self.onmessage = async function (e) {
    const championship = e.data;
  
    try {
      const response = await fetch(`https://soccer-football-info.p.rapidapi.com/championships/view/?i=${championship.id}&l=en_US`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'a6d4001f04mshb1b2dfdbb508facp1f0ed0jsn1299de137ebb',
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
                'X-RapidAPI-Key': 'a6d4001f04mshb1b2dfdbb508facp1f0ed0jsn1299de137ebb',
                'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
              }
            });
  
            const teamData = await teamResponse.json();
            let golsScored = 0;
            let golsConceded = 0;
  
            if (teamData.result && teamData.result[0] && teamData.result[0].last_matches) {
              const matches = teamData.result[0].last_matches;
  
              for (const matchInfo of matches) {
                if (matchInfo.teamA && matchInfo.teamB) {
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
    } catch (error) {
      console.error('Erro ao buscar dados das equipes:', error);
      throw error;
    }
  };
  
// Função para calcular a distância euclidiana entre dois pontos
function euclideanDistance(a, b) {
    return Math.sqrt(Math.pow(a.golsScored - b.golsScored, 2) + Math.pow(a.golsConceded - b.golsConceded, 2));
  }
  
  // Função para encontrar o centróide de um cluster
  function calculateCentroid(cluster) {
    const centroid = { golsScored: 0, golsConceded: 0 };
  
    for (const point of cluster) {
      centroid.golsScored += point.golsScored;
      centroid.golsConceded += point.golsConceded;
    }
  
    centroid.golsScored /= cluster.length;
    centroid.golsConceded /= cluster.length;
  
    return centroid;
  }
  
  // Função K-means
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
  
    function calculateNewCentroids(clusters) {
      const centroids = [];
      for (let i = 0; i < clusters.length; i++) {
        centroids.push(calculateCentroid(clusters[i]));
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
      centroids = calculateNewCentroids(clusters);
  
      if (hasConverged(oldCentroids, centroids)) {
        break;
      }
  
      iterations++;
    }
  
    return clusters;
  }
  
  // Evento de mensagem recebida pelo worker
  self.onmessage = function(e) {
    const data = e.data;
  
    try {
      // Aplica o algoritmo K-means clustering aos dados recebidos
      const clusters = kmeans(data, data.k, data.maxIterations);
  
      // Envia os clusters de volta ao script principal
      self.postMessage(clusters);
    } catch (error) {
      console.error('Erro ao processar dados no worker:', error);
      self.postMessage([]);
    }
  };
  
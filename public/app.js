document.getElementById('getDataBtn').addEventListener('click', async function() {
  let city = window.prompt('¿De qué ciudad quieres información? Ejemplo: Londres, Reino Unido');

  // Si se cancela el prompt, usar valor por defecto
  if (!city) {
      city = 'Barcelona, España';
  }

  try {
      const url = `/api/recommendations?city=${encodeURIComponent(city)}`;
      console.log('URL de la solicitud:', url);

      const response = await fetch(url);
      console.log('Respuesta del servidor:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Texto de error:', errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

     // Si no se encontraron lugares, mostrar mensaje
      if (data.places.length === 1 && data.places[0].name === 'No se encontraron lugares turísticos') {
        alert('No se encontraron lugares turísticos para esta ciudad');
        return;
      }

      // Mostrar resultados
      const resultList = document.getElementById('resultList');
      resultList.innerHTML = `
          <li><strong>Ciudad:</strong> ${data.city}</li>
          <li><strong>Clima:</strong> ${data.weather.description}, ${data.weather.temperature}°C</li>
          <li><strong>Lugares Turísticos:</strong></li>
      `;

      const placesList = document.createElement('ul');
      data.places.forEach(place => {
          const placeItem = document.createElement('li');
          placeItem.textContent = `${place.name} (Coordenadas: ${place.coordinates.join(', ')})`;
          placesList.appendChild(placeItem);
      });

      resultList.appendChild(placesList);

      // Mostrar el mapa (solo si hay lugares)
      if (data.places.length > 0) {
          const map = new mapboxgl.Map({
              container: 'map',
              style: 'mapbox://styles/mapbox/streets-v11',
              center: data.places[0].coordinates,
              zoom: 12
          });

          new mapboxgl.Marker()
              .setLngLat(data.places[0].coordinates)
              .addTo(map);
      }

    } catch (error) {
      console.error('Error completo:', error);
      alert(`Ocurrió un error: ${error.message}`);
  }
});
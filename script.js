async function fetchData() {
    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;
    const apiKey = "41e6fbe5edd976bfc7e55bde07ba32ed"; // Replace with your API key

    if (!lat || !lon) {
        alert("Please enter both latitude and longitude!");
        return;
    }

    try {
        // Fetch weather data
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Fetch location name (Reverse Geocoding)
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const locationData = await locationResponse.json();

        // Extract necessary data
        const locationName = locationData.display_name || "Unknown Location";
        const temperature = weatherData.main.temp;
        const weatherCondition = weatherData.weather[0].description;
        const humidity = weatherData.main.humidity;

        // Fill Location details
        document.getElementById("location-name").innerHTML = `<strong>Location:</strong> ${locationName}`;

        // Fill real-time climate data
        document.getElementById("climate-info").innerHTML = `
            <strong>Temperature:</strong> ${temperature}°C<br>
            <strong>Condition:</strong> ${weatherCondition}<br>
            <strong>Humidity:</strong> ${humidity}%
        `;

        // Show the result section
        document.getElementById("result-container").classList.remove("hidden");

        // Fetch and display historical climate data
        fetchClimateData(lat, lon);

        // Fetch and display construction materials
        fetchConstructionMaterials(temperature);

        // Fetch and display population & tree density
        fetchDensity(lat, lon);

        // Fetch and display energy models
        fetchEnergyModel(temperature);

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please check your API key and coordinates.");
    }
}

// Fetch historical climate data (temperature, rainfall)
async function fetchClimateData(lat, lon) {
    try {
        // Fetch past climate data (Example: Using Open-Meteo API)
        const climateResponse = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2010-01-01&end_date=2023-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata`);
        const climateData = await climateResponse.json();

        // Calculate average temperature & rainfall
        let totalTemp = 0, totalRainfall = 0, count = climateData.daily.temperature_2m_max.length;
        for (let i = 0; i < count; i++) {
            totalTemp += (climateData.daily.temperature_2m_max[i] + climateData.daily.temperature_2m_min[i]) / 2; // Avg temp
            totalRainfall += climateData.daily.precipitation_sum[i]; // Rainfall
        }

        const avgTemp = (totalTemp / count).toFixed(1);
        const avgRainfall = (totalRainfall / count).toFixed(1);

        // Determine climate type
        let climateType = "";
        if (avgTemp > 30) {
            climateType = "Hot and Dry";
        } else if (avgTemp > 25 && avgRainfall > 1000) {
            climateType = "Tropical & Humid";
        } else if (avgTemp > 15) {
            climateType = "Moderate Climate";
        } else {
            climateType = "Cold Climate";
        }

        // Fill climate details
        document.getElementById("climate-info").innerHTML += `
            <br><strong>Average Temperature:</strong> ${avgTemp}°C
            <br><strong>Average Rainfall:</strong> ${avgRainfall} mm/year
            <br><strong>Climate Type:</strong> ${climateType}
            <br><strong>Data from:</strong> 2010 to 2023
        `;

        // Fetch and display plant suggestions
        fetchPlantSuggestions(climateType);

    } catch (error) {
        console.error("Error fetching climate data:", error);
        alert("Failed to fetch climate data.");
    }
}

// Function to fetch Population & Tree Density
function fetchDensity(lat, lon) {
    let peopleDensity = "", treeDensity = "";

    if (lat && lon) {
        peopleDensity = "250-1000 people per km² (depending on urbanization level)";
        treeDensity = "100-1000 trees per km² (suggested for urban greening)";
    }

    // Fill population & tree density
    document.getElementById("density-info").innerHTML = `
        <strong>Population Density:</strong> ${peopleDensity}
        <br><strong>Tree Density:</strong> ${treeDensity}
    `;
}

// Function to suggest plants based on climate type
function fetchPlantSuggestions(climateType) {
    const plantDatabase = {
        "Hot and Dry": ["Neem", "Aloe Vera", "Bael", "Peepal"],
        "Tropical & Humid": ["Coconut", "Banana", "Mango", "Jackfruit"],
        "Moderate Climate": ["Guava", "Pomegranate", "Tamarind", "Jamun"],
        "Cold Climate": ["Pine", "Deodar", "Walnut", "Apple"]
    };

    const plants = plantDatabase[climateType] || ["No suggestions available"];

    document.getElementById("plant-info").innerHTML = `
        <strong>Recommended Plants:</strong> ${plants.join(", ")}
    `;
}

// Function to fetch construction materials based on temperature
function fetchConstructionMaterials(temperature) {
    let preferredMaterials = "", avoidedMaterials = "";

    if (temperature > 30) {
        preferredMaterials = "Heat-resistant materials like Clay, Ceramic tiles, Reflective coatings.";
        avoidedMaterials = "Materials that absorb heat like Concrete and Steel should be avoided.";
    } else if (temperature > 25) {
        preferredMaterials = "Natural stones like Granite, Marble for better insulation.";
        avoidedMaterials = "Avoid glass or other reflective materials that can amplify sunlight.";
    } else if (temperature > 15) {
        preferredMaterials = "Wood, Brick for insulation, and natural ventilation.";
        avoidedMaterials = "Avoid heavy concrete for outdoor walls in moderate climates.";
    } else {
        preferredMaterials = "Insulated walls with double glazing windows.";
        avoidedMaterials = "Avoid using aluminum or steel which can trap cold air inside.";
    }

    document.getElementById("materials-info").innerHTML = `
        <strong>Preferred Materials:</strong> ${preferredMaterials}
        <br><strong>Avoid Materials:</strong> ${avoidedMaterials}
    `;
}

// Function to suggest energy model based on temperature
function fetchEnergyModel(temperature) {
    let energyModel = "";

    if (temperature > 30) {
        energyModel = "Solar energy (high priority), Wind energy (moderate).";
    } else if (temperature > 25) {
        energyModel = "Solar energy (high priority), Wind energy (moderate).";
    } else if (temperature > 15) {
        energyModel = "Solar energy (moderate), Wind energy (moderate).";
    } else {
        energyModel = "Wind energy (high priority), Solar energy (moderate).";
    }

    // Fill energy model
    document.getElementById("energy-model-info").innerHTML = `
        <strong>Suggested Energy Model:</strong> ${energyModel}
    `;
}

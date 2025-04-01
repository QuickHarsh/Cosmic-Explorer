const API_KEY = 'e0961gU0MhHvQci6uozGbnkshKhmw7GdQQsgxWLP';
let currentDate = new Date();
let retryCount = 0;
const MAX_RETRIES = 3;

const datePicker = document.getElementById('datePicker');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const imageContainer = document.getElementById('imageContainer');
const nasaImage = document.getElementById('nasaImage');
const imageTitle = document.getElementById('imageTitle');
const imageDescription = document.getElementById('imageDescription');

datePicker.max = new Date().toISOString().split('T')[0];
datePicker.value = currentDate.toISOString().split('T')[0];

function showLoading() {
    loading.style.display = 'block';
    error.style.display = 'none';
    imageContainer.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    loading.style.display = 'none';
    error.style.display = 'block';
    error.textContent = `Error: ${message}`;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchImage(date = currentDate) {
    try {
        showLoading();

        const formattedDate = date.toISOString().split('T')[0];
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${formattedDate}`);
        
        if (!response.ok) {
            if (response.status === 429) {
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    await delay(waitTime);
                    return fetchImage(date);
                }
                throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
            }
            if (response.status === 400) {
                throw new Error('Invalid API key. Please get a valid API key from https://api.nasa.gov/');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        retryCount = 0;
        
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const img = new Image();
        img.onload = () => {
            nasaImage.src = data.url;
            imageTitle.textContent = data.title;
            imageDescription.textContent = data.explanation;
            datePicker.value = formattedDate;
            hideLoading();
            imageContainer.style.display = 'block';
        };
        
        img.onerror = () => {
            throw new Error('Failed to load image');
        };
        
        img.src = data.url;

    } catch (err) {
        console.error('Error:', err);
        showError(err.message || 'Failed to fetch image. Please try again.');
    }
}

function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    fetchImage(currentDate);
}

function nextDay() {
    const today = new Date();
    if (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 1);
        fetchImage(currentDate);
    }
}

datePicker.addEventListener('change', (e) => {
    currentDate = new Date(e.target.value);
    fetchImage(currentDate);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        previousDay();
    } else if (e.key === 'ArrowRight') {
        nextDay();
    }
});

fetchImage();

function createStarField() {
    const starField = document.createElement('div');
    starField.className = 'star-field';
    document.body.appendChild(starField);

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starField.appendChild(star);
    }
}
createStarField(); 
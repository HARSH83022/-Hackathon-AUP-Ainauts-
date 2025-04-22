document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        const loadingSpinner = document.getElementById('loadingSpinner');
        const imagePreview = document.getElementById('imagePreview');
        const feedback = document.getElementById('feedback');
        const resetButton = document.getElementById('resetButton');

        loadingSpinner.style.display = 'inline-block';
        feedback.innerText = '';

        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            imagePreview.src = img.src;
            imagePreview.style.display = 'block';

            img.onload = function() {
                EXIF.getData(img, function() {
                    const lat = EXIF.getTag(this, "GPSLatitude");
                    const lon = EXIF.getTag(this, "GPSLongitude");

                    if (lat && lon) {
                        const latRef = EXIF.getTag(this, "GPSLatitudeRef") === "N" ? 1 : -1;
                        const lonRef = EXIF.getTag(this, "GPSLongitudeRef") === "E" ? 1 : -1;

                        const latitude = latRef * (lat[0] + lat[1] / 60 + lat[2] / 3600);
                        const longitude = lonRef * (lon[0] + lon[1] / 60 + lon[2] / 3600);

                        displayMap(latitude, longitude);
                        feedback.innerText = "Image uploaded successfully!";
                        feedback.style.color = "lightgreen";
                    } else {
                        feedback.innerText = "No geotag found.";
                        feedback.style.color = "red";
                    }

                    loadingSpinner.style.display = 'none';
                    resetButton.style.display = 'inline-block';
                });
            };
        };

        reader.readAsDataURL(file);
    } else {
        document.getElementById('feedback').innerText = "Please upload an image.";
    }
});

function displayMap(latitude, longitude) {
    const map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Location from image')
        .openPopup();
}

document.getElementById('resetButton').addEventListener('click', function() {
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('map').innerHTML = ''; // Clear the map
    document.getElementById('feedback').innerText = '';
    document.getElementById('loadingSpinner').style.display = 'none';
    this.style.display = 'none'; // Hide reset button
});
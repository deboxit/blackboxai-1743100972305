// Map Integration Logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    const map = L.map('map').setView([19.0760, 72.8777], 12); // Default to Mumbai coordinates

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker
    let marker = null;
    let selectedLocation = null;

    // Zone restrictions data (simplified for demo)
    const zoneRestrictions = {
        'heritage': {
            name: 'Heritage Zone',
            description: 'Special restrictions apply in heritage zones',
            allowedTypes: ['business-sign']
        },
        'residential': {
            name: 'Residential Zone',
            description: 'Limited advertising allowed in residential areas',
            allowedTypes: ['business-sign']
        },
        'commercial': {
            name: 'Commercial Zone',
            description: 'Most advertisement types allowed',
            allowedTypes: ['hoarding', 'building-wrap', 'business-sign']
        }
    };

    // Handle map clicks
    map.on('click', function(e) {
        selectedLocation = e.latlng;
        
        // Update marker
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map)
            .bindPopup('Selected Location').openPopup();
        
        // Update form fields
        updateLocationFields(e.latlng);
        checkZoneRestrictions(e.latlng);
    });

    // Initialize address search
    const searchControl = new L.esri.Geocoding.geosearch({
        position: 'topright',
        placeholder: 'Search for an address...',
        useMapBounds: false,
        providers: [
            new L.esri.Geocoding.arcgisOnlineProvider({
                apikey: '', // Would use actual API key in production
                nearby: {
                    lat: 19.0760,
                    lng: 72.8777
                }
            })
        ]
    }).addTo(map);

    // Handle search results
    searchControl.on('results', function(data) {
        if (data.results.length > 0) {
            const result = data.results[0];
            selectedLocation = result.latlng;
            
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker(result.latlng).addTo(map)
                .bindPopup(result.text).openPopup();
            
            map.setView(result.latlng, 16);
            updateLocationFields(result.latlng);
            checkZoneRestrictions(result.latlng);
        }
    });

    // Update form fields with location data
    function updateLocationFields(latlng) {
        document.getElementById('location-coords').value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        
        // Reverse geocode to get address (simplified for demo)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
            .then(response => response.json())
            .then(data => {
                const address = data.display_name || 'Address not found';
                document.getElementById('location-address').value = address;
                document.getElementById('location-search').value = address;
            });
    }

    // Check zone restrictions for selected location
    function checkZoneRestrictions(latlng) {
        // In a real implementation, this would query a GIS service
        // For demo purposes, we'll simulate zone detection
        const zones = detectZones(latlng);
        const warningsDiv = document.getElementById('zone-warnings');
        warningsDiv.innerHTML = '';
        
        if (zones.length === 0) {
            warningsDiv.innerHTML = '<p>No special zone restrictions apply to this location</p>';
            return;
        }
        
        zones.forEach(zone => {
            const zoneInfo = zoneRestrictions[zone];
            const div = document.createElement('div');
            div.className = 'flex items-start';
            div.innerHTML = `
                <i class="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-2"></i>
                <div>
                    <p class="font-medium">${zoneInfo.name}</p>
                    <p class="text-xs">${zoneInfo.description}</p>
                </div>
            `;
            warningsDiv.appendChild(div);
        });
    }

    // Simulate zone detection (would be GIS service in production)
    function detectZones(latlng) {
        // Simple check based on coordinates
        const zones = [];
        if (latlng.lat > 19.07 && latlng.lat < 19.08 && latlng.lng > 72.86 && latlng.lng < 72.88) {
            zones.push('heritage');
        } else if (latlng.lat > 19.08 && latlng.lat < 19.10 && latlng.lng > 72.82 && latlng.lng < 72.85) {
            zones.push('residential');
        } else {
            zones.push('commercial');
        }
        return zones;
    }

    // Form validation for step 3
    window.validateStep = function(stepNumber) {
        if (stepNumber === 3) {
            const requiredFields = [
                'location-search',
                'location-address',
                'location-coords',
                'road-width',
                'traffic-volume',
                'visibility'
            ];
            
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value) {
                    field.classList.add('border-red-500');
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            if (!selectedLocation) {
                alert('Please select a location on the map');
                return false;
            }
            
            if (!isValid) {
                alert('Please complete all required fields before proceeding.');
                return false;
            }
        }
        
        return true;
    };
});
// Advertisement Specifications Logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize ad type selection
    const adTypeInput = document.getElementById('ad-type');
    const adTypeCards = document.querySelectorAll('[onclick^="selectAdType"]');
    
    // Set max allowed area based on ad type
    const maxAreas = {
        'hoarding': 50,
        'building-wrap': 200,
        'balloon': 78.5, // πr² for 5m radius
        'business-sign': 10
    };

    // Ad type selection
    window.selectAdType = function(type) {
        adTypeInput.value = type;
        
        // Update UI
        adTypeCards.forEach(card => {
            if (card.getAttribute('onclick').includes(type)) {
                card.classList.add('border-blue-500', 'bg-blue-50');
                card.classList.remove('border-gray-300');
            } else {
                card.classList.remove('border-blue-500', 'bg-blue-50');
                card.classList.add('border-gray-300');
            }
        });

        // Update max allowed area
        document.getElementById('max-allowed').textContent = `${maxAreas[type]} m²`;
        calculateArea();
    };

    // Area calculation
    const widthInput = document.getElementById('ad-width');
    const heightInput = document.getElementById('ad-height');
    
    widthInput.addEventListener('input', calculateArea);
    heightInput.addEventListener('input', calculateArea);

    function calculateArea() {
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        const area = width * height;
        const adType = adTypeInput.value;
        const maxArea = maxAreas[adType] || 50;
        
        document.getElementById('ad-area').textContent = `${area.toFixed(1)} m²`;
        
        const percentage = Math.min((area / maxArea) * 100, 100);
        document.getElementById('area-progress').style.width = `${percentage}%`;
        
        if (area > maxArea) {
            document.getElementById('area-progress').classList.add('bg-red-600');
            document.getElementById('area-progress').classList.remove('bg-blue-600');
            document.getElementById('area-warning').classList.remove('hidden');
        } else {
            document.getElementById('area-progress').classList.remove('bg-red-600');
            document.getElementById('area-progress').classList.add('bg-blue-600');
            document.getElementById('area-warning').classList.add('hidden');
        }
    }

    // Illumination options toggle
    const illuminationRadios = document.querySelectorAll('input[name="illumination"]');
    const illuminationOptions = document.getElementById('illumination-options');
    
    illuminationRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value !== 'none') {
                illuminationOptions.classList.remove('hidden');
                document.getElementById('luminance').required = true;
                document.getElementById('timer').required = true;
            } else {
                illuminationOptions.classList.add('hidden');
                document.getElementById('luminance').required = false;
                document.getElementById('timer').required = false;
            }
        });
    });

    // Form validation for step 2
    window.validateStep = function(stepNumber) {
        if (stepNumber === 2) {
            const requiredFields = [
                'ad-type',
                'ad-width',
                'ad-height',
                'illumination'
            ];
            
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value) {
                    if (field.type === 'hidden') {
                        // For ad type which is a hidden field
                        alert('Please select an advertisement type');
                    }
                    field.classList.add('border-red-500');
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            // Additional validation for illumination details
            if (document.querySelector('input[name="illumination"]:checked')?.value !== 'none') {
                if (!document.getElementById('luminance').value) {
                    document.getElementById('luminance').classList.add('border-red-500');
                    isValid = false;
                }
            }
            
            if (!isValid) {
                alert('Please complete all required fields before proceeding.');
                return false;
            }
            
            // Validate area limits
            const width = parseFloat(widthInput.value) || 0;
            const height = parseFloat(heightInput.value) || 0;
            const area = width * height;
            const adType = adTypeInput.value;
            const maxArea = maxAreas[adType] || 50;
            
            if (area > maxArea) {
                alert('Advertisement dimensions exceed maximum allowed area for this type.');
                return false;
            }
        }
        
        return true;
    };
});
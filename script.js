// --- 1. DATA STRUCTURE (MIMICKING BACKEND DATA) ---

const movies = [
    { id: 1, title: "Dune: Part Two", price: 15.00 },
    { id: 2, title: "Oppenheimer", price: 12.50 },
    { id: 3, title: "Barbie", price: 10.00 },
];

// In a real system, showtimes and seat status would come from a server.
// The 'occupied' array represents seats already taken for a specific showtime.
const showtimes = {
    '1_10AM': { id: '1_10AM', time: '10:00 AM', movieId: 1, occupied: [1, 2, 9, 10, 11, 25, 26] },
    '1_1PM': { id: '1_1PM', time: '01:00 PM', movieId: 1, occupied: [5, 6, 15, 16, 30] },
    '2_11AM': { id: '2_11AM', time: '11:00 AM', movieId: 2, occupied: [3, 4, 18, 19, 20] },
    '3_7PM': { id: '3_7PM', time: '07:00 PM', movieId: 3, occupied: [7, 8, 22, 23, 24] },
};

// Seating layout: 4 rows of 8 seats each (32 seats total)
const SEAT_LAYOUT = {
    rows: ['A', 'B', 'C', 'D'],
    seatsPerRow: 8
};


// --- 2. DOM ELEMENTS & STATE ---

const movieSelect = document.getElementById('movie-select');
const showtimeSelect = document.getElementById('showtime-select');
const seatingGrid = document.getElementById('seating-grid');
const seatCount = document.getElementById('seat-count');
const totalPrice = document.getElementById('total-price');
const bookBtn = document.getElementById('book-btn');

let currentShowtimeId = '1_10AM'; // Default selection
let selectedSeats = [];


// --- 3. CORE FUNCTIONS ---

// Function to populate the movie and showtime dropdowns
function populateSelectors() {
    // Populate Movies
    movieSelect.innerHTML = movies.map(movie => 
        `<option value="${movie.id}">${movie.title} ($${movie.price.toFixed(2)})</option>`
    ).join('');

    // Populate Showtimes (Filtered by default movie)
    updateShowtimeOptions(movies[0].id);
    
    // Set the initial price based on the default movie
    currentShowtimeId = showtimeSelect.value;
    updateSummary();
}

// Function to update showtime options when a movie is selected
function updateShowtimeOptions(movieId) {
    const availableShowtimes = Object.values(showtimes).filter(st => st.movieId === parseInt(movieId));
    
    showtimeSelect.innerHTML = availableShowtimes.map(st => 
        `<option value="${st.id}">${st.time}</option>`
    ).join('');
    
    // Set the first available showtime as default
    if (availableShowtimes.length > 0) {
        currentShowtimeId = availableShowtimes[0].id;
    } else {
        currentShowtimeId = null;
    }

    selectedSeats = []; // Clear selection on movie/showtime change
    renderSeatingGrid();
}

// Function to generate the seating HTML structure
function renderSeatingGrid() {
    if (!currentShowtimeId) {
        seatingGrid.innerHTML = '<p style="text-align: center; color: #999;">No showtimes available for this movie.</p>';
        updateSummary();
        return;
    }

    const { occupied } = showtimes[currentShowtimeId];
    let seatIndex = 0;
    let html = '';

    SEAT_LAYOUT.rows.forEach(rowLetter => {
        let rowHtml = `<div class="row" data-row="${rowLetter}">`;
        
        for (let i = 1; i <= SEAT_LAYOUT.seatsPerRow; i++) {
            seatIndex++; // Global index for the entire hall (1 to 32)
            const seatLabel = `${rowLetter}${i}`;
            
            const isOccupied = occupied.includes(seatIndex) ? 'occupied' : '';
            const isSelected = selectedSeats.includes(seatIndex) ? 'selected' : '';

            rowHtml += `
                <div class="seat ${isOccupied} ${isSelected}" 
                     data-seat-index="${seatIndex}" 
                     title="${seatLabel}"
                ></div>
            `;
        }
        rowHtml += '</div>';
        html += rowHtml;
    });

    seatingGrid.innerHTML = html;
    updateSummary();
}

// Function to update the ticket summary
function updateSummary() {
    const count = selectedSeats.length;
    const movieId = movieSelect.value;
    const movie = movies.find(m => m.id == movieId);
    const price = movie ? movie.price : 0;
    const total = count * price;

    seatCount.innerText = count;
    totalPrice.innerText = total.toFixed(2);
    
    bookBtn.disabled = count === 0;
}

// --- 4. EVENT LISTENERS ---

// Handle movie selection change
movieSelect.addEventListener('change', (e) => {
    updateShowtimeOptions(e.target.value);
});

// Handle showtime selection change
showtimeSelect.addEventListener('change', (e) => {
    currentShowtimeId = e.target.value;
    selectedSeats = []; // Clear selection when changing showtime
    renderSeatingGrid();
});


// Handle seat click event
seatingGrid.addEventListener('click', (e) => {
    const seatEl = e.target;
    
    // 1. Check if it's a seat AND not occupied
    if (seatEl.classList.contains('seat') && !seatEl.classList.contains('occupied')) {
        seatEl.classList.toggle('selected');
        
        const seatIndex = parseInt(seatEl.dataset.seatIndex);
        
        // 2. Update the 'selectedSeats' array
        if (seatEl.classList.contains('selected')) {
            selectedSeats.push(seatIndex);
        } else {
            selectedSeats = selectedSeats.filter(index => index !== seatIndex);
        }

        // 3. Update the summary
        updateSummary();
    }
});

// Handle final booking (In a real app, this sends data to a server)
bookBtn.addEventListener('click', () => {
    if (selectedSeats.length > 0) {
        // Prepare data for server
        const bookingData = {
            showtimeId: currentShowtimeId,
            seats: selectedSeats,
            totalPrice: parseFloat(totalPrice.innerText)
        };
        
        console.log('--- BOOKING SUBMITTED ---');
        console.log(bookingData);

        // Simulated success message
        alert(`Booking successful for ${selectedSeats.length} seats! Total: $${totalPrice.innerText}`);

        // In a real system, upon success, the seats would be marked as 'occupied' 
        // in the backend, and the UI would be updated.
        
        // For this demo, let's reset the selection
        selectedSeats.forEach(index => {
            // Find the seat element by its data-seat-index attribute
            const seat = seatingGrid.querySelector(`[data-seat-index="${index}"]`);
            if (seat) {
                 // Simulate occupation
                seat.classList.remove('selected');
                seat.classList.add('occupied');
            }
        });
        
        // Clear local selection array and update summary
        selectedSeats = [];
        updateSummary();
    }
});

// --- 5. INITIALIZATION ---

populateSelectors();
renderSeatingGrid(); // Initial rendering of the seat layout
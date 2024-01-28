document.addEventListener('DOMContentLoaded', function() {
    const dateContainer = document.getElementById('dateContainer');
    const prevWeek = document.getElementById('prevWeek');
    const nextWeek = document.getElementById('nextWeek');

    let currentDate = new Date();



    function fillDateContainer() {
        dateContainer.innerHTML = '';
        let tempDate = new Date(currentDate);

        for (let i = 0; i < 7; i++) {
            let dayDiv = document.createElement('div');
            dayDiv.textContent = `${tempDate.getDate()}/${tempDate.getMonth() + 1}`;
            dayDiv.dataset.date = tempDate.toISOString().split('T')[0];
            dayDiv.addEventListener('click', function() {
                fetchAvailableTimes(this.dataset.date);
            });
            dateContainer.appendChild(dayDiv);
            tempDate.setDate(tempDate.getDate() + 1);
        }
        prevWeek.disabled = currentDate <= new Date();
    }

    function fetchAvailableTimes(date) {
        fetch(`/get-opening-hours/${date}`)
            .then(response => response.json())
            .then(data => {
                displayAvailableTimes(data, date);
            });
    }

    function displayAvailableTimes(data, date) {
        const availableTimesContainer = document.getElementById('availableTimes');
        availableTimesContainer.innerHTML = '';

        let openTime = moment(data.open, 'HH:mm');
        const closeTime = moment(data.close, 'HH:mm');

        while (openTime.isBefore(closeTime)) {
            let timeSlotButton = document.createElement('button');
            timeSlotButton.classList.add('time-slot');
            timeSlotButton.textContent = openTime.format('HH:mm');
            timeSlotButton.dataset.datetime = date + ' ' + openTime.format('HH:mm');
            timeSlotButton.addEventListener('click', function() {
                // Logique à exécuter lorsque l'utilisateur sélectionne un créneau
                // Par exemple, afficher un formulaire de réservation ou enregistrer le choix
            });
            availableTimesContainer.appendChild(timeSlotButton);
            openTime.add(30, 'minutes');
        }
    }

    prevWeek.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 7);
        fillDateContainer();
    });

    nextWeek.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 7);
        fillDateContainer();
    });

    fillDateContainer();
});
document.addEventListener('DOMContentLoaded', function() {
    const dateContainer = document.getElementById('dateContainer');
    const availableTimesContainer = document.getElementById('availableTimes');
    const prevWeek = document.getElementById('prevWeek');
    const nextWeek = document.getElementById('nextWeek');

    let currentDate = new Date();

    document.querySelectorAll('.prestation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const duration = this.dataset.duration;
            // Stockez la durée ou l'ID de la prestation selon le besoin
            // Affichez les sélecteurs de date et les créneaux
            document.getElementById('dateSelector').style.display = 'flex';
            // Peut-être initialiser le calendrier ici ou faire d'autres actions
        });
    });

    function fillDateContainer() {
        dateContainer.innerHTML = '';
        let tempDate = new Date(currentDate);

        for (let i = 0; i < 5; i++) {
            let dayDiv = document.createElement('div');
            dayDiv.textContent = `${tempDate.getDate()}/${tempDate.getMonth() + 1}`;
            dayDiv.dataset.date = tempDate.toISOString().split('T')[0];
            dayDiv.className = 'day-slot btn m-1';
            dayDiv.addEventListener('click', function() {
                fetchOpeningHoursAndAbsences(this.dataset.date);
            });
            dateContainer.appendChild(dayDiv);
            tempDate.setDate(tempDate.getDate() + 1);
        }
        prevWeek.disabled = currentDate <= new Date();

        let thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Désactiver le bouton "nextWeek" si currentDate dépasse thirtyDaysFromNow
        nextWeek.disabled = currentDate > thirtyDaysFromNow;

    }



    function fetchOpeningHoursAndAbsences(date) {
        fetch(`/get-opening-hours/${date}`)
            .then(response => response.json())
            .then(data => {
                if (!data.businessHours || !data.absences) {
                    console.error('La réponse du serveur ne contient pas les propriétés attendues.');
                    availableTimesContainer.innerHTML = '<p>Erreur lors de la récupération des disponibilités.</p>';
                    return;
                }

                // Si le tableau businessHours est vide, afficher un message

                if (data.businessHours.length === 0) {
                    availableTimesContainer.innerHTML = '<p>Aucunes disponibilités pour ce jour</p>';
                } else {
                    // Sinon, afficher les créneaux disponibles
                    displayAvailableTimes(data.businessHours, data.absences, date);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des disponibilités:', error);
                availableTimesContainer.innerHTML = '<p>Erreur lors de la récupération des disponibilités.</p>';
            });
    }



    function displayAvailableTimes(businessHours, absences, selectedDate) {
        availableTimesContainer.innerHTML = ''; // Nettoyer les créneaux précédemment affichés

        businessHours.forEach(hour => {
            let openTime = moment(hour.open, 'HH:mm');
            const closeTime = moment(hour.close, 'HH:mm');

            while (openTime.isBefore(closeTime)) {
                // Créer et afficher le bouton pour le créneau disponible
                const timeSlotButton = document.createElement('button');
                timeSlotButton.className = 'time-slot btn m-1';
                timeSlotButton.textContent = openTime.format('HH:mm');
                timeSlotButton.dataset.datetime = `${selectedDate} ${openTime.format('HH:mm')}`;
                timeSlotButton.addEventListener('click', function() {
                    // Ici, vous pouvez ajouter la logique pour gérer la sélection d'un créneau
                    console.log(`Créneau sélectionné : ${this.dataset.datetime}`);
                    // Par exemple, sauvegarder la sélection, afficher une modale, etc.
                });
                availableTimesContainer.appendChild(timeSlotButton);

                openTime.add(30, 'minutes'); // Passer au créneau suivant
            }
        });

        // Si aucun bouton n'est créé, cela signifie qu'il n'y a pas de créneaux disponibles
        if (availableTimesContainer.children.length === 0) {
            availableTimesContainer.innerHTML = '<p>Aucunes disponibilités pour ce jour</p>';
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
<?php

namespace App\Controller;

use App\Repository\AbsenceRepository;
use App\Repository\BusinessHoursRepository;
use App\Repository\PrestationsRepository;
use DateTime;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BookingController extends AbstractController
{
    #[Route('/reserver', name: 'app_booking')]
    public function index(PrestationsRepository $prestationsRepository): Response
    {
        $prestations = $prestationsRepository->findAll();

        return $this->render('booking/index.html.twig', [
            'prestations' => $prestations,
        ]);
    }
    // src/Controller/ReservationController.php


    /**
     * @throws Exception
     */
    #[Route('/get-opening-hours/{date}', name: 'get_opening_hours')]
    public function getOpeningHours($date, BusinessHoursRepository $businessHoursRepository,AbsenceRepository $absenceRepository): JsonResponse {
        // Récupérer les horaires d'ouverture et de fermeture pour la date donnée
        // Vous devrez adapter cette logique en fonction de votre modèle de données
        $dateTime = new \DateTime($date);
        $dayOfWeek = $dateTime->format('l'); // 'l' pour obtenir le nom complet du jour en anglais

        // Utilisez la méthode convertDayToNumeric si nécessaire pour obtenir la représentation numérique ou textuelle du jour
        $day = $this->convertDayToNumeric(strtolower($dayOfWeek));

        $businessHours = $businessHoursRepository->findBy([
            'day' => $dayOfWeek,
            'isActive' => false
        ]);

        $hours = [];
        foreach ($businessHours as $businessHour) {
            // Assurez-vous que votre méthode findForDate renvoie quelque chose que vous pouvez itérer
            $hours[] = [
                'open' => $businessHour->getStartTime()->format('H:i'),
                'close' => $businessHour->getEndTime()->format('H:i'),
            ];
        }
        $absences = $absenceRepository->findByDate($dateTime);
        $absencesFormatted = [];
        foreach ($absences as $absence) {
            // Similaire pour les absences, assurez-vous que la méthode renvoie quelque chose d'itérable
            $absencesFormatted[] = [
                'start' => $absence->getStartTime() ? $absence->getStartTime()->format('H:i') : null,
                'end' => $absence->getEndTime() ? $absence->getEndTime()->format('H:i') : null,
                'allDay' => $absence->isFullDay(),
            ];
        }

        return new JsonResponse([
            'businessHours' => $hours,
            'absences' => $absencesFormatted,
        ]);
    }

    private function convertDayToNumeric($dayString) {
        $days = ['sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3, 'thursday' => 4 , 'friday' => 5,'saturday' => 6];
        return $days[strtolower($dayString)] ?? null;
    }





}

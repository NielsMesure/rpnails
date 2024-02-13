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
    public function getOpeningHours($date, BusinessHoursRepository $businessHoursRepository): JsonResponse {

        $dateTime = new \DateTime($date);
        $dayOfWeek = $dateTime->format('l'); // 'l' pour obtenir le nom complet du jour en anglais


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



        return new JsonResponse([
            'hours' => $hours,
        ]);
    }


    /**
     * @throws Exception
     */
    #[Route('/get-absences/{date}', name: 'get_absences')]
    public function getAbsencesByDate($date, BusinessHoursRepository $businessHoursRepository,AbsenceRepository $absenceRepository): JsonResponse {

        $dateObject = new \DateTime($date);
        $absences = $absenceRepository->findBy(['date' => $dateObject]);


        $absenceTimes = [];
        foreach ($absences as $absence) {
            $absenceTimes[] = [
                'start' => $absence->getStartTime() ? $absence->getStartTime()->format('H:i') : null,
                'end' => $absence->getEndTime() ? $absence->getEndTime()->format('H:i') : null,
                'allDay' => $absence->isFullDay(),
            ];
        }

        return new JsonResponse([

            'absences' => $absenceTimes,
        ]);
    }





}

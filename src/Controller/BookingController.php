<?php

namespace App\Controller;

use App\Repository\BusinessHoursRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BookingController extends AbstractController
{
    #[Route('/reserver', name: 'app_booking')]
    public function index(): Response
    {
        return $this->render('booking/index.html.twig');
    }
    // src/Controller/ReservationController.php


    #[Route('/get-opening-hours/{date}', name: 'get_opening_hours')]
    public function getOpeningHours($date, BusinessHoursRepository $repository): JsonResponse {
        // Récupérer les horaires d'ouverture et de fermeture pour la date donnée
        // Vous devrez adapter cette logique en fonction de votre modèle de données
        $businessHours = $repository->findForDate(new \DateTime($date));

        return new JsonResponse([
            'open' => $businessHours->getOpenTime()->format('H:i'),
            'close' => $businessHours->getCloseTime()->format('H:i'),
        ]);
    }

}

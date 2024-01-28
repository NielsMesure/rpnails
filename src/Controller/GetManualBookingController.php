<?php

namespace App\Controller;

use App\Entity\Disponibilite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class GetManualBookingController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/get-disponibilites', name: 'app_get_disponibilites')]
    public function getDisponibilites(): JsonResponse
    {
        // Récupérer les disponibilités depuis la base de données
        $disponibilites = $this->entityManager->getRepository(Disponibilite::class)->findAll();

        $events = [];

        foreach ($disponibilites as $disponibilite) {
            // Format pour FullCalendar
            $events[] = [
                'title' => 'Réservation',
                'start' => $disponibilite->getDate()->format('Y-m-d') . 'T' . $disponibilite->getStartTime()->format('H:i:s'),
                'end' => $disponibilite->getDate()->format('Y-m-d') . 'T' . $disponibilite->getEndTime()->format('H:i:s'),
                'color' => '#28a745' // Vous pouvez personnaliser la couleur ici
            ];
        }
        return new JsonResponse($events);
    }
}

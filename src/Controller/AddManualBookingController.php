<?php

namespace App\Controller;

use App\Entity\Disponibilite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class AddManualBookingController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager){
        $this->entityManager = $entityManager;
    }

    #[Route('/add-disponibilite', name: 'app_add_disponibilite')]
    public function add(Request $request,SerializerInterface $serializer): Response
    {
        $data = json_decode($request->getContent(), true);

        // Créer une nouvelle disponibilité
        $disponibilite = new Disponibilite();
        $disponibilite->setDate(new \DateTime($data['date']));
        $disponibilite->setStartTime(new \DateTime($data['startTime']));
        $disponibilite->setEndTime(new \DateTime($data['endTime']));

        // Valider et sauvegarder les données ici

        $this->entityManager->persist($disponibilite);
        $this->entityManager->flush();

        return new JsonResponse(['status' => 'successbooking']);
    }
}

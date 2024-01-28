<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class OpeningHoursController extends AbstractController
{
    #[Route('/admin/horaires', name: 'app_horaires')]
    public function index(): Response
    {
        return $this->render('horaires/index.html.twig');
    }
}

<?php

namespace App\Controller;


use App\Classe\Search;
use App\Entity\User;
use App\Form\SearchType;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ContactController extends AbstractController
{

    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/contact', name: 'app_contact')]
    public function index(Request $request): Response
    {
        $users = $this->entityManager->getRepository(User::class)->findAll();
        $search = new Search();
        $form = $this->createForm(SearchType::class, $search);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()){
            $users = $this->entityManager->getRepository(User::class)->findWithSearch($search);
        }


        return $this->render('contact/index.html.twig',[
            'users' => $users,
            'form' => $form->createView()
        ]);
    }

}

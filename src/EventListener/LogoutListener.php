<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;

use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutListener
{
    public function onSymfonyComponentSecurityHttpEventLogoutEvent(LogoutEvent $event)
    {
        $response = new Response();
        // Crée un cookie qui expire immédiatement
        $cookie = Cookie::create('isLoggedIn')
            ->withValue('')
            ->withExpires(time() - 3600)
            ->withPath('/')
            ->withSecure(false)
            ->withHttpOnly(true);

        $response->headers->setCookie($cookie);
        $event->getResponse()->headers->setCookie($cookie);
    }
}

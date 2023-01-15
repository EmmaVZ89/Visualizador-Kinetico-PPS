import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import anime from 'animejs/lib/anime.es.js';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
  constructor(
    private router: Router,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate([`/login`]);
    }, 2000);
    var textWrapper = document.querySelector('.ml12');
    textWrapper.innerHTML = textWrapper.textContent.replace(
      /\S/g,
      "<span class='letter'>$&</span>"
    );

    anime
      .timeline({ loop: true })
      .add({
        targets: '.ml12 .letter',
        translateX: [40, 0],
        translateZ: 0,
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: (el, i) => 500 + 30 * i,
      })
      .add({
        targets: '.ml12 .letter',
        translateX: [0, -30],
        opacity: [1, 0],
        easing: 'easeInExpo',
        duration: 1100,
        delay: (el, i) => 100 + 30 * i,
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
    });
  }
}

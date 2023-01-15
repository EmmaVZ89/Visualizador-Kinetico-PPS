import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { AlertController } from '@ionic/angular';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.auth.getUserLogged().subscribe((res) => {
      if (res !== null) {
        this.router.navigate(['/home']);
      }
    });
  }

  loginUser() {
    // let newUser: User = {
    //   userId: '5',
    //   userName: 'Tester',
    //   userEmail: 'tester@tester.com',
    //   userPassword: '555555',
    //   userRol: 'tester',
    //   userSex: 'femenino',
    // };
    // this.auth.registerNewUser(newUser);
    if (this.email && this.password) {
      this.auth.signIn(this.email, this.password);
    } else {
      this.auth.toast('¡Por favor completa todos los campos!', 'warning');
    }
  } // end of loginUser

  loadFastUser(numUser: number) {
    switch (numUser) {
      case 1:
        this.email = 'admin@admin.com';
        this.password = '111111';
        this.auth.toast(
          '¡Usuario cargado, ahora puedes Iniciar Sesión!',
          'dark'
        );
        break;
      case 2:
        this.email = 'invitado@invitado.com';
        this.password = '222222';
        this.auth.toast(
          '¡Usuario cargado, ahora puedes Iniciar Sesión!',
          'dark'
        );
        break;
      case 3:
        this.email = 'usuario@usuario.com';
        this.password = '333333';
        this.auth.toast(
          '¡Usuario cargado, ahora puedes Iniciar Sesión!',
          'dark'
        );
        break;
      default:
        break;
    }
  } // end of loadFastUser
}

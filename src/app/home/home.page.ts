import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { PhotoService } from '../services/photo.service';
import * as moment from 'moment';
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  LinearScale,
  registerables,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { IonSlides } from '@ionic/angular';
import { ViewChild } from '@angular/core';

import {
  DeviceMotion,
  DeviceMotionAccelerationData,
} from '@ionic-native/device-motion/ngx';

import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('slides', { static: false }) slides: IonSlides;
  watch: any;
  currentSlide = 0;

  user: any = null;
  menu: number = 0;
  pressedButton: boolean = false;
  menuTittle: string = 'COSAS LINDAS';
  cosasLindasList: any = [];
  cosasFeasList: any = [];
  imagenesUsuario: any = [];
  like: boolean = true;
  userImagesCosasLindas: boolean = false;
  userImagesCosasFeas: boolean = false;

  pipeChart: Chart;
  viewPipeChart: boolean;

  loading: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private photoService: PhotoService,
    private firestoreService: FirestoreService,
    private ref: ChangeDetectorRef,
    private deviceMotion: DeviceMotion,
    private loadingController: LoadingController
  ) {
    Chart.register(
      BarElement,
      BarController,
      CategoryScale,
      Decimation,
      Filler,
      Legend,
      Title,
      Tooltip,
      LinearScale,
      ChartDataLabels
    );

    Chart.register(...registerables);
  } // end of constructor

  ngOnInit(): void {
    this.showLoading("");
    this.authService.user$.subscribe((user: any) => {
      this.loading.dismiss();
      if (user) {
        this.user = user;

        this.firestoreService.getCosasLindas().subscribe((value) => {
          this.cosasLindasList = value;
          this.cosasLindasList.sort(this.sortList);
          for (let i = 0; i < this.cosasLindasList.length; i++) {
            const photo = this.cosasLindasList[i];
            photo.hour = moment(new Date(parseInt(photo.hour))).format(
              'DD-MM-YYYY HH:mm:ss'
            );
          }
        });

        this.firestoreService.getCosasFeas().subscribe((value) => {
          this.cosasFeasList = value;
          this.cosasFeasList.sort(this.sortList);
          for (let i = 0; i < this.cosasFeasList.length; i++) {
            const photo = this.cosasFeasList[i];
            photo.hour = moment(new Date(parseInt(photo.hour))).format(
              'DD-MM-YYYY HH:mm:ss'
            );
          }
        });
      } else {
        // this.router.navigate(['/login']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.watch = this.deviceMotion
      .watchAcceleration({ frequency: 400 })
      .subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.handleAcceleration(acceleration);
      });
  }

  ngOnDestroy() {
    this.watch.unsubscribe();
  }

  handleAcceleration(acceleration: DeviceMotionAccelerationData) {
    if (this.slides != undefined) {
      if (acceleration.x > 5) {
        this.slides.slidePrev();
      } else if (acceleration.x < -5) {
        this.slides.slideNext();
      } else if (acceleration.y > 8) {
        this.slides.slideTo(0, 500);
      }
    }
  }

  logoutUser() {
    setTimeout(() => {
      this.menu = 0;
      this.userImagesCosasLindas = false;
      this.userImagesCosasFeas = false;
    }, 2500);
    this.authService.signOut();
  } // end of logoutUser

  // view = [0-menu botones | 1-menu cosas lindas | 2-menu cosas feas]
  chooseMenu(view: number) {
    this.showLoading("");
    if (view === 1) {
      setTimeout(() => {
        this.menu = 1;
        this.menuTittle = 'COSAS LINDAS';
        this.loading.dismiss();
      }, 2000);
    } else if (view === 2) {
      setTimeout(() => {
        this.menu = 2;
        this.menuTittle = 'COSAS FEAS';
        this.loading.dismiss();
      }, 2000);
    } else if (view === 3) {
      setTimeout(() => {
        this.menu = 3;
        this.loading.dismiss();
        setTimeout(() => {
          this.generatePipeChart();
        }, 1000);
      }, 2000);
    } else if (view === 4) {
      setTimeout(() => {
        this.menu = 4;
        this.loading.dismiss();
        setTimeout(() => {
          this.generateBarChart();
        }, 1000);
      }, 2000);
    } else {
      setTimeout(() => {
        this.menu = 0;
        this.userImagesCosasLindas = false;
        this.userImagesCosasFeas = false;
        this.loading.dismiss();
      }, 2000);
    }
  }

  addPhotoToGallery() {
    const type = this.menu;
    const photo = {
      userName: this.user.userName,
      pathFoto: '',
      email: this.user.userEmail,
      hour: '',
      likes: [],
    };
    this.photoService.addNewToGallery(photo, type).then(() => {
      this.showLoading("Subiendo foto...");
      setTimeout(() => {
        this.loading.dismiss();
      }, 2000);
    });
  } // end of addPhotoToGallery

  sortList(photo1: any, photo2: any) {
    let rtn = 0;
    if (parseInt(photo1.hour) > parseInt(photo2.hour)) {
      rtn = -1;
    } else if (parseInt(photo1.hour) < parseInt(photo2.hour)) {
      rtn = 1;
    }
    return rtn;
  }

  voteImage(photo: any, dislike: any) {
    let collection: string;
    if (this.menu == 1) {
      collection = 'cosasLindas';
    } else if (this.menu == 2) {
      collection = 'cosasFeas';
    }

    if (!dislike) {
      photo.likes.push(this.user.userEmail);
    } else {
      photo.likes = photo.likes.filter(
        (like: string) => like != this.user.userEmail
      );
    }

    photo.hour = this.convertDateToUnix(photo);

    this.showLoading("");
    this.firestoreService.updateImage(photo, photo.id, collection).then(()=>{
      this.loading.dismiss();
    });
  } // end of voteImage

  convertDateToUnix(photo: any) {
    const initialDate = photo.hour;
    const splitDate = initialDate.split(' ');
    const date = splitDate[0].split('-');
    const time = splitDate[1].split(':');
    const dd = date[0];
    const mm = date[1] - 1;
    const yyyy = date[2];
    const hh = time[0];
    const min = time[1];
    const ss = time[2];
    const dateDate = new Date(yyyy, mm, dd, hh, min, ss);

    return dateDate.getTime();
  } // end of convertDateToUnix

  seeOwnImages() {
    this.showLoading("");
    setTimeout(() => {
      this.loading.dismiss();
      this.userImagesCosasLindas = true;
      this.userImagesCosasFeas = true;
      this.imagenesUsuario = [];
      if (this.menu == 1 && this.userImagesCosasLindas) {
        for (let i = 0; i < this.cosasLindasList.length; i++) {
          const item = this.cosasLindasList[i];
          if (item.email == this.user.userEmail) {
            this.imagenesUsuario.push(item);
          }
        }
      } else if (this.menu == 2 && this.userImagesCosasFeas) {
        for (let i = 0; i < this.cosasFeasList.length; i++) {
          const item = this.cosasFeasList[i];
          if (item.email == this.user.userEmail) {
            this.imagenesUsuario.push(item);
          }
        }
      }
    }, 2000);
  } // end of seeOwnImages

  generatePipeChart() {
    const ctx = (<any>document.getElementById('pipeChart')).getContext('2d');

    const photos = this.cosasLindasList.filter((p) => p.likes.length > 0);
    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#92949c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    let i = 0;
    const photoColors = photos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    const images = photos.map((p) => {
      const image = new Image(150, 150);
      image.src = p.pathFoto;
      return image;
    });

    this.pipeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: photos.map((p) => p.userName + ' ' + p.hour),
        datasets: [
          {
            label: 'Voto de cosas lindas',
            data: photos.map((p) => p.likes.length),
            backgroundColor: photoColors,
            borderColor: photoColors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#ffffff',
            borderWidth: 3,
            boxHeight: 160,
            boxWidth: 160,
            cornerRadius: 20,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle: (context) => {
                // console.log(context);
                // context.formattedValue = '';
                context.label = 'Votos';
                return {
                  pointStyle: images[context.dataIndex],
                };
              },
            },
          },
          legend: {
            display: false,
          },
          datalabels: {
            color: '#ffffff',
            anchor: 'end',
            align: 'center',
            font: {
              size: 30,
              weight: 'bold',
            },
            offset: 5,
            backgroundColor: photoColors,
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: 10,
            padding: 5,
            textShadowBlur: 10,
            textShadowColor: '#000000',
          },
        },
      },
    });
  } // end of generatePipeChart

  generateBarChart() {
    const ctx = (<any>document.getElementById('pipeChart')).getContext('2d');

    const photos = this.cosasFeasList.filter((p) => p.likes.length > 0);
    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#92949c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    let i = 0;
    const photoColors = photos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    const images = photos.map((p) => {
      const image = new Image(150, 150);
      image.src = p.pathFoto;
      return image;
    });

    this.pipeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: photos.map((p) => ''),
        datasets: [
          {
            data: photos.map((p) => p.likes.length),
            backgroundColor: photoColors,
            borderColor: photoColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            display: false,
          },
          x: {
            grid: {
              color: '#555555',
              drawBorder: true,
            },
            ticks: {
              color: 'rgb(0,0,0)',
              font: {
                family: "'Pretendard', sans-serif",
                weight: 'bold',
              },
            },
          },
        },
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#ffffff',
            borderWidth: 3,
            boxHeight: 160,
            boxWidth: 160,
            cornerRadius: 20,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle: (context) => {
                // console.log(context);
                context.formattedValue = 'Votos:' + context.formattedValue;
                context.label = '';
                return {
                  pointStyle: images[context.dataIndex],
                };
              },
            },
          },
          legend: {
            display: false,
          },
          datalabels: {
            color: '#ffffff',
            anchor: 'end',
            align: 'center',
            font: {
              size: 30,
              weight: 'bold',
            },
            offset: 5,
            backgroundColor: photoColors,
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: 10,
            padding: 5,
            textShadowBlur: 10,
            textShadowColor: '#000000',
          },
        },
      },
    });
  } // end of generateBarChart

  async showLoading(message: string) {
    try {
      this.loading = await this.loadingController.create({
        message: message,
        spinner: 'crescent',
        showBackdrop: true,
      });
      this.loading.present();
    } catch (error) {
      console.log(error.message);
    }
  }
}

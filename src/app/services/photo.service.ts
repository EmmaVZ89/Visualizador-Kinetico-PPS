import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { getStorage, ref, uploadString } from 'firebase/storage';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  user: any = null;

  constructor(
    private authService: AuthService,
    private angularFirestorage: AngularFireStorage,
    private firestoreService: FirestoreService
  ) {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
      }
    });
  }

  async addNewToGallery(photo: any, type: number) {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      webUseInput: true,
    });

    const storage = getStorage();
    const date = new Date().getTime();

    photo.hour = date;

    const name = `${this.user.userEmail} ${date}`;
    const storageRef = ref(storage, name);
    const url = this.angularFirestorage.ref(name);

    uploadString(storageRef, capturedPhoto.dataUrl, 'data_url').then(() => {
      url.getDownloadURL().subscribe((url1: any) => {
        photo.pathFoto = url1;
        this.firestoreService.addPhoto(photo, type);
        this.authService.toast('Foto subida con exito', 'success');
      });
    });
  } // end of addNewToGallery
}

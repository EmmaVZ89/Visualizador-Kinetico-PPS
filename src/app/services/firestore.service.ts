import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  cosasLindasCollectionReference: any;
  cosasLindas: Observable<any>;

  cosasFeasCollectionReference: any;
  cosasFeas: Observable<any>;

  cosasLindasArray: any = [];
  cosasFeasArray: any = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFirestorage: AngularFireStorage
  ) {
    this.cosasLindasCollectionReference =
      this.angularFirestore.collection<any>('cosasLindas');
    this.cosasLindas = this.cosasLindasCollectionReference.valueChanges({
      idField: 'id',
    });

    this.cosasFeasCollectionReference =
      this.angularFirestore.collection<any>('cosasFeas');
    this.cosasFeas = this.cosasFeasCollectionReference.valueChanges({
      idField: 'id',
    });

    this.getCosasLindas().subscribe((value) => {
      this.cosasLindasArray = value;
    });

    this.getCosasFeas().subscribe((value) => {
      this.cosasFeasArray = value;
    });
  } // end of constructor

  uploadImages(file: string, data: any) {
    return this.angularFirestorage.upload(file, data);
  } // end of uploadImages

  addPhoto(photo: any, type: number) {
    if (type == 1) {
      this.cosasLindasCollectionReference.add({ ...photo });
    } else if (type == 2) {
      this.cosasFeasCollectionReference.add({ ...photo });
    }
  } // end of addPhoto

  updateImage(photo: any, id: any, collection: any) {
    return this.angularFirestore.collection(collection).doc(id).update(photo);
  } // end of updateImage

  referenceFile(file: string) {
    return this.angularFirestorage.ref(file);
  } // end of referenceFile

  getCosasLindas() {
    return this.cosasLindas;
  } // end of getCosasLindas

  getCosasFeas() {
    return this.cosasFeas;
  } // end of getCosasFeas
}

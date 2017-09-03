import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { LatLng } from '@ionic-native/google-maps';

@Component({
  selector: 'alarm-details',
  templateUrl: 'alarm-details.html'
})
export class AlarmDetails {
  address: string;
  position: LatLng;
  alarmName: string = "";
  distance: number = 0;

  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              private toastCtrl: ToastController) {
                this.address = navParams.get('address');
                this.position = navParams.get('position');
              }

  saveAlarm() {
    this.showMessage(this.alarmName+" "+this.distance);
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}

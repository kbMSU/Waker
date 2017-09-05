import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { LatLng } from '@ionic-native/google-maps';
import { Alarm } from '../../models/alarm';
import { AlarmService } from '../../services/alarm.service';

@Component({
  selector: 'alarm-details',
  templateUrl: 'alarm-details.html'
})
export class AlarmDetails {
  address: string;
  position: LatLng;
  alarmName: string = "";
  distance: number = 0;
  canSave: boolean = false;
  isNew: boolean = true;

  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              private toastCtrl: ToastController,
              private alarmService: AlarmService,
              public events: Events) {
                this.address = navParams.get('address');
                this.position = navParams.get('position');
                this.isNew = navParams.get('new');
              }

  saveAlarm() {
    if(this.canSave) {
      var alarm = new Alarm(this.alarmName,this.address,this.position,this.distance,true);
      if(this.alarmService.addAlarm(alarm)) {
        this.showMessage("Saved new alarm");
        this.navCtrl.pop();
      } else {
        this.showMessage("There was an issue saving the alarm");
      }
    }
  }

  onNameInput() {
    this.checkCanSave();
  }

  onRangeChange() {
    this.checkCanSave();
  }

  checkCanSave() {
    if(this.alarmName && this.distance) {
      this.canSave = true;
    } else {
      this.canSave = false;
    }
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}

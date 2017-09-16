import { Component } from '@angular/core';
import { NavController, ToastController, Events } from 'ionic-angular';
import { Alarm } from '../../models/alarm';
import { AlarmService } from '../../services/alarm.service';

@Component({
  selector: 'alarm-list',
  templateUrl: 'alarm-list.html'
})
export class AlarmList {
  alarms: Alarm[];

  constructor(private navCtrl: NavController,
              private alarmService: AlarmService,
              private toastCtrl: ToastController,
              public events: Events) {
                this.alarms = this.alarmService.getAlarms();
              }

  deleteAlarm(alarm: Alarm) {

  }

  updateAlarm(alarm: Alarm) {

  }

  switchAlarmState(alarm: Alarm) {

  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}

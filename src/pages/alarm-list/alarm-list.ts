import { Component } from '@angular/core';
import { NavController, ToastController, Events,
         ActionSheetController, ItemSliding } from 'ionic-angular';
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
              private actionSheetCtrl: ActionSheetController,
              public events: Events) {
                this.alarms = this.alarmService.getAlarms();
              }

  deleteAlarm(alarm: Alarm) {

  }

  updateAlarm(alarm: Alarm) {

  }

  switchAlarmState(alarm: Alarm) {

  }

  closeSlide(slidingItem: ItemSliding) {
    slidingItem.close();
  }

  showActions(alarm: Alarm) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose action for "'+alarm.title+'"',
      buttons: [
        {
          text: 'Update',
          handler: () => {
            console.log('Archive clicked');
          }
        },{
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}

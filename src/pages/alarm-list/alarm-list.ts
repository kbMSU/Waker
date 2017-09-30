import { Component } from '@angular/core';
import { NavController, ToastController, Events,
         ActionSheetController, ItemSliding } from 'ionic-angular';
import { Alarm } from '../../models/alarm';
import { AlarmService } from '../../services/alarm.service';
import { AlarmDetails } from '../alarm-details/alarm-details';

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
    this.alarmService.deleteAlarm(alarm);
  }

  updateAlarm(alarm: Alarm) {
    this.navCtrl.push(AlarmDetails,{
      isNew: false,
      alarm: alarm
    });
  }

  switchAlarmState(alarm: Alarm) {
    this.showMessage("This alarm is :" + alarm.on);
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
          icon: 'hammer',
          handler: () => {
            this.updateAlarm(alarm);
          }
        },{
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteAlarm(alarm);
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            // Do nothing
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

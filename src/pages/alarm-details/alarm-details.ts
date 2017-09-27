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
  alarmId: number;
  oldAlarm: Alarm;

  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              private toastCtrl: ToastController,
              private alarmService: AlarmService,
              public events: Events) {
                this.isNew = navParams.get('isNew');
                if(this.isNew) {
                  this.address = navParams.get('address');
                  this.position = navParams.get('position');
                } else {
                  this.oldAlarm = navParams.get('alarm');
                  
                  this.alarmName = this.oldAlarm.title;
                  this.distance = this.oldAlarm.distance;
                  this.position = this.oldAlarm.position;
                  this.address = this.oldAlarm.address;
                  this.alarmId = this.oldAlarm.id;
                  this.checkCanSave();
                }
              }

  ionViewWillEnter() {
    this.events.subscribe("alarm:created", () => {
      this.showMessage("Added new alarm");
      this.navCtrl.pop();
    });

    this.events.subscribe("alarm:updated", () => {
      this.showMessage("Updated alarm");
      this.navCtrl.pop();
    });

    this.events.subscribe("alarm:error", (error) => {
      this.showMessage("There was an issue saving the alarm");
      //this.showMessage(error);
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe("alarm:created");
    this.events.unsubscribe("alarm:updated");
    this.events.unsubscribe("alarm:error");
  }

  saveAlarm() {
    if(this.canSave) {
      if(this.isNew) {
        // Add new alarm
        var alarm = new Alarm(this.alarmName,this.address,this.position,this.distance,true);
        this.alarmService.addAlarm(alarm);
      } else {
        // Update alarm
        var alarm = new Alarm(this.alarmName,this.address,this.position,this.distance,true);
        alarm.id = this.alarmId;
        this.alarmService.updateAlarm(this.oldAlarm,alarm);
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

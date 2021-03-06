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

  /*
    When entering the view, subscribe to the alarm events
  */
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
    });
  }

  /*
    When leaving the view unsubscribe from the alarm events
  */
  ionViewWillLeave() {
    this.events.unsubscribe("alarm:created");
    this.events.unsubscribe("alarm:updated");
    this.events.unsubscribe("alarm:error");
  }

  /*
    Save the alarm. Create it or Update it.
  */
  saveAlarm() {
    // Can we save it ?
    if(this.canSave) {
      // Does this name already exist
      if(this.alarmService.doesNameExist(this.alarmName)) {
        // Is this an update and we are just keeping the name ?
        if(!this.isNew && this.oldAlarm.title === this.alarmName) {
          // If the name is the same but it is just an update of an existing alarm
          // then it is fine
        } else {
          // Cant update the name of an alarm to the same name of another alarm
          this.showMessage("Another alarm already has the same name !")
          return;
        }
      }

      var alarm = new Alarm(this.alarmName,this.address,this.position,this.distance,true);
      if(this.isNew) {
        // Add new alarm
        this.alarmService.addAlarm(alarm);
      } else {
        // Update alarm
        alarm.id = this.alarmId;
        this.alarmService.updateAlarm(this.oldAlarm,alarm);
      }
    }
  }

  /*
    When the name input is changed
  */
  onNameInput() {
    this.checkCanSave();
  }

  /*
    When the range input is changed
  */
  onRangeChange() {
    this.checkCanSave();
  }

  /*
    Can only save if the alarm name and distance have been entered
  */
  checkCanSave() {
    if(this.alarmName && this.distance) {
      this.canSave = true;
    } else {
      this.canSave = false;
    }
  }

  /*
    Show a toast message
  */
  showMessage(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    }).present();
  }
}

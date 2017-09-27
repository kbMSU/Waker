import { Injectable } from '@angular/core';
import { Alarm } from '../models/alarm';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';


@Injectable()
export class AlarmService {
  private newId: number = 0;
  private alarms: Alarm[];
  private updateAvailable: boolean;

  constructor(private storage: Storage,
              public events: Events) {}

  loadAlarms() {
    this.alarms = [];
    // Get all alarms
    this.storage.get('alarms').then((val: Alarm[]) => {
      this.alarms = val;
      // Update the next id to save as
      this.newId = this.alarms.length;
      // Publish that alarms have been updated
      this.events.publish("alarm:loaded");
    })
    //this.storage.clear();
    //this.events.publish("alarm:loaded");
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  getAlarms(): Alarm[] {
    return this.alarms;
  }

  doesNameExist(name: string): boolean {
    for(let alarm of this.alarms) {
      if(alarm.title === name) {
        return true;
      }
    }

    return false;
  }

  addAlarm(alarm: Alarm) {
    // Save in memory
    alarm.id = this.newId;
    this.alarms.push(alarm);
    // Increment next alarm id
    this.newId += 1;
    // Mark that an update is available
    this.updateAvailable = true;

    // Persist on device
    this.storage.set('alarms',this.alarms).then((val) => {
      this.events.publish('alarm:created');
    }).catch((error) => {
      this.events.publish("alarm:error",error);
    });
  }

  updateAlarm(oldAlarm: Alarm, newAlarm: Alarm) {
    // Save in memory
    var index = this.alarms.indexOf(oldAlarm);
    this.alarms[index] = newAlarm;
    // Mark that an update is available
    this.updateAvailable = true;

    // Persist on device
    this.storage.set('alarms',this.alarms).then((val) => {
      this.events.publish('alarm:updated');
    }).catch((error) => {
      this.events.publish("alarm:error",error);
    });
  }

  deleteAlarm(alarm: Alarm) {
    // Save in memory
    var index = this.alarms.indexOf(alarm);
    this.alarms.splice(index,1);
    // Mark that an update is available
    this.updateAvailable = true;

    // Persist on device
    this.storage.set('alarms',this.alarms).then((val) => {
      this.events.publish('alarm:deleted');
    }).catch((error) => {
      this.events.publish("alarm:error",error);
    });
  }
}

import { Injectable } from '@angular/core';
import { Alarm } from '../models/alarm';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';


@Injectable()
export class AlarmService {
  private newId: number = 0;
  private alarms: Alarm[];

  constructor(private storage: Storage,
              public events: Events) {}

  loadAlarms() {
    this.alarms = [];
    // Get all keys stored
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

  getAlarms(): Alarm[] {
    return this.alarms;
  }

  addAlarm(alarm: Alarm) {
    // Save in memory
    alarm.id = this.newId;
    this.alarms.push(alarm);
    // Increment next alarm id
    this.newId += 1;

    // Persist on device
    this.storage.set('alarms',this.alarms).then((val) => {
      this.events.publish('alarm:created');
    }).catch((error) => {
      this.events.publish("alarm:error",error);
    });
  }

  updateAlarm(alarm: Alarm): boolean {
    this.storage.set(alarm.id.toString(), alarm).then((val) => {
      var index = this.alarms.indexOf(alarm);
      this.alarms[index] = alarm;
      this.events.publish("alarm:updated");
      return true;
    });

    return false;
  }

  deleteAlarm(alarm: Alarm): boolean {
    this.storage.remove(alarm.id.toString()).then((val) => {
      var index = this.alarms.indexOf(alarm);
      this.alarms.splice(index,1);
      this.events.publish("alarm:deleted");
      return true;
    });

    return false;
  }
}

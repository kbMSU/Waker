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
    this.alarms = new Array<Alarm>();
    // Get all keys stored
    this.storage.keys().then((keys: string[]) => {
      for(let key of keys) {
        // Get the alarm for each key
        this.storage.get(key).then((alarm: Alarm) => {
          this.alarms.push(alarm);
        });
      }
    });
    // Update the next id to save as
    this.newId = this.alarms.length;
  }

  getAlarms(): Alarm[] {
    return this.alarms;
  }

  addAlarm(alarm: Alarm): boolean {
    alarm.id = this.newId;

    this.storage.set(this.newId.toString(),alarm).then((val) => {
      this.alarms.push(alarm);
      this.events.publish('alarm:changed');
      return true;
    });

    return false
  }

  updateAlarm(alarm: Alarm): boolean {
    this.storage.set(alarm.id.toString(), alarm).then((val) => {
      var index = this.alarms.indexOf(alarm);
      this.alarms[index] = alarm;
      this.events.publish('alarm:changed');
      return true;
    });

    return false;
  }

  deleteAlarm(alarm: Alarm): boolean {
    this.storage.remove(alarm.id.toString()).then((val) => {
      var index = this.alarms.indexOf(alarm);
      this.alarms.splice(index,1);
      this.events.publish('alarm:changed');
      return true;
    });

    return false;
  }
}

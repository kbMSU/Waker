import { Injectable } from '@angular/core';
import { Alarm } from '../models/alarm';

@Injectable()
export class AlarmService {
  loadAlarms() {

  }

  getAlarms(): Promise<Alarm[]> {
    var alarms: Promise<Alarm[]>

    return alarms;
  }

  addAlarm(alarm: Alarm) {

  }

  updateAlarm(alarm: Alarm) {

  }

  deleteAlarm(alarm: Alarm) {
    
  }
}

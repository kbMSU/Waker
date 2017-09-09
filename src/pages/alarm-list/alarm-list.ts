import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Alarm } from '../../models/alarm';
import { AlarmService } from '../../services/alarm.service';
import { Events } from 'ionic-angular';

@Component({
  selector: 'alarm-list',
  templateUrl: 'alarm-list.html'
})
export class AlarmList {
  alarms: Alarm[];

  constructor(private navCtrl: NavController,
              private alarmService: AlarmService,
              public events: Events)
              {
                // Set up a subscription to get future alarms
                events.subscribe("alarm:changed", () => {
                  this.refreshAlarms();
                });

                // Get existing alarms
                this.refreshAlarms();
              }

  refreshAlarms() {
    this.alarms = this.alarmService.getAlarms();
  }
}

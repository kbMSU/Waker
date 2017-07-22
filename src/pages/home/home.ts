import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlarmMap } from '../map/map';
import { AlarmList } from '../alarm-list/alarm-list';
import { Settings } from '../settings/settings';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  mapTab: any;
  listTab: any;
  settingsTab: any;

  constructor(public navCtrl: NavController) {
    this.mapTab = AlarmMap;
    this.listTab = AlarmList;
    this.settingsTab = Settings;
  }

}

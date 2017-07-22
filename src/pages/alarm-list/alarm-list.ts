import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'alarm-list',
  templateUrl: 'alarm-list.html'
})
export class AlarmList {
  constructor(private navCtrl: NavController) {}
}

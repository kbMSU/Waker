import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'alarm-details',
  templateUrl: 'alarm-details.html'
})
export class AlarmDetails {
  constructor(private navParams: NavParams,
              private navCtrl: NavController) {}
}

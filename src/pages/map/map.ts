import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GoogleMaps, GoogleMap } from '@ionic-native/google-maps';

@Component({
  selector: 'alarm-map',
  templateUrl: 'map.html',
})
export class AlarmMap {
  constructor(private navCtrl: NavController,
              private googleMaps: GoogleMaps) {}

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap(): void {
    let element: HTMLElement = document.getElementById('map');
    let map: GoogleMap = this.googleMaps.create(element);
  }
}

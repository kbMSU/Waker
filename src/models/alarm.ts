import { LatLng } from '@ionic-native/google-maps';

export class Alarm {
  // The id of the alarm
  id: number;
  // The name of the alarm
  title: string;
  // The address of the alarm
  address: string;
  // The location of the alarm
  position: LatLng;
  // The distance from the location when the alarm should start ringing
  distance: number;
  // Is the alarm on or off
  on: boolean;

  constructor(title: string, address: string, position: LatLng, distance: number, on: boolean) {
    this.title = title;
    this.address = address;
    this.position = position;
    this.distance = distance;
    this.on = on;
  }
}

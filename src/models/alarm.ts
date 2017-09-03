import { LatLng } from '@ionic-native/google-maps';

export class Alarm {
  // The name of the alarm
  title: string;
  // The address of the alarm
  address: string;
  // The location of the alarm
  position: LatLng;
  // The distance from the location when the alarm should start ringing
  distance: number;
  // Is the alarm on or off
  status: boolean;
}

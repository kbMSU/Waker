import { Marker } from '@ionic-native/google-maps';
import { Alarm } from './alarm';

export class AlarmMarker {
  alarm: Alarm;
  marker: Marker;

  constructor(alarm: Alarm, marker: Marker) {
    this.alarm = alarm;
    this.marker = marker;
  }
}

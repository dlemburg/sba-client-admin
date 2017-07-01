import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams } from 'ionic-angular';
import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 CameraPosition,
 MarkerOptions,
 Marker
} from '@ionic-native/google-maps';
import { AppStorage } from '../../global/app-storage';


@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  currentLocation: {coordsLat: number, coordsLong: number}
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public platform: Platform,
    public googleMaps: GoogleMaps) {
  }

  ionViewDidLoad() {
    this.currentLocation = this.navParams.data.currentLocation;
  }

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.loadMap();
    });
  }

  ionViewDidLeave() {
    AppStorage.setLatAndLong(this.currentLocation);
  }

  loadMap() {
    let element: HTMLElement = document.getElementById('map');
    let map: GoogleMap = this.googleMaps.create(element);

   // const isAvailable = this.googleMaps.isAvailable();
    map.one(GoogleMapsEvent.MAP_READY).then(() => {
        console.log('Map is ready!');
         
        let initialZoomLatAndLong: LatLng = new LatLng(this.currentLocation.coordsLat, this.currentLocation.coordsLong);
        let position: CameraPosition = {
          target: initialZoomLatAndLong,
          zoom: 18,
          tilt: 30
        };
        map.moveCamera(position);


        let locationLatAndLong: LatLng = new LatLng(this.currentLocation.coordsLat, this.currentLocation.coordsLong);

        let markerOptions: MarkerOptions = {
          position: locationLatAndLong,
          title: "Drag this pin to the location."
        };

        map.addMarker(markerOptions).then((marker: Marker) => {
          console.log("marker: ", marker);
          marker.showInfoWindow();
          marker.addEventListener(GoogleMapsEvent.MARKER_DRAG_END).subscribe((data) => {
            marker.getPosition().then((latAndLong: LatLng) => {
                this.currentLocation.coordsLat = latAndLong.lat;
                this.currentLocation.coordsLong = latAndLong.lng;

                //marker.setTitle(latLng.toUrlValue());
                //marker.showInfoWindow();
            });
          });
        });
      });
  }

}

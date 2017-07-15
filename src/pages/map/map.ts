import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
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
  currentLocation: {coordsLat: number, coordsLong: number};
  element: HTMLElement;
  map: GoogleMap;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public platform: Platform,
    public loadingCtrl: LoadingController,
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
   // AppStorage.setLatAndLong(this.currentLocation);
  }

  submit() {
    AppStorage.setLatAndLong(this.currentLocation);
    this.navCtrl.pop();
  }

  loadMap() {
   // const isAvailable = this.googleMaps.isAvailable();
    this.element = document.getElementById('map');
    this.map = this.googleMaps.create(this.element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {

        console.log('Map is ready!');
         
        let initialZoomLatAndLong: LatLng = new LatLng(this.currentLocation.coordsLat, this.currentLocation.coordsLong);
        let position: CameraPosition = {
          target: initialZoomLatAndLong,
          zoom: 18,
          tilt: 30
        };
        this.map.moveCamera(position);


       // let locationLatAndLong: LatLng = new LatLng(this.currentLocation.coordsLat, this.currentLocation.coordsLong);

        this.map.addEventListener(GoogleMapsEvent.MAP_CLICK).subscribe((data) => {
          console.log('CLICK: ', data);
          this.addMarker(data);
        });
      });
  }

  addMarker(data: any) {
    this.currentLocation = {coordsLat: data.lat, coordsLong: data.lng};

    let markerOptions: MarkerOptions = {
      position: new LatLng(data.lat, data.lng),
      //title: "Are you sure?"
    };

    this.map.clear();
    this.map.addMarker(markerOptions).then((marker: Marker) => {
      console.log("marker: ", marker);
      marker.showInfoWindow();

      /* marker event listener   (not needed yet)

      marker.addEventListener(GoogleMapsEvent.MARKER_DRAG_END).subscribe((data) => {
        console.log("DRAG END: ", data);
        marker.getPosition().then((latAndLong: LatLng) => {
            this.currentLocation.coordsLat = latAndLong.lat;
            this.currentLocation.coordsLong = latAndLong.lng;

            //marker.setTitle(latLng.toUrlValue());
            //marker.showInfoWindow();
        });
      });
      */
    });
  }



}

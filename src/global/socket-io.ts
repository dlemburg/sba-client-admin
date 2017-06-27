import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'
import * as global from './global';
import * as io from "socket.io-client";
import { Authentication } from './authentication';
import { AuthUserInfo, SocketEvents}  from '../models/models';
import { NativeNotifications } from './native-notifications';

@Injectable()
export class SocketIO {
  private socket: SocketIOClient.Socket = null;
  private auth: AuthUserInfo;
  public socketEvents: SocketEvents;

  constructor(public authentication: Authentication, public events: Events, public nativeNotifications: NativeNotifications ) {
    this.auth = this.authentication.getCurrentUser();
    this.socketEvents = {
        subscribe: "subscribe",
        unsubscribe: "unsubscribe",
        userPlacedNewOrder: "user-placed-new-order",
        incomingNewOrder: "incoming-new-order",
        alertUserProcessingOrder: "alert-user-processing-order",
        locationIsProcessingOrder: "location-is-processing-order"
    }
   
 }

/*
 NOTE:  connects on app-start-up

*/
    public connect(room = null) {
        if (!this.socket) {
            this.socket = io.connect(global.SERVER_URL_NODE, { reconnection: true });
            if (room) this.emit(this.socketEvents.subscribe, { room });

            // set listeners
            this.on(this.socketEvents.incomingNewOrder, [
                this.nativeNotifications.types.vibrate, this.nativeNotifications.types.localNotifications, this.nativeNotifications.types.sound
            ]);


            /* subscriber pattern
            this.subscriber$ = this.on(this.events.incomingNewOrder).subscribe((data) => {
                // cordova sound, vibrate
            });
            */
        }
    }

    public disconnect() {
        const room = this.auth.companyOid + this.auth.locationOid;

        if (this.socket) {
            this.emit(this.socketEvents.unsubscribe, {room});
            this.socket.removeAllListeners();
            this.socket.disconnect();
        }
    }

    public on(socketEvent: string, notifications = []) {
        this.socket.on(socketEvent, (data) => {
            /////////////////////   cordova:  vibrate, sound, local notification ///////////////////////////
            notifications.forEach((x) => {
               let notify = this.nativeNotifications.create(x)();

            });
            this.publishToClientListeners(socketEvent, data);
        });
    }

    public emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }

    public publishToClientListeners(event: string, data) {
        this.events.publish(event, data);
    }
}
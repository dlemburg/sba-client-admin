import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'
import * as global from './global';
import * as io from "socket.io-client";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Authentication } from './authentication.service';
import { AuthUserInfo, SocketEvents}  from '../models/models';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket = null;
  private auth: AuthUserInfo;
  private currentObservables: any;
  public socketEvents: SocketEvents;
  private subscriber$: any;

  constructor(public authentication: Authentication, public events: Events) {
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
            this.on(this.socketEvents.incomingNewOrder);


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

    public on(socketEvent: string) {
        this.socket.on(socketEvent, (data) => {
            /////////////////////   cordova:  vibrate, sound, local notification ///////////////////////////
            this.publish(socketEvent, data);
        });
    }

    public emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }

    public publish(event: string, data) {
        this.events.publish(event, data);
    }
}
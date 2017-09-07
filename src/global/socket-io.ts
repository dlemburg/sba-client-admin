import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'
import { SERVER_URL_CSHARP, SERVER_URL_NODE } from './global';
import * as io from "socket.io-client";
import { Authentication } from './authentication';
import { AuthUserInfo, SocketEvents, NativeNotificationStaging }  from '../models/models';
import { NativeNotifications } from './native-notifications';

@Injectable()
export class SocketIO {
  private socket: SocketIOClient.Socket = null;
  private auth: AuthUserInfo;
  public socketEvents: SocketEvents;
  public socketOpts: any;

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
    this.socketOpts =  { reconnection: true, reconnectionAttempts: 10};
  }

  /* subscriber pattern for ng2 apps w/o ionic events
    this.subscriber$ = this.on(this.events.incomingNewOrder).subscribe((data) => {
        // cordova sound, vibrate
    });
  */

    /* @room: room to connect to on server */
    public connect(): SocketIO {
        console.log("this.socket: ", this.socket);
        if (!this.socket) {
            console.log("connecting...");
            this.socket = io.connect(SERVER_URL_NODE, this.socketOpts);
        }
        return this;
    }

    public subscribe(room: string): SocketIO {
        if (room) this.emit(this.socketEvents.subscribe, { room });
        console.log("subscribing...");

        return this;

    }

    public unsubscribe(room): SocketIO {
        if (room) this.emit(this.socketEvents.unsubscribe, { room })
        return this;
    }

    public disconnect() {
        const room = (this.auth.companyOid + this.auth.locationOid).toString();

        console.log("disconnecting...");
        if (this.socket) {
            this.emit(this.socketEvents.unsubscribe, {room});
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /*
    @socketEvent:  the type of socket event emitted to the server
    @notifications: the types of native notifications that will be triggered
    */
    public on(socketEvent: string, notifications: Array<NativeNotificationStaging> = []) {
        if (this.socket) {
            console.log("setting on listeners...");
            this.socket.on(socketEvent, (data) => {
                notifications.forEach((x) => {
                // 2nd fn invokation (closure) allows params specific to that notification
                let notify = this.nativeNotifications.create(x.type)(x.opts);
                });

                this.publishEventToClientListeners(socketEvent, data);
            });

            console.log( "listeners", this.socket.listeners(socketEvent));
        }
    }

    public emit(eventName: string, data: any) {
        if (this.socket) {
            console.log("socket io emitting: ", eventName, data);
            this.socket.emit(eventName, data);
        }
    }

    public publishEventToClientListeners(event: string, data) {
        console.log("publishing event...");
        this.events.publish(event, data);
    }
}
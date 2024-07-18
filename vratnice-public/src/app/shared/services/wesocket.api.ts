import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { IWebsocketMessageReceive } from '../interfaces/websocket-message-receive.interface';

@Injectable({
  providedIn: 'root'
})
export class WebSocketAPI {
  private readonly webSocketEndPoint: string = './api/wsapi';
  //private readonly topic: string = "/topic/";
  //private webScoketApplicationId?: string;
  private stompClient?: Stomp.Client;

  constructor(
  ) {
  }

  private connect(destination: string, messageReceiveComponent: any) {
    this.connectAndReconnect(this.successCallbackImpl, destination, messageReceiveComponent);
  }

  disconnectAndConnect(destination: string, messageReceiveComponent: any) {
    var _this = this;
    if (this.stompClient && this.stompClient?.connected) {
      this.stompClient?.disconnect(() => {
        //console.log("Disconnected");
        _this.connect(destination, messageReceiveComponent);
      });
    } else {
      this.connect(destination, messageReceiveComponent);
    }
  }

  // private socketCloseListener = (event:any) => {
  //   console.log("socketCloseListener", event.data);
  // };

  private connectAndReconnect(successCallback: any, destination: string, messageReceiveComponent: any) {
    if (this.stompClient && this.stompClient?.connected) return;
    const _this = this;
    // if (!this.stompClient){
    let ws = new SockJS(this.webSocketEndPoint);
    //console.log("ws", ws);

    this.stompClient = Stomp.over(ws);
    //this.stompClient.heartbeat.outgoing = 1000;
    //this.stompClient.heartbeat.incoming = 1000;
    //this.stompClient.ws.removeEventListener('close', this.socketCloseListener);
    //this.stompClient.ws.addEventListener('close', this.socketCloseListener);

    // }
    //    var a: Stomp.Subscription = this.stompClient.Stomp.Subscription
    (this.stompClient as any).debug = null;
    this.stompClient.connect({}, (frame: any) => {
      //console.log("frame", frame);
      setTimeout(function () {
        successCallback(_this, destination, messageReceiveComponent);
      }, 500);
    }, (error) => {
      //console.log("error",error);
      setTimeout(() => {
        this.connectAndReconnect(successCallback, destination, messageReceiveComponent);
      }, 5000);
    });
  }

  private successCallbackImpl(_this: WebSocketAPI, destination: string, messageReceiveComponent: any) {
    //var a: Stomp.Subscription = _this?.stompClient?.subscribe(_this.topic + idProfilu, function (sdkEvent: any) {
    //_this?.stompClient?.subscribe(_this.topic + _this.webScoketApplicationId + "/" + idProfilu, function (sdkEvent: any) {
    _this?.stompClient?.subscribe(destination, function (sdkEvent: any) {
      //console.log(sdkEvent);
      _this.onMessageReceived(sdkEvent, messageReceiveComponent);
    });
    //console.log(a);
    //a.unsubscribe();
  }

  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient?.disconnect(() => {
        //console.log("Disconnected");
      });
    }
  }

  addSubscribe(destination: string, messageReceiveComponent: IWebsocketMessageReceive) {
    let _this = this;
    var stompSubscription: Stomp.Subscription | undefined;
    if (_this.stompClient) {
      //stompSubscription = _this.stompClient.subscribe(_this.topic + _this.webScoketApplicationId + "/" + idProfilu, function (sdkEvent: any) {
      stompSubscription = _this.stompClient.subscribe(destination, function (sdkEvent: any) {
        //console.log(sdkEvent);
        _this.onMessageReceived(sdkEvent, messageReceiveComponent);
      });
    }
    return stompSubscription;
  }

  // /**
  //  * Send message to sever via web socket
  //  * @param {*} message
  //  */
  // _send(message: any) {
  //   console.log("calling logout api via web socket");
  //   this.stompClient?.send("/hello", {}, JSON.stringify(message));
  // }

  private onMessageReceived(message: any, messageReceiveComponent: IWebsocketMessageReceive) {
    //console.log("Message Recieved from Server :: " + message);
    //messageReceiveComponent.aktualizaceOznameni(messageReceiveComponent, JSON.parse(message.body));
    messageReceiveComponent.aktualizaceOznameni(messageReceiveComponent);
    //this.examplePage?.handleMessage(JSON.stringify(message.body));
  }
}

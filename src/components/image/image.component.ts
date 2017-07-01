import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'Image',
  templateUrl: './image.component.html',
 // styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {
 @Input() imgSrc: string;
 @Input() header: string;
 @Output() getImgCordova: EventEmitter<any> = new EventEmitter();
 
 constructor() { }

  ngOnInit() {}

  onGetImgCordova() {
    this.getImgCordova.emit()
  }

}
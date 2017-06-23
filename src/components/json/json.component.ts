import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'MyJson',
  templateUrl: './json.component.html',
})
export class MyJsonComponent implements OnInit {
  @Input() data;
  constructor() { }

  ngOnInit() {
  }

}
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ProductDetails',
  templateUrl: './product-details.component.html',
  //styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  @Input() list: any;
  constructor() { }

  ngOnInit() {
  }

}
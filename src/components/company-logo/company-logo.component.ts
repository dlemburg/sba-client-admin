import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'CompanyLogo',
  templateUrl: './company-logo.component.html',
  //styleUrls: ['./company-logo.component.scss']
})
export class CompanyLogoComponent implements OnInit {
  @Input() logo: string; 

  constructor() { }

  ngOnInit() {

  }

}
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements AfterViewInit {
  @ViewChild('imageCanvas', { static: true }) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;
  drawing = false;

  selectedColor = '#9e2956';
  colors = ['#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459ced', '#4250ad', '#802fa3']
  lineWidth = 5;

  constructor(
    private plt: Platform
  ) { }

  ngAfterViewInit(): void {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  startDrawing(ev: any) {
    this.drawing = true;
    const canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pagey - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  moved(ev: any) {
    if (ev.type === 'mousemove') {
      if (!this.drawing) return;
      const canvasPosition = this.canvasElement.getBoundingClientRect();
      let ctx = this.canvasElement.getContext('2d');
      let currentX = ev.pageX - canvasPosition.x;
      let currentY = ev.pageY - canvasPosition.y;

      ctx.linejoin = 'round';
      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.lineWidth;

      ctx.beginPath();
      ctx.moveTo(this.saveX, this.saveY);
      ctx.lineTo(currentX, currentY);
      ctx.closePath();
      ctx.stroke();

      this.saveX = currentX;
      this.saveY = currentY;
    } else {
      //touchmove
      const canvasPosition = this.canvasElement.getBoundingClientRect();
      let ctx = this.canvasElement.getContext('2d');
      let currentX = ev.changedTouches[0].pageX - canvasPosition.x;
      let currentY = ev.changedTouches[0].pageY - canvasPosition.y;

      ctx.linejoin = 'round';
      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = this.lineWidth;

      ctx.beginPath();
      ctx.moveTo(this.saveX, this.saveY);
      ctx.lineTo(currentX, currentY);
      ctx.closePath();
      ctx.stroke();

      this.saveX = currentX;
      this.saveY = currentY;
    }
  }

  setBackground() {
    let background = new Image();
    background.src = './assets/icon/favicon.png';
    let ctx = this.canvasElement.getContext('2d');

    background.onload = () => {
      //primeiro 0 -> margin left
      //segundo 0 -> margin top

      ctx.drawImage(background, 0, 0, this.canvasElement.width, this.canvasElement.height)
    }
  }

  exportCanvasImage() {
    const dataUrl = this.canvasElement.toDataURL();
    console.log('image: ', dataUrl)
  }

  clear() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const width = canvasEl.width;
    const height = canvasEl.height;

    const context = canvasEl.getContext('2d');
    context.clearRect(0, 0, width, height);
  }

}

import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { FileSystemImageService } from 'src/services/file-system-image.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements AfterViewInit {
  @ViewChild('resizableElement', { static: true }) resizableElement: ElementRef;

  @ViewChild('imageCanvas', { static: true }) canvas: any;
  canvasElement: any;

  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private startX: number;
  private startY: number;

  backgroundImage: string = ''
  imageSaved: string

  canDraw: boolean = true

  buttons = [
    {
      id: 1,
      name: 'Desenhar',
      icon: 'brush',
    },
    {
      id: 2,
      name: 'Imagem',
      icon: 'image',
    }
  ]
  buttonSelected: { id: number, name: string, icon: string } = this.buttons[0]

  saveX: number;
  saveY: number;
  drawing = false;

  selectedColor = '#9e2956';
  colors = ['#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459ced', '#4250ad', '#802fa3']
  lineWidth = 5;

  constructor(
    private fileSystemImageService: FileSystemImageService,

    private alertController: AlertController,
    private renderer: Renderer2,
    private plt: Platform
  ) { }

  ngAfterViewInit(): void {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;

    this.selectFunction(this.buttons[0])
  }

  selectFunction(button: { id: number, name: string, icon: string }) {
    this.buttonSelected = button;
    if (button.id === 1) {
      this.startDraw()
    }
    if (button.id === 2) {
      this.startImage()
    }
  }

  //draw
  startDraw() {
    this.canDraw = true
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  startDrawing(ev: any) {
    if (this.canDraw) {

      this.drawing = true;
      const canvasPosition = this.canvasElement.getBoundingClientRect();

      this.saveX = ev.pageX - canvasPosition.x;
      this.saveY = ev.pagey - canvasPosition.y;
    }
  }

  endDrawing() {
    this.drawing = false;
  }

  moved(ev: any) {
    if (this.canDraw) {
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

  }

  clear() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const width = canvasEl.width;
    const height = canvasEl.height;

    const context = canvasEl.getContext('2d');
    context.clearRect(0, 0, width, height);
  }

  //image
  async startImage() {
    this.canDraw = false
    //this.setBackground();
    const alert = await this.alertController.create({
      header: 'Selecione uma imagem',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.fileSystemImageService.getPhoto(1).then((res: any) => {
              this.backgroundImage = res.webviewPath
            })
          }
        },
        {
          text: 'Galeria',
          handler: () => {
            this.fileSystemImageService.getPhoto(0).then((res: any) => {
              this.backgroundImage = res.webviewPath
            })
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.selectFunction(this.buttons[0])
          }
        },
      ],
    });

    await alert.present();
  }

  onMouseDown(event: MouseEvent): void {
    this.startDragging(event.clientX, event.clientY);
  }

  onTouchStart(event: TouchEvent): void {
    if (event.type === 'touchstart') {
      const touch = event.touches[0];
      this.startDragging(touch.clientX, touch.clientY);
    }
  }

  private startDragging(startX: number, startY: number): void {
    this.isDragging = true;

    this.startX = startX - this.resizableElement.nativeElement.offsetLeft;
    this.startY = startY - this.resizableElement.nativeElement.offsetTop;

    this.renderer.addClass(document.body, 'no-select'); // Evita seleção de texto enquanto arrasta

    this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
    this.renderer.listen('document', 'touchmove', this.onTouchMove.bind(this));
    this.renderer.listen('document', 'mouseup', this.onMouseUp.bind(this));
    this.renderer.listen('document', 'touchend', this.onTouchEnd.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const x = event.clientX - this.startX;
    const y = event.clientY - this.startY;

    this.setPosition(x, y);
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;

    const touch = event.touches[0];
    const x = touch.clientX - this.startX;
    const y = touch.clientY - this.startY;

    this.setPosition(x, y);
  }

  private setPosition(x: number, y: number): void {
    this.renderer.setStyle(this.resizableElement.nativeElement, 'left', `${x}px`);
    this.renderer.setStyle(this.resizableElement.nativeElement, 'top', `${y}px`);
  }

  private onMouseUp(): void {
    this.stopDragging();
  }

  private onTouchEnd(): void {
    this.stopDragging();
  }

  private stopDragging(): void {
    this.isDragging = false;
    this.renderer.removeClass(document.body, 'no-select');
  }

  //redimencionar
  onResizeMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    this.startResizing(event.clientX, event.clientY);
  }

  onResizeTounched(event) {
    this.isDragging = false;
    const touch = event.touches[0];
    this.startResizing(touch.clientX, touch.clientY, true);
  }

  private startResizing(startX: number, startY: number, isTouch?: boolean): void {
    this.isDragging = false;
    this.isResizing = true;
    this.startX = startX;
    this.startY = startY;

    this.renderer.addClass(document.body, 'no-select');

    if (!isTouch) {
      this.renderer.listen('document', 'mousemove', this.onResizeMouseMove.bind(this));
      this.renderer.listen('document', 'mouseup', this.onResizeMouseUp.bind(this));
    } else {
      this.renderer.listen('document', 'touchmove', this.onTouchMouseMove.bind(this));
      this.renderer.listen('document', 'touchend', this.onResizeMouseUp.bind(this));
    }
  }

  private onResizeMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const currentWidth = this.resizableElement.nativeElement.offsetWidth;
    const currentHeight = this.resizableElement.nativeElement.offsetHeight;

    this.renderer.setStyle(this.resizableElement.nativeElement, 'width', `${currentWidth + deltaX}px`);
    this.renderer.setStyle(this.resizableElement.nativeElement, 'height', `${currentHeight + deltaY}px`);

    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  private onResizeMouseUp(): void {
    this.stopResizing();
  }

  private stopResizing(): void {
    this.isResizing = false;
    this.renderer.removeClass(document.body, 'no-select');
  }

  private onTouchMouseMove(event): void {
    if (!this.isResizing) return;
    this.isDragging = false
    const touch = event.touches[0];

    const deltaX = touch.pageX - this.startX;
    const deltaY = touch.pageY - this.startY;

    const currentWidth = this.resizableElement.nativeElement.offsetWidth;
    const currentHeight = this.resizableElement.nativeElement.offsetHeight;

    this.renderer.setStyle(this.resizableElement.nativeElement, 'width', `${currentWidth + deltaX}px`);
    this.renderer.setStyle(this.resizableElement.nativeElement, 'height', `${currentHeight + deltaY}px`);

    this.startX = touch.pageX;
    this.startY = touch.pageY;
  }

  setImageOnCanvas() {
    const step1X = this.resizableElement.nativeElement.offsetLeft * this.canvasElement.width
    const screenWidthX = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const resultX = step1X / screenWidthX

    const step1Y = this.resizableElement.nativeElement.offsetTop * this.canvasElement.height
    const screenWidthY = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const resultY = step1Y / screenWidthY

    let background = new Image();
    background.src = this.backgroundImage;
    let ctx = this.canvasElement.getContext('2d');

    background.onload = () => {
      ctx.drawImage(background, resultX, resultY, this.resizableElement.nativeElement.offsetWidth, this.resizableElement.nativeElement.offsetHeight / 2)
    }

    setTimeout(() => {
      this.backgroundImage = undefined;
      this.buttonSelected = this.buttons[0]
      this.startDraw()
    }, 100)
  }

  cancelImage() {
    this.backgroundImage = undefined;
    this.buttonSelected = this.buttons[0]
    this.startDraw()
  }

  exportCanvasImage() {
    const dataUrl = this.canvasElement.toDataURL();
    this.fileSystemImageService.getPhoto(2, dataUrl).then((res: any) => {
      this.imageSaved = res.webviewPath
    })
  }
}

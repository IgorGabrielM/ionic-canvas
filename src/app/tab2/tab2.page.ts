import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FileSystemImageService } from 'src/services/file-system-image.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild('resizableElement', { static: true }) resizableElement: ElementRef;

  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private startX: number;
  private startY: number;

  backgroundImage: string = ''

  constructor(
    private fileSystemImageService: FileSystemImageService,
    private renderer: Renderer2
  ) { }

  setBackground() {
    this.fileSystemImageService.getPhoto(0).then((res: any) => {
      this.backgroundImage = res.webviewPath
    })
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
    //console.log(this.resizableElement.nativeElement.style.top)
    //console.log(this.resizableElement.nativeElement.style.bottom)
    //console.log(this.resizableElement.nativeElement.style.right)
    //console.log(this.resizableElement.nativeElement.style.left)
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
}

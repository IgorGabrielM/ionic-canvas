import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  @ViewChild('resizableElement', { static: true }) resizableElement: ElementRef;

  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private startX: number;
  private startY: number;

  constructor(private renderer: Renderer2) { }

  onMouseDown(event: MouseEvent): void {
    this.startDragging(event.clientX, event.clientY);
  }

  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startDragging(touch.clientX, touch.clientY);
  }

  onResizeMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    this.startResizing(event.clientX, event.clientY);
  }

  private startDragging(startX: number, startY: number): void {
    this.isDragging = true;
    this.startX = startX - this.resizableElement.nativeElement.offsetLeft;
    this.startY = startY - this.resizableElement.nativeElement.offsetTop;

    this.renderer.addClass(document.body, 'no-select');

    this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
    this.renderer.listen('document', 'mouseup', this.onMouseUp.bind(this));
  }

  private startResizing(startX: number, startY: number): void {
    this.isResizing = true;
    this.startX = startX;
    this.startY = startY;

    this.renderer.addClass(document.body, 'no-select');

    this.renderer.listen('document', 'mousemove', this.onResizeMouseMove.bind(this));
    this.renderer.listen('document', 'mouseup', this.onResizeMouseUp.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const x = event.clientX - this.startX;
    const y = event.clientY - this.startY;

    this.setPosition(x, y);
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

  private setPosition(x: number, y: number): void {
    this.renderer.setStyle(this.resizableElement.nativeElement, 'left', `${x}px`);
    this.renderer.setStyle(this.resizableElement.nativeElement, 'top', `${y}px`);
  }

  private onMouseUp(): void {
    this.stopDragging();
  }

  private onResizeMouseUp(): void {
    this.stopResizing();
  }

  private stopDragging(): void {
    this.isDragging = false;
    this.renderer.removeClass(document.body, 'no-select');

    //this.renderer.removeListen('document', 'mousemove');
    //this.renderer.removeListen('document', 'mouseup');
  }

  private stopResizing(): void {
    this.isResizing = false;
    this.renderer.removeClass(document.body, 'no-select');

    //this.renderer.removeListen('document', 'mousemove');
    //this.renderer.removeListen('document', 'mouseup');
  }
}

import { Component, Input, Output, EventEmitter, HostListener, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ImageDTO {
    orderID: number;
    fileName: string;
    File: File;
    url: string;
    descrip: string;
    userID: number;
    created: Date;
}

@Component({
    selector: 'app-image-viewer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './image-viewer.component.html',
    styleUrl: './image-viewer.component.css',
})
export class ImageViewerComponent implements OnChanges {
    @Input() images: ImageDTO[] = [];
    @Input() selectedIndex: number = -1;
    @Input() show: boolean = false;
    @Output() closed = new EventEmitter<void>();

    currentViewImage: ImageDTO | null = null;

    // Zoom & Pan state
    zoomLevel: number = 1;
    minZoom: number = 0.5;
    maxZoom: number = 5;
    panX: number = 0;
    panY: number = 0;
    isPanning: boolean = false;
    panStartX: number = 0;
    panStartY: number = 0;
    lastPanX: number = 0;
    lastPanY: number = 0;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['show'] || changes['selectedIndex'] || changes['images']) {
            if (this.show && this.images.length > 0 && this.selectedIndex >= 0) {
                this.currentViewImage = this.images[this.selectedIndex] || null;
                this.resetZoomPan();
                document.body.style.overflow = 'hidden';
            }
        }
    }

    closeModal(): void {
        this.resetZoomPan();
        this.currentViewImage = null;
        document.body.style.overflow = '';
        this.closed.emit();
    }

    previousImage(): void {
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
            this.currentViewImage = this.images[this.selectedIndex];
            this.resetZoomPan();
        }
    }

    nextImage(): void {
        if (this.selectedIndex < this.images.length - 1) {
            this.selectedIndex++;
            this.currentViewImage = this.images[this.selectedIndex];
            this.resetZoomPan();
        }
    }

    selectThumbnail(index: number): void {
        this.selectedIndex = index;
        this.currentViewImage = this.images[index];
        this.resetZoomPan();
    }

    // Zoom & Pan methods
    resetZoomPan(): void {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.lastPanX = 0;
        this.lastPanY = 0;
        this.isPanning = false;
    }

    zoomIn(): void {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel = Math.min(this.zoomLevel + 0.5, this.maxZoom);
            if (this.zoomLevel === 1) {
                this.panX = 0;
                this.panY = 0;
                this.lastPanX = 0;
                this.lastPanY = 0;
            }
        }
    }

    zoomOut(): void {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel = Math.max(this.zoomLevel - 0.5, this.minZoom);
            if (this.zoomLevel <= 1) {
                this.panX = 0;
                this.panY = 0;
                this.lastPanX = 0;
                this.lastPanY = 0;
            }
        }
    }

    resetZoom(): void {
        this.resetZoomPan();
    }

    onImageWheel(event: WheelEvent): void {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    onPanStart(event: MouseEvent): void {
        if (this.zoomLevel > 1) {
            event.preventDefault();
            this.isPanning = true;
            this.panStartX = event.clientX;
            this.panStartY = event.clientY;
        }
    }

    onPanMove(event: MouseEvent): void {
        if (this.isPanning && this.zoomLevel > 1) {
            event.preventDefault();
            const dx = event.clientX - this.panStartX;
            const dy = event.clientY - this.panStartY;
            this.panX = this.lastPanX + dx;
            this.panY = this.lastPanY + dy;
        }
    }

    onPanEnd(): void {
        if (this.isPanning) {
            this.isPanning = false;
            this.lastPanX = this.panX;
            this.lastPanY = this.panY;
        }
    }

    onTouchStart(event: TouchEvent): void {
        if (this.zoomLevel > 1 && event.touches.length === 1) {
            this.isPanning = true;
            this.panStartX = event.touches[0].clientX;
            this.panStartY = event.touches[0].clientY;
        }
    }

    onTouchMove(event: TouchEvent): void {
        if (this.isPanning && this.zoomLevel > 1 && event.touches.length === 1) {
            event.preventDefault();
            const dx = event.touches[0].clientX - this.panStartX;
            const dy = event.touches[0].clientY - this.panStartY;
            this.panX = this.lastPanX + dx;
            this.panY = this.lastPanY + dy;
        }
    }

    onTouchEnd(): void {
        this.onPanEnd();
    }

    getImageTransform(): string {
        return `scale(${this.zoomLevel}) translate(${this.panX / this.zoomLevel}px, ${this.panY / this.zoomLevel}px)`;
    }

    getZoomPercent(): number {
        return Math.round(this.zoomLevel * 100);
    }

    downloadImage(): void {
        if (!this.currentViewImage) return;
        const url = this.currentViewImage.url;
        const fileName = this.currentViewImage.fileName || 'image.jpg';

        fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => {
                window.open(url, '_blank');
            });
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (!this.show) return;

        switch (event.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousImage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextImage();
                break;
            case '+':
            case '=':
                event.preventDefault();
                this.zoomIn();
                break;
            case '-':
                event.preventDefault();
                this.zoomOut();
                break;
            case '0':
                event.preventDefault();
                this.resetZoom();
                break;
        }
    }
}

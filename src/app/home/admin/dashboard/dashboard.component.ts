import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../../../../services/socket-service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface TruckData {
    truckID: number;
    truckNo: string;
    countCompletedTrip: number;
}

interface TruckStatistics {
    totalCompletedOrder: number;
    mostTrip: TruckData;
    leastTrip: TruckData;
    topTrucks: TruckData[];
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatIcon, MatIconModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
    truckStatistics: TruckStatistics | null = null;
    isConnected: boolean = false;
    lastUpdated: Date = new Date();
    avgPerformance: number = 0;

    // ViewChild để truy cập DOM elements nếu cần
    @ViewChild('dashboardContainer', { static: false }) dashboardContainer!: ElementRef;

    // Subscriptions để cleanup
    private dataSubscription?: Subscription;
    private statusSubscription?: Subscription;

    constructor(private wsService: WebSocketService, private router: Router) {}

    ngOnInit(): void {
        this.initializeWebSocket();
    }

    ngOnDestroy(): void {
        this.cleanup();
    }

    /**
     * Khởi tạo WebSocket connection và subscriptions
     */
    private initializeWebSocket(): void {
        try {
            this.wsService.connect();

            // Subscribe to data
            this.dataSubscription = this.wsService.getData().subscribe({
                next: (data) => {
                    this.handleWebSocketData(data);
                },
                error: (error) => {
                    console.error('❌ WebSocket Error:', error);
                    this.isConnected = false;
                },
            });
        } catch (error) {
            console.error('❌ Failed to initialize WebSocket:', error);
        }
    }

    /**
     * Xử lý dữ liệu từ WebSocket
     */
    private handleWebSocketData(data: any): void {
        console.log('📦 Nhận data từ WebSocket:', data);

        try {
            this.truckStatistics = data as TruckStatistics;
            this.lastUpdated = new Date();
            this.isConnected = true;
            this.calculatePerformanceMetrics();

            console.log('✅ Data processed successfully:', this.truckStatistics);
        } catch (error) {
            console.error('❌ Error processing WebSocket data:', error);
        }
    }

    /**
     * Tính toán các chỉ số hiệu suất từ data thật
     */
    private calculatePerformanceMetrics(): void {
        if (!this.truckStatistics?.topTrucks?.length) return;

        const totalTrips = this.truckStatistics.topTrucks.reduce((sum, truck) => sum + truck.countCompletedTrip, 0);

        this.avgPerformance = Number((totalTrips / this.truckStatistics.topTrucks.length).toFixed(1));
    }

    /**
     * Cleanup resources
     */
    private cleanup(): void {
        console.log('🧹 Cleaning up Dashboard component...');

        // Unsubscribe để tránh memory leak
        this.dataSubscription?.unsubscribe();
        this.statusSubscription?.unsubscribe();

        // Đóng WebSocket connection
        this.wsService.disconnect();
    }

    /**
     * Retry connection khi có lỗi
     */
    onRetryConnection(): void {
        console.log('🔄 Retrying WebSocket connection...');
        this.cleanup();
        setTimeout(() => {
            this.initializeWebSocket();
        }, 1000);
    }

    /**
     * Refresh data manually
     */
    onRefreshData(): void {
        console.log('🔄 Manual refresh requested...');
        this.lastUpdated = new Date();
        // WebSocket sẽ tự động gửi data mới
    }

    /**
     * Track function cho ngFor để optimize performance
     */
    trackByTruckId(index: number, truck: TruckData): number {
        return truck.truckID;
    }

    /**
     * Get truck rank display dựa trên data thật
     */
    getTruckRank(index: number): string {
        const ranks = ['🥇', '🥈', '🥉'];
        return ranks[index] || `${index + 1}`;
    }

    /**
     * Get truck performance class for styling dựa trên vị trí thật
     */
    getTruckPerformanceClass(index: number): string {
        if (index === 0) return 'rank-gold';
        if (index === 1) return 'rank-silver';
        if (index === 2) return 'rank-bronze';
        return 'rank-default';
    }

    /**
     * Format time ago từ lastUpdated thật
     */
    getTimeAgo(): string {
        const now = new Date();
        const diff = now.getTime() - this.lastUpdated.getTime();
        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) return `${seconds} giây trước`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
        return `${Math.floor(seconds / 3600)} giờ trước`;
    }

    /**
     * Check if data is fresh (updated within last 30 seconds)
     */
    isDataFresh(): boolean {
        const now = new Date();
        const diff = now.getTime() - this.lastUpdated.getTime();
        return diff < 30000; // 30 seconds
    }

    /**
     * Get connection status display
     */
    getConnectionStatusClass(): string {
        return this.isConnected ? 'status-connected' : 'status-disconnected';
    }

    /**
     * Handle truck item click
     */
    onTruckClick(truck: TruckData, event: Event): void {
        event.preventDefault();
        console.log('🚛 Truck clicked:', truck);
        // Có thể navigate đến trang chi tiết xe hoặc hiển thị modal
    }

    /**
     * Handle view mode selector change
     */
    onViewChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        if (value === 'maintenance') {
            this.router.navigate(['/admin/dashboard/maintenance']);
        }
    }

    /**
     * Handle stat card click
     */
    onStatCardClick(statType: string, event: Event): void {
        event.preventDefault();
        console.log('📊 Stat card clicked:', statType);
        // Có thể hiển thị chi tiết thống kê
    }

    /**
     * Tính số xe xuất sắc (>= 3 chuyến) từ data thật
     */
    getExcellentCount(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.filter((truck) => truck.countCompletedTrip >= 3).length;
    }

    /**
     * Tính số xe tốt (2 chuyến) từ data thật
     */
    getGoodCount(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.filter((truck) => truck.countCompletedTrip === 2).length;
    }

    /**
     * Tính số xe trung bình (1 chuyến) từ data thật
     */
    getAverageCount(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.filter((truck) => truck.countCompletedTrip === 1).length;
    }

    /**
     * Tính tổng số chuyến từ data thật
     */
    getTotalTrips(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.reduce((sum, truck) => sum + truck.countCompletedTrip, 0);
    }
}

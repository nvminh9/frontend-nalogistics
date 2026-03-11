import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../../../../../services/socket-service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

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
    selector: 'app-dashboard-truck-statistics',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './dashboard-truck-statistics.component.html',
    styleUrl: './dashboard-truck-statistics.component.css',
})
export class DashboardTruckStatisticsComponent implements OnInit, OnDestroy {
    truckStatistics: TruckStatistics | null = null;
    isConnected: boolean = false;
    lastUpdated: Date = new Date();
    avgPerformance: number = 0;

    @ViewChild('dashboardContainer', { static: false }) dashboardContainer!: ElementRef;

    private dataSubscription?: Subscription;
    private statusSubscription?: Subscription;

    constructor(private wsService: WebSocketService) {}

    ngOnInit(): void {
        this.initializeWebSocket();
    }

    ngOnDestroy(): void {
        this.cleanup();
    }

    private initializeWebSocket(): void {
        try {
            this.wsService.connect();

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

    private handleWebSocketData(data: any): void {
        try {
            this.truckStatistics = data as TruckStatistics;
            this.lastUpdated = new Date();
            this.isConnected = true;
            this.calculatePerformanceMetrics();
        } catch (error) {
            console.error('❌ Error processing WebSocket data:', error);
        }
    }

    private calculatePerformanceMetrics(): void {
        if (!this.truckStatistics?.topTrucks?.length) return;
        const totalTrips = this.truckStatistics.topTrucks.reduce((sum, truck) => sum + truck.countCompletedTrip, 0);
        this.avgPerformance = Number((totalTrips / this.truckStatistics.topTrucks.length).toFixed(1));
    }

    private cleanup(): void {
        this.dataSubscription?.unsubscribe();
        this.statusSubscription?.unsubscribe();
        this.wsService.disconnect();
    }

    onRetryConnection(): void {
        this.cleanup();
        setTimeout(() => {
            this.initializeWebSocket();
        }, 1000);
    }

    onRefreshData(): void {
        this.lastUpdated = new Date();
    }

    trackByTruckId(index: number, truck: TruckData): number {
        return truck.truckID;
    }

    getTruckRank(index: number): string {
        const ranks = ['🥇', '🥈', '🥉'];
        return ranks[index] || `${index + 1}`;
    }

    getTruckPerformanceClass(index: number): string {
        if (index === 0) return 'rank-gold';
        if (index === 1) return 'rank-silver';
        if (index === 2) return 'rank-bronze';
        return 'rank-default';
    }

    getTimeAgo(): string {
        const now = new Date();
        const diff = now.getTime() - this.lastUpdated.getTime();
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${seconds} giây trước`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
        return `${Math.floor(seconds / 3600)} giờ trước`;
    }

    getConnectionStatusClass(): string {
        return this.isConnected ? 'status-connected' : 'status-disconnected';
    }

    onTruckClick(truck: TruckData, event: Event): void {
        event.preventDefault();
    }

    onStatCardClick(statType: string, event: Event): void {
        event.preventDefault();
    }

    getExcellentCount(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.filter((truck) => truck.countCompletedTrip >= 3).length;
    }

    getGoodCount(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.filter((truck) => truck.countCompletedTrip === 2).length;
    }

    getAverageCount(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.filter((truck) => truck.countCompletedTrip === 1).length;
    }

    getTotalTrips(): number {
        if (!this.truckStatistics?.topTrucks) return 0;
        return this.truckStatistics.topTrucks.reduce((sum, truck) => sum + truck.countCompletedTrip, 0);
    }
}

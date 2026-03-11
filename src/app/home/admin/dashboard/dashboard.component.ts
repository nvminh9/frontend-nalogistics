import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterOutlet, MatIconModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
    constructor(private router: Router) {}

    onViewChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        const routes: Record<string, string> = {
            'truck-statistics': '/admin/dashboard',
            maintenance: '/admin/dashboard/maintenance',
        };
        if (routes[value]) {
            this.router.navigate([routes[value]]);
        }
    }
}

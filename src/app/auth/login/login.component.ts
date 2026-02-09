import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../services/auth-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    constructor(
        private router: Router,
        private auth_service: AuthServiceService,
        private toastr: ToastrService,
    ) {}

    Login(username: string, password: string) {
        this.auth_service.Login(username, password).subscribe((data: any) => {
            if (data.statusCode == 200) {
                this.toastr.success(data.message);

                // console.log(data);
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('roleName', data.data.roleName);

                if (data.data.roleName == 'Admin' && localStorage.getItem('token')) {
                    this.router.navigate(['/admin/dashboard']);
                } else if (data.data.roleName == 'Entry' && localStorage.getItem('token')) {
                    this.router.navigate(['/entry/create-order']);
                } else if (data.data.roleName == 'Operator' && localStorage.getItem('token')) {
                    this.router.navigate(['/admin/list-order']);
                } else if (data.data.roleName == 'Accountant' && localStorage.getItem('token')) {
                    this.router.navigate(['/admin/list-order']);
                } else if (data.data.roleName == 'Approver' && localStorage.getItem('token')) {
                    this.router.navigate(['/admin/list-order']);
                }
            } else if (data.statusCode == 400) this.toastr.error(data.message);
            else console.log(data.message);
        });
    }
}

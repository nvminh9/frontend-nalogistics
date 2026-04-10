import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const auth_service = inject(AuthServiceService);
  const toastr = inject(ToastrService);


  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem("token");
    if (token) {
      auth_service.CheckToken(token).subscribe((data: any) => {
        if (data.statusCode == 200 && data.data == true) {
          return true;
        } else if (data.statusCode == 400 && data.data == false) {
          router.navigate(['/login']);
          return false;
        } else {
          router.navigate(['/login']);
          return false;
        }
      })
    } else {
      router.navigate(['/login']);
      return false;
    }
  }

  // nếu là server thì cho qua (hoặc xử lý khác)
  return true;
};
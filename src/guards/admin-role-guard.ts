import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const adminRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth_service = inject(AuthServiceService);
  const toast = inject(ToastrService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem("token") || '';
    return auth_service.CheckToken(token).pipe(
      map(data => {
        if (data.data.dataToken.RoleName == "Entry" && data.data.dataToken.RoleID == 5) {
          return true;
        } else {
          localStorage.removeItem('token');
          toast.error("Bạn không phải là Entry");
          router.navigate(['/login']);
          return false;
        }
      })
    );
  } else {
    router.navigate(['/login']);
    return false;
  }

};

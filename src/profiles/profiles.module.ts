import { Module } from '@nestjs/common';
import { PatientsProfileController } from './controllers/patients-profile.controller';
import { DoctorsProfileController } from './controllers/doctors-profile.controller';
import { StaffProfileController } from './controllers/staff-profile.controller';
import { PatientsProfileService } from './services/patients-profile.service';
import { DoctorsProfileService } from './services/doctors-profile.service';
import { StaffProfileService } from './services/staff-profile.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UsersService } from 'src/users/services/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        UsersModule   ,
        AuthModule  
    ],
  controllers: [
    PatientsProfileController,
    DoctorsProfileController,
    StaffProfileController,
  ],
  providers: [
                JwtStrategy,
                AuthGuard,

    PatientsProfileService,
    DoctorsProfileService,
    StaffProfileService,
  ],
  exports: [
    PatientsProfileService,
    DoctorsProfileService,
    StaffProfileService,
  ],
})
export class ProfilesModule {}
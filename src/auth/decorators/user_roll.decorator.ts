import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/userRole";

export const userRoles =(...roles : UserRole[])=> SetMetadata('roles', roles);
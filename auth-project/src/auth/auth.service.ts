import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../common/decorators/roles.decorator';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    // Public registration always creates a USER role
    const user = await this.usersService.create({ ...dto, role: Role.USER });
    return this.signToken(user);
  }

  async registerSuperAdmin(dto: CreateUserDto) {
    const exists = await this.usersService.superAdminExists();
    if (exists) throw new ForbiddenException('Super admin already exists');
    const user = await this.usersService.create({ ...dto, role: Role.SUPER_ADMIN });
    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(user);
  }

  private signToken(user: UserDocument) {
    const payload = {
      sub: user._id as unknown as string,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
    };
  }
}

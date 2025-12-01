import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class WhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.isWhitelisted) {
      throw new ForbiddenException({
        message: 'Access denied: You need to be whitelisted to access this application.',
        code: 'NOT_WHITELISTED',
        contactEmail: 'justaryaid@gmail.com',
      });
    }

    return true;
  }
}

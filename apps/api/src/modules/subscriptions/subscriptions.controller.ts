import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  getMine(@Req() req: any) {
    return this.subscriptionsService.getForCurrentUser(req.user);
  }

  @Post()
  upsert(@Req() req: any, @Body() body: any) {
    return this.subscriptionsService.upsertForCurrentUser(req.user, body);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  listAll(@Req() req: any) {
    return this.subscriptionsService.listAll(req.user);
  }
}

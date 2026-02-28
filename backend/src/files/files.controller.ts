import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  list(@Req() req: any) {
    return this.filesService.listForUser(req.user);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.filesService.createForUser(req.user, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.filesService.deleteForUser(req.user, id);
  }
}
